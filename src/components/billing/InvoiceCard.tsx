/**
 * InvoiceCard Component
 * 
 * Displays a single invoice card with key information
 * and quick actions.
 * 
 * @module components/billing/InvoiceCard
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import type { InvoiceWithDetails, InvoiceStatus } from '../../types/database';
import { FileText, Download, Eye, CreditCard } from 'lucide-react';

interface InvoiceCardProps {
  invoice: InvoiceWithDetails;
  onView?: (invoice: InvoiceWithDetails) => void;
  onPayment?: (invoice: InvoiceWithDetails) => void;
  onDownload?: (invoice: InvoiceWithDetails) => void;
}

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-500',
  pending: 'bg-yellow-500',
  paid: 'bg-green-500',
  partially_paid: 'bg-blue-500',
  overdue: 'bg-red-500',
};

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
};

export function InvoiceCard({ invoice, onView, onPayment, onDownload }: InvoiceCardProps) {
  const guestName = invoice.reservation?.guest
    ? `${invoice.reservation.guest.first_name} ${invoice.reservation.guest.last_name}`
    : 'Unknown Guest';

  const roomNumber = invoice.reservation?.room?.room_number || 'N/A';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
            <p className="text-sm text-gray-600">{guestName}</p>
          </div>
        </div>
        <Badge className={statusColors[invoice.status]}>
          {statusLabels[invoice.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Room</p>
          <p className="font-medium">{roomNumber}</p>
        </div>
        <div>
          <p className="text-gray-600">Issue Date</p>
          <p className="font-medium">{formatDate(invoice.issue_date)}</p>
        </div>
        <div>
          <p className="text-gray-600">Due Date</p>
          <p className="font-medium">{formatDate(invoice.due_date)}</p>
        </div>
        <div>
          <p className="text-gray-600">Status</p>
          <p className="font-medium">{statusLabels[invoice.status]}</p>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Tax (16%)</span>
          <span>{formatCurrency(invoice.tax_amount)}</span>
        </div>
        {invoice.discount_amount > 0 && (
          <div className="flex justify-between items-center mb-2 text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(invoice.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>{formatCurrency(invoice.total_amount)}</span>
        </div>
        {invoice.balance_due !== undefined && invoice.balance_due > 0 && (
          <div className="flex justify-between items-center mt-2 text-red-600">
            <span>Balance Due</span>
            <span className="font-semibold">{formatCurrency(invoice.balance_due)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {onView && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(invoice)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        )}
        {onPayment && invoice.balance_due && invoice.balance_due > 0 && (
          <Button size="sm" className="flex-1" onClick={() => onPayment(invoice)}>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay
          </Button>
        )}
        {onDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(invoice)}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
