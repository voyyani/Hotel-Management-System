/**
 * useInvoices Hook
 * 
 * Custom hook for managing invoices with full CRUD operations,
 * line items management, and invoice generation.
 * 
 * Features:
 * - Fetch invoices with filters
 * - Create invoices with automatic line items
 * - Update invoice status
 * - Add/remove line items
 * - Calculate totals
 * - Real-time invoice updates
 * 
 * @module hooks/useInvoices
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type {
  Invoice,
  InvoiceInsert,
  InvoiceUpdate,
  InvoiceWithDetails,
  InvoiceLineItem,
  InvoiceLineItemInsert,
  InvoiceFilters,
  RoomChargeCalculation,
} from '../types/database';

export function useInvoices(filters?: InvoiceFilters) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch invoices with optional filters
   */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('invoices')
        .select(`
          *,
          reservation:reservations (
            id,
            guest_id,
            room_id,
            check_in_date,
            check_out_date,
            guest:guests (
              id,
              first_name,
              last_name,
              email,
              phone
            ),
            room:rooms (
              id,
              room_number,
              room_type:room_types (
                id,
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.invoice_number) {
        query = query.ilike('invoice_number', `%${filters.invoice_number}%`);
      }

      if (filters?.from_date) {
        query = query.gte('issue_date', filters.from_date);
      }

      if (filters?.to_date) {
        query = query.lte('issue_date', filters.to_date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch line items and payments for each invoice
      const invoicesWithDetails = await Promise.all(
        (data || []).map(async (invoice) => {
          const [lineItemsResult, paymentsResult] = await Promise.all([
            supabase
              .from('invoice_line_items')
              .select('*')
              .eq('invoice_id', invoice.id)
              .order('posting_date', { ascending: true }),
            supabase
              .from('payments')
              .select('*')
              .eq('invoice_id', invoice.id)
              .eq('status', 'completed')
              .order('payment_date', { ascending: true }),
          ]);

          const total_paid = paymentsResult.data?.reduce(
            (sum, payment) => sum + payment.amount,
            0
          ) || 0;

          return {
            ...invoice,
            line_items: lineItemsResult.data || [],
            payments: paymentsResult.data || [],
            total_paid,
            balance_due: invoice.total_amount - total_paid,
          } as InvoiceWithDetails;
        })
      );

      // Apply guest name filter if provided
      let filteredInvoices = invoicesWithDetails;
      if (filters?.guest_name) {
        const searchTerm = filters.guest_name.toLowerCase();
        filteredInvoices = invoicesWithDetails.filter((invoice) => {
          const guest = invoice.reservation?.guest;
          if (!guest) return false;
          const fullName = `${guest.first_name} ${guest.last_name}`.toLowerCase();
          return fullName.includes(searchTerm);
        });
      }

      // Apply balance filter
      if (filters?.has_balance !== undefined) {
        filteredInvoices = filteredInvoices.filter((invoice) =>
          filters.has_balance 
            ? (invoice.balance_due || 0) > 0 
            : (invoice.balance_due || 0) === 0
        );
      }

      setInvoices(filteredInvoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate room charges with pricing rules
   */
  const calculateRoomCharges = async (
    roomTypeId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<RoomChargeCalculation | null> => {
    try {
      const { data, error: calcError } = await supabase.rpc('calculate_room_charges', {
        p_room_type_id: roomTypeId,
        p_check_in_date: checkInDate,
        p_check_out_date: checkOutDate,
      });

      if (calcError) throw calcError;

      return data[0] || null;
    } catch (err) {
      console.error('Error calculating room charges:', err);
      return null;
    }
  };

  /**
   * Create invoice for a reservation
   */
  const createInvoiceForReservation = async (
    reservationId: string,
    taxRate: number = 16.0
  ): Promise<string | null> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error: createError } = await supabase.rpc(
        'create_invoice_for_reservation',
        {
          p_reservation_id: reservationId,
          p_tax_rate: taxRate,
        }
      );

      if (createError) throw createError;

      await fetchInvoices();
      return data;
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      return null;
    }
  };

  /**
   * Create manual invoice
   */
  const createInvoice = async (
    invoiceData: Omit<InvoiceInsert, 'invoice_number' | 'issue_date'>
  ): Promise<Invoice | null> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

      const { data, error: insertError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          issue_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchInvoices();
      return data;
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      return null;
    }
  };

  /**
   * Update invoice
   */
  const updateInvoice = async (
    invoiceId: string,
    updates: InvoiceUpdate
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      await fetchInvoices();
      return true;
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      return false;
    }
  };

  /**
   * Add line item to invoice
   */
  const addLineItem = async (
    lineItem: InvoiceLineItemInsert
  ): Promise<InvoiceLineItem | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('invoice_line_items')
        .insert(lineItem)
        .select()
        .single();

      if (insertError) throw insertError;

      // Recalculate invoice totals
      await recalculateInvoiceTotals(lineItem.invoice_id);

      return data;
    } catch (err) {
      console.error('Error adding line item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add line item');
      return null;
    }
  };

  /**
   * Remove line item from invoice
   */
  const removeLineItem = async (lineItemId: string, invoiceId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('invoice_line_items')
        .delete()
        .eq('id', lineItemId);

      if (deleteError) throw deleteError;

      // Recalculate invoice totals
      await recalculateInvoiceTotals(invoiceId);

      return true;
    } catch (err) {
      console.error('Error removing line item:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove line item');
      return false;
    }
  };

  /**
   * Recalculate invoice totals based on line items
   */
  const recalculateInvoiceTotals = async (invoiceId: string): Promise<boolean> => {
    try {
      // Fetch all line items
      const { data: lineItems, error: fetchError } = await supabase
        .from('invoice_line_items')
        .select('total_price, tax_amount')
        .eq('invoice_id', invoiceId);

      if (fetchError) throw fetchError;

      const subtotal = lineItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;
      const tax_amount = lineItems?.reduce((sum, item) => sum + item.tax_amount, 0) || 0;

      // Get current discount
      const { data: invoice } = await supabase
        .from('invoices')
        .select('discount_amount')
        .eq('id', invoiceId)
        .single();

      const discount_amount = invoice?.discount_amount || 0;
      const total_amount = subtotal + tax_amount - discount_amount;

      // Update invoice
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          subtotal,
          tax_amount,
          total_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      await fetchInvoices();
      return true;
    } catch (err) {
      console.error('Error recalculating invoice totals:', err);
      return false;
    }
  };

  /**
   * Get single invoice by ID
   */
  const getInvoiceById = (invoiceId: string): InvoiceWithDetails | undefined => {
    return invoices.find((inv) => inv.id === invoiceId);
  };

  /**
   * Get invoices for a reservation
   */
  const getInvoicesByReservation = (reservationId: string): InvoiceWithDetails[] => {
    return invoices.filter((inv) => inv.reservation_id === reservationId);
  };

  // Fetch invoices on mount and when filters change
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, JSON.stringify(filters)]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('invoices_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
        },
        () => {
          fetchInvoices();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    calculateRoomCharges,
    createInvoice,
    createInvoiceForReservation,
    updateInvoice,
    addLineItem,
    removeLineItem,
    recalculateInvoiceTotals,
    getInvoiceById,
    getInvoicesByReservation,
  };
}
