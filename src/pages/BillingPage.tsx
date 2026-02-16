/**
 * BillingPage Component
 * 
 * Main billing and invoices management page.
 * 
 * Features:
 * - Invoice listing and filtering
 * - Payment processing
 * - Outstanding balances
 * - Financial reports quick access
 * 
 * @module pages/BillingPage
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { useState, useEffect } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { usePayments } from '../hooks/usePayments';
import { useFinancialReports } from '../hooks/useFinancialReports';
import { InvoiceCard } from '../components/billing/InvoiceCard';
import { PaymentForm } from '../components/billing/PaymentForm';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Tabs } from '../components/ui/tabs';
import type { InvoiceWithDetails, InvoiceStatus, PaymentSummary } from '../types/database';
import {
  FileText,
  Search,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
} from 'lucide-react';

export function BillingPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'outstanding' | 'reports'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);

  const { invoices, loading: invoicesLoading, fetchInvoices } = useInvoices({
    status: statusFilter,
    guest_name: searchTerm,
  });

  const { processSplitPayment } = usePayments();
  const { getPaymentSummary, exportToCSV } = useFinancialReports();

  useEffect(() => {
    loadPaymentSummary();
  }, []);

  const loadPaymentSummary = async () => {
    const summary = await getPaymentSummary();
    setPaymentSummary(summary);
  };

  const handlePayment = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async (payments: any[]) => {
    if (!selectedInvoice) return;

    const success = await processSplitPayment(
      selectedInvoice.id,
      payments.map((p) => ({
        amount: p.amount,
        payment_method: p.payment_method,
        transaction_ref: p.transaction_ref || undefined,
        notes: p.notes || undefined,
      }))
    );

    if (success) {
      setShowPaymentDialog(false);
      setSelectedInvoice(null);
      await fetchInvoices();
      await loadPaymentSummary();
    }
  };

  const handleExportInvoices = () => {
    const exportData = invoices.map((inv) => ({
      invoice_number: inv.invoice_number,
      guest_name: inv.reservation?.guest
        ? `${inv.reservation.guest.first_name} ${inv.reservation.guest.last_name}`
        : 'N/A',
      room: inv.reservation?.room?.room_number || 'N/A',
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      subtotal: inv.subtotal,
      tax: inv.tax_amount,
      total: inv.total_amount,
      paid: inv.total_paid || 0,
      balance: inv.balance_due || 0,
      status: inv.status,
    }));

    exportToCSV(exportData, 'invoices');
  };

  const handleDownloadReceipt = async (invoice: InvoiceWithDetails) => {
    // TODO: Implement PDF receipt generation
    console.log('Download receipt for:', invoice.invoice_number);
    alert('Receipt download feature coming soon!');
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);

  const outstandingInvoices = invoices.filter(
    (inv) => inv.balance_due && inv.balance_due > 0
  );

  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-gray-600">Manage invoices and process payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportInvoices}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => fetchInvoices()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {paymentSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentSummary.today_revenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Month's Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(paymentSummary.month_revenue)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(paymentSummary.outstanding_balance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {outstandingInvoices.length} invoices
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-5 w-5 inline-block mr-2" />
              All Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('outstanding')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outstanding'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="h-5 w-5 inline-block mr-2" />
              Outstanding ({outstandingInvoices.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Invoices
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by guest name or invoice number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Invoice Lists */}
        <div className="mt-6">
          {invoicesLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-4">Loading invoices...</p>
            </div>
          ) : activeTab === 'invoices' ? (
            invoices.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Found</h3>
                <p className="text-gray-600">
                  No invoices match your search criteria.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onPayment={handlePayment}
                    onDownload={handleDownloadReceipt}
                  />
                ))}
              </div>
            )
          ) : (
            // Outstanding tab
            outstandingInvoices.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-gray-600">
                  There are no outstanding invoices at the moment.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {overdueInvoices.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4">
                      Overdue ({overdueInvoices.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {overdueInvoices.map((invoice) => (
                        <InvoiceCard
                          key={invoice.id}
                          invoice={invoice}
                          onPayment={handlePayment}
                          onDownload={handleDownloadReceipt}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pending Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {outstandingInvoices
                      .filter((inv) => inv.status !== 'overdue')
                      .map((invoice) => (
                        <InvoiceCard
                          key={invoice.id}
                          invoice={invoice}
                          onPayment={handlePayment}
                          onDownload={handleDownloadReceipt}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </Tabs>

      {/* Payment Dialog */}
      {showPaymentDialog && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Process Payment</h2>
              <p className="text-gray-600 mt-1">Invoice: {selectedInvoice.invoice_number}</p>
            </div>
            <div className="p-6">
              <PaymentForm
                invoiceId={selectedInvoice.id}
                totalAmount={selectedInvoice.total_amount}
                balanceDue={selectedInvoice.balance_due || selectedInvoice.total_amount}
                onSubmit={handlePaymentSubmit}
                onCancel={() => {
                  setShowPaymentDialog(false);
                  setSelectedInvoice(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
