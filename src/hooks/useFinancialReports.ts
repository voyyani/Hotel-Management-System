/**
 * useFinancialReports Hook
 * 
 * Custom hook for generating financial reports and analytics.
 * 
 * Features:
 * - Daily revenue summary
 * - Payment method breakdown
 * - Outstanding balances
 * - Revenue by room type
 * - Tax reports
 * - Financial transactions view
 * - Export capabilities
 * 
 * @module hooks/useFinancialReports
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type {
  DailyRevenueSummary,
  OutstandingBalance,
  RevenueByRoomType,
  FinancialTransaction,
  PaymentSummary,
} from '../types/database';

interface DateRange {
  from_date: string
  to_date: string
}

export function useFinancialReports() {
  // const _user = useAuth().user; // Prefix with _ to indicate intentionally unused
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get daily revenue summary
   */
  const getDailyRevenue = async (
    dateRange?: DateRange
  ): Promise<DailyRevenueSummary[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('daily_revenue_summary')
        .select('*')
        .order('business_date', { ascending: false });

      if (dateRange?.from_date) {
        query = query.gte('business_date', dateRange.from_date);
      }

      if (dateRange?.to_date) {
        query = query.lte('business_date', dateRange.to_date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      console.error('Error fetching daily revenue:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch daily revenue');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get outstanding balances
   */
  const getOutstandingBalances = async (): Promise<OutstandingBalance[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('outstanding_balances')
        .select('*')
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      console.error('Error fetching outstanding balances:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch outstanding balances'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get revenue by room type
   */
  const getRevenueByRoomType = async (
    dateRange?: DateRange
  ): Promise<RevenueByRoomType[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('revenue_by_room_type')
        .select('*')
        .order('month', { ascending: false });

      if (dateRange?.from_date) {
        query = query.gte('month', dateRange.from_date);
      }

      if (dateRange?.to_date) {
        query = query.lte('month', dateRange.to_date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      console.error('Error fetching revenue by room type:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch revenue by room type'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get financial transactions
   */
  const getFinancialTransactions = async (
    dateRange?: DateRange
  ): Promise<FinancialTransaction[]> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (dateRange?.from_date) {
        query = query.gte('transaction_date', dateRange.from_date);
      }

      if (dateRange?.to_date) {
        query = query.lte('transaction_date', dateRange.to_date);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      console.error('Error fetching financial transactions:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch financial transactions'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get payment summary for dashboard
   */
  const getPaymentSummary = async (): Promise<PaymentSummary> => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split('T')[0];

      // Get today's revenue
      const { data: todayRevenue } = await supabase
        .from('daily_revenue_summary')
        .select('total_revenue')
        .eq('business_date', today)
        .single();

      // Get month's revenue
      const { data: monthRevenue } = await supabase
        .from('daily_revenue_summary')
        .select('total_revenue')
        .gte('business_date', firstDayOfMonth)
        .lte('business_date', today);

      const month_revenue =
        monthRevenue?.reduce((sum, day) => sum + day.total_revenue, 0) || 0;

      // Get outstanding balances
      const { data: balances } = await supabase
        .from('outstanding_balances')
        .select('balance_due');

      const outstanding_balance =
        balances?.reduce((sum, b) => sum + b.balance_due, 0) || 0;

      // Get payment method breakdown for today
      const { data: todayBreakdown } = await supabase
        .from('daily_revenue_summary')
        .select('*')
        .eq('business_date', today)
        .single();

      return {
        today_revenue: todayRevenue?.total_revenue || 0,
        month_revenue,
        outstanding_balance,
        payment_method_breakdown: {
          cash: todayBreakdown?.cash_total || 0,
          credit_card: todayBreakdown?.credit_card_total || 0,
          debit_card: todayBreakdown?.debit_card_total || 0,
          bank_transfer: todayBreakdown?.bank_transfer_total || 0,
          other: todayBreakdown?.other_total || 0,
        },
      };
    } catch (err) {
      console.error('Error fetching payment summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment summary');
      return {
        today_revenue: 0,
        month_revenue: 0,
        outstanding_balance: 0,
        payment_method_breakdown: {
          cash: 0,
          credit_card: 0,
          debit_card: 0,
          bank_transfer: 0,
          other: 0,
        },
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get tax report
   */
  const getTaxReport = async (dateRange: DateRange) => {
    try {
      setLoading(true);
      setError(null);

      const { data: invoices, error: fetchError } = await supabase
        .from('invoices')
        .select('subtotal, tax_amount, total_amount, issue_date, status')
        .gte('issue_date', dateRange.from_date)
        .lte('issue_date', dateRange.to_date)
        .in('status', ['paid', 'partially_paid']);

      if (fetchError) throw fetchError;

      const total_sales = invoices?.reduce((sum, inv) => sum + inv.subtotal, 0) || 0;
      const total_tax = invoices?.reduce((sum, inv) => sum + inv.tax_amount, 0) || 0;
      const total_amount = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

      return {
        period: dateRange,
        total_sales,
        total_tax,
        total_amount,
        invoice_count: invoices?.length || 0,
        invoices: invoices || [],
      };
    } catch (err) {
      console.error('Error generating tax report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate tax report');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export report to CSV
   */
  const exportToCSV = (data: any[], filename: string) => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Get headers from first object
      const headers = Object.keys(data[0]);

      // Build CSV content
      const csvContent = [
        headers.join(','), // Header row
        ...data.map((row) =>
          headers.map((header) => {
            const value = row[header];
            // Escape commas and quotes in values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          }).join(',')
        ),
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      setError(err instanceof Error ? err.message : 'Failed to export to CSV');
      return false;
    }
  };

  /**
   * Generate invoice PDF (placeholder for actual implementation)
   */
  const generateInvoicePDF = async (invoiceId: string): Promise<Blob | null> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch invoice with all details
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          reservation:reservations (
            *,
            guest:guests (*),
            room:rooms (
              *,
              room_type:room_types (*)
            )
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (fetchError) throw fetchError;

      // Fetch line items
      const { data: lineItems } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('posting_date', { ascending: true });

      // Fetch payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: true });

      // TODO: Implement actual PDF generation using a library like jsPDF or pdfmake
      // For now, return null to indicate feature under development
      console.log('PDF generation not yet implemented', {
        invoice,
        lineItems,
        payments,
      });

      return null;
    } catch (err) {
      console.error('Error generating invoice PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invoice PDF');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDailyRevenue,
    getOutstandingBalances,
    getRevenueByRoomType,
    getFinancialTransactions,
    getPaymentSummary,
    getTaxReport,
    exportToCSV,
    generateInvoicePDF,
  };
}
