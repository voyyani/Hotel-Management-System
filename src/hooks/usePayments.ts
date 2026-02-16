/**
 * usePayments Hook
 * 
 * Custom hook for managing payments with full CRUD operations,
 * split payments, partial payments, and refund processing.
 * 
 * Features:
 * - Process payments
 * - Handle multiple payment methods
 * - Split and partial payments
 * - Refund processing
 * - Payment history
 * - Real-time payment updates
 * 
 * @module hooks/usePayments
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type {
  Payment,
  PaymentInsert,
  PaymentUpdate,
  Refund,
  PaymentFilters,
  PaymentMethod,
} from '../types/database';

interface PaymentWithInvoice extends Payment {
  invoice?: {
    id: string
    invoice_number: string
    total_amount: number
    reservation?: {
      id: string
      guest?: {
        first_name: string
        last_name: string
      }
    }
  }
  refunds?: Refund[]
}

export function usePayments(filters?: PaymentFilters) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch payments with optional filters
   */
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('payments')
        .select(`
          *,
          invoice:invoices (
            id,
            invoice_number,
            total_amount,
            reservation:reservations (
              id,
              guest:guests (
                first_name,
                last_name
              )
            )
          )
        `)
        .order('payment_date', { ascending: false });

      // Apply filters
      if (filters?.payment_method && filters.payment_method !== 'all') {
        query = query.eq('payment_method', filters.payment_method);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.from_date) {
        query = query.gte('payment_date', filters.from_date);
      }

      if (filters?.to_date) {
        query = query.lte('payment_date', filters.to_date);
      }

      if (filters?.processed_by) {
        query = query.eq('processed_by', filters.processed_by);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch refunds for each payment
      const paymentsWithRefunds = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: refundsData } = await supabase
            .from('refunds')
            .select('*')
            .eq('payment_id', payment.id)
            .order('created_at', { ascending: false });

          return {
            ...payment,
            refunds: refundsData || [],
          } as PaymentWithInvoice;
        })
      );

      setPayments(paymentsWithRefunds);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Process a new payment
   */
  const processPayment = async (
    paymentData: Omit<PaymentInsert, 'processed_by' | 'payment_date'>
  ): Promise<Payment | null> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if payment would exceed invoice total
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', paymentData.invoice_id)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      const { data: existingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', paymentData.invoice_id)
        .eq('status', 'completed');

      const totalPaid = existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      if (totalPaid + paymentData.amount > invoice.total_amount) {
        throw new Error(
          `Payment amount would exceed invoice total. Remaining balance: ${
            invoice.total_amount - totalPaid
          }`
        );
      }

      const { data, error: insertError } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          processed_by: user.id,
          payment_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchPayments();
      return data;
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      return null;
    }
  };

  /**
   * Process split payment (multiple payment methods)
   */
  const processSplitPayment = async (
    invoiceId: string,
    payments: Array<{
      amount: number
      payment_method: PaymentMethod
      transaction_ref?: string
      notes?: string
    }>
  ): Promise<boolean> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate total amount
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', invoiceId)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      const { data: existingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', invoiceId)
        .eq('status', 'completed');

      const totalPaid = existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const newPaymentTotal = payments.reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid + newPaymentTotal > invoice.total_amount) {
        throw new Error('Total payment amount exceeds invoice balance');
      }

      // Process all payments
      const paymentPromises = payments.map((payment) =>
        supabase.from('payments').insert({
          invoice_id: invoiceId,
          amount: payment.amount,
          payment_method: payment.payment_method,
          transaction_ref: payment.transaction_ref || null,
          notes: payment.notes || null,
          status: 'completed',
          processed_by: user.id,
          payment_date: new Date().toISOString(),
        })
      );

      const results = await Promise.all(paymentPromises);

      // Check if any failed
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;

      await fetchPayments();
      return true;
    } catch (err) {
      console.error('Error processing split payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to process split payment');
      return false;
    }
  };

  /**
   * Update payment status
   */
  const updatePayment = async (
    paymentId: string,
    updates: PaymentUpdate
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      await fetchPayments();
      return true;
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      return false;
    }
  };

  /**
   * Request a refund
   */
  const requestRefund = async (
    paymentId: string,
    amount: number,
    reason: string,
    refund_method: PaymentMethod,
    notes?: string
  ): Promise<Refund | null> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate refund amount
      const { data: payment } = await supabase
        .from('payments')
        .select('amount')
        .eq('id', paymentId)
        .single();

      if (!payment) throw new Error('Payment not found');

      // Check existing refunds
      const { data: existingRefunds } = await supabase
        .from('refunds')
        .select('amount')
        .eq('payment_id', paymentId)
        .eq('status', 'completed');

      const totalRefunded = existingRefunds?.reduce((sum, r) => sum + r.amount, 0) || 0;

      if (totalRefunded + amount > payment.amount) {
        throw new Error('Refund amount exceeds payment amount');
      }

      const { data, error: insertError } = await supabase
        .from('refunds')
        .insert({
          payment_id: paymentId,
          amount,
          reason,
          refund_method,
          notes: notes || null,
          status: 'pending',
          requested_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchPayments();
      return data;
    } catch (err) {
      console.error('Error requesting refund:', err);
      setError(err instanceof Error ? err.message : 'Failed to request refund');
      return null;
    }
  };

  /**
   * Approve a refund (manager/admin only)
   */
  const approveRefund = async (refundId: string): Promise<boolean> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('refunds')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', refundId);

      if (updateError) throw updateError;

      await fetchPayments();
      return true;
    } catch (err) {
      console.error('Error approving refund:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve refund');
      return false;
    }
  };

  /**
   * Process (complete) a refund
   */
  const processRefund = async (
    refundId: string,
    transactionRef?: string
  ): Promise<boolean> => {
    try {
      if (!user?.id) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('refunds')
        .update({
          status: 'completed',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          transaction_ref: transactionRef || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', refundId);

      if (updateError) throw updateError;

      await fetchPayments();
      return true;
    } catch (err) {
      console.error('Error processing refund:', err);
      setError(err instanceof Error ? err.message : 'Failed to process refund');
      return false;
    }
  };

  /**
   * Get payments for an invoice
   */
  const getPaymentsByInvoice = (invoiceId: string): PaymentWithInvoice[] => {
    return payments.filter((payment) => payment.invoice_id === invoiceId);
  };

  /**
   * Calculate total paid for an invoice
   */
  const getTotalPaidForInvoice = (invoiceId: string): number => {
    return payments
      .filter(
        (payment) =>
          payment.invoice_id === invoiceId && payment.status === 'completed'
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Fetch payments on mount and when filters change
  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user, JSON.stringify(filters)]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('payments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          fetchPayments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'refunds',
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    processPayment,
    processSplitPayment,
    updatePayment,
    requestRefund,
    approveRefund,
    processRefund,
    getPaymentsByInvoice,
    getTotalPaidForInvoice,
  };
}
