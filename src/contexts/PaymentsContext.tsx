import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';
import { Database } from '@/integrations/supabase/types';

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];

export type PaymentMethod = 'cash' | 'zelle' | 'card' | 'transfer' | 'check' | 'other';
export type PaymentStatus = 'pending' | 'received' | 'refunded' | 'void';

export interface Payment {
  id: string;
  companyId: string;
  proposalId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface PaymentsContextType {
  payments: Payment[];
  loading: boolean;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getPaymentsForProposal: (proposalId: string) => Payment[];
  getTotalPaidForProposal: (proposalId: string) => number;
  refreshPayments: () => Promise<void>;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

export const usePayments = () => {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentsProvider');
  return ctx;
};

const mapRow = (row: any): Payment => ({
  id: row.id,
  companyId: row.company_id,
  proposalId: row.proposal_id,
  amount: Number(row.amount),
  currency: row.currency || 'USD',
  method: row.method as PaymentMethod,
  status: row.status as PaymentStatus,
  paidAt: row.paid_at,
  note: row.note,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

export const PaymentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user) { setPayments([]); setLoading(false); return; }
    try {
      const { data, error } = await (supabase
        .from('payments' as any)
        .select('id, company_id, proposal_id, amount, currency, method, status, paid_at, note, created_by, created_at')
        .order('paid_at', { ascending: false }) as any);
      if (error) throw error;
      setPayments((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [user]);

  const getCompanyId = async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  };

  const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    if (!user) return;
    const companyId = payment.companyId || await getCompanyId();
    if (!companyId) throw new Error('No company found');

    const { error } = await (supabase.from('payments' as any).insert({
      company_id: companyId,
      proposal_id: payment.proposalId,
      amount: payment.amount,
      currency: payment.currency || 'USD',
      method: payment.method,
      status: payment.status || 'received',
      paid_at: payment.paidAt,
      note: payment.note,
      created_by: user.id,
    }) as any);
    if (error) throw error;
    await fetchPayments();
  };

  const deletePayment = async (id: string) => {
    const { error } = await (supabase.from('payments' as any).delete().eq('id', id) as any);
    if (error) throw error;
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const getPaymentsForProposal = (proposalId: string) =>
    payments.filter(p => p.proposalId === proposalId);

  const getTotalPaidForProposal = (proposalId: string) =>
    payments
      .filter(p => p.proposalId === proposalId && p.status === 'received')
      .reduce((sum, p) => sum + p.amount, 0);

  return (
    <PaymentsContext.Provider value={{ payments, loading, addPayment, deletePayment, getPaymentsForProposal, getTotalPaidForProposal, refreshPayments: fetchPayments }}>
      {children}
    </PaymentsContext.Provider>
  );
};
