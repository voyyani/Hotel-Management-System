/**
 * PaymentForm Component
 * 
 * Form for processing payments with support for multiple payment methods,
 * split payments, and partial payments.
 * 
 * @module components/billing/PaymentForm
 * @author Grace Mawia Kamami
 * @date 2026-02-16
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import type { PaymentMethod } from '../../types/database';
import { CreditCard, DollarSign, Trash2, Plus } from 'lucide-react';

interface PaymentItem {
  id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_ref: string;
  notes: string;
}

interface PaymentFormProps {
  invoiceId: string;
  totalAmount: number;
  balanceDue: number;
  onSubmit: (payments: PaymentItem[]) => Promise<void>;
  onCancel: () => void;
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

export function PaymentForm({
  invoiceId: _invoiceId,
  totalAmount,
  balanceDue,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [payments, setPayments] = useState<PaymentItem[]>([
    {
      id: crypto.randomUUID(),
      amount: balanceDue,
      payment_method: 'cash',
      transaction_ref: '',
      notes: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPaymentAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const remainingBalance = balanceDue - totalPaymentAmount;

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      {
        id: crypto.randomUUID(),
        amount: remainingBalance > 0 ? remainingBalance : 0,
        payment_method: 'cash',
        transaction_ref: '',
        notes: '',
      },
    ]);
  };

  const handleRemovePayment = (id: string) => {
    if (payments.length > 1) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const handlePaymentChange = (
    id: string,
    field: keyof PaymentItem,
    value: string | number
  ) => {
    setPayments(
      payments.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]: field === 'amount' ? Number(value) : value,
            }
          : p
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (totalPaymentAmount <= 0) {
      setError('Total payment amount must be greater than zero');
      return;
    }

    if (totalPaymentAmount > balanceDue) {
      setError(`Payment amount cannot exceed balance due (${formatCurrency(balanceDue)})`);
      return;
    }

    for (const payment of payments) {
      if (payment.amount <= 0) {
        setError('Each payment amount must be greater than zero');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(payments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Invoice Total</span>
          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Balance Due</span>
          <span className="font-bold text-lg">{formatCurrency(balanceDue)}</span>
        </div>
        <div className="flex justify-between items-center text-lg pt-2 border-t">
          <span className="font-semibold">Payment Amount</span>
          <span
            className={`font-bold ${
              totalPaymentAmount > balanceDue ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(totalPaymentAmount)}
          </span>
        </div>
        {remainingBalance !== 0 && (
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Remaining Balance</span>
            <span className="text-sm font-medium">
              {formatCurrency(Math.abs(remainingBalance))}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Payment Details</h3>
          {payments.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPayment}
              disabled={remainingBalance <= 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Split Payment
            </Button>
          )}
        </div>

        {payments.map((payment, index) => (
          <Card key={payment.id} className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Payment {index + 1}</h4>
              {payments.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePayment(payment.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`amount-${payment.id}`}>Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`amount-${payment.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max={balanceDue}
                    value={payment.amount || ''}
                    onChange={(e) =>
                      handlePaymentChange(payment.id, 'amount', e.target.value)
                    }
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`method-${payment.id}`}>Payment Method *</Label>
                <select
                  id={`method-${payment.id}`}
                  value={payment.payment_method}
                  onChange={(e) =>
                    handlePaymentChange(
                      payment.id,
                      'payment_method',
                      e.target.value as PaymentMethod
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor={`ref-${payment.id}`}>Transaction Reference</Label>
                <Input
                  id={`ref-${payment.id}`}
                  type="text"
                  value={payment.transaction_ref}
                  onChange={(e) =>
                    handlePaymentChange(payment.id, 'transaction_ref', e.target.value)
                  }
                  placeholder="e.g., Check #, Card last 4 digits"
                />
              </div>

              <div>
                <Label htmlFor={`notes-${payment.id}`}>Notes</Label>
                <Input
                  id={`notes-${payment.id}`}
                  type="text"
                  value={payment.notes}
                  onChange={(e) =>
                    handlePaymentChange(payment.id, 'notes', e.target.value)
                  }
                  placeholder="Optional notes"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || totalPaymentAmount <= 0}>
          <CreditCard className="h-4 w-4 mr-2" />
          {loading ? 'Processing...' : `Process Payment (${formatCurrency(totalPaymentAmount)})`}
        </Button>
      </div>
    </form>
  );
}
