"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { formatCurrency, formatNumber, truncateAddress } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

type TransactionStatus = 'completed' | 'pending' | 'failed';
type TransactionType = 'sent' | 'received' | 'all';

interface Transaction {
  id: string;
  transactionId: string;
  type: 'sent' | 'received';
  amount: number;
  recipient?: string;
  sender?: string;
  timestamp: string;
  status: TransactionStatus;
  note?: string;
  fee: number;
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType>('all');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [selectedType, selectedStatus, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedType !== 'all') {
        params.type = selectedType;
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      const response = await api.getTransactions(params);

      if (response.success && response.data?.transactions) {
        const mappedTransactions = response.data.transactions.map((tx: any) => ({
          id: tx.id,
          transactionId: tx.transactionId,
          type: tx.type,
          amount: tx.amount,
          sender: tx.sender?.name || tx.sender?.walletId || 'Unknown',
          recipient: tx.receiver?.name || tx.receiver?.walletId || 'Unknown',
          timestamp: tx.createdAt,
          status: tx.status,
          note: tx.note || tx.description || '',
          fee: 0,
        }));
        setTransactions(mappedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.note?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalSent: transactions
      .filter(t => t.type === 'sent' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalReceived: transactions
      .filter(t => t.type === 'received' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    pending: transactions.filter(t => t.status === 'pending').length,
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Navigation />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-8">Transaction History</h1>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingDown className="w-8 h-8 text-success" />
                  <span className="text-sm text-success font-medium">Received</span>
                </div>
                <h3 className="text-2xl font-bold">{formatNumber(stats.totalReceived)}</h3>
                <p className="text-sm text-muted-foreground">Total coins received</p>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <span className="text-sm text-primary font-medium">Sent</span>
                </div>
                <h3 className="text-2xl font-bold">{formatNumber(stats.totalSent)}</h3>
                <p className="text-sm text-muted-foreground">Total coins sent</p>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-warning" />
                  <span className="text-sm text-warning font-medium">Pending</span>
                </div>
                <h3 className="text-2xl font-bold">{stats.pending}</h3>
                <p className="text-sm text-muted-foreground">Pending transactions</p>
              </div>
            </div>

            <div className="card p-6">
              <div className="space-y-3">
                {filteredTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        txn.type === 'received' ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                        {txn.type === 'received' ? (
                          <ArrowDownLeft className="w-6 h-6 text-success" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{txn.type}</div>
                        <p className="text-sm text-muted-foreground">
                          {txn.type === 'sent' ? `To: ${txn.recipient}` : `From: ${txn.sender}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(txn.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        txn.type === 'received' ? 'text-success' : 'text-primary'
                      }`}>
                        {txn.type === 'received' ? '+' : '-'}
                        {formatNumber(txn.amount)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        txn.status === 'completed' ? 'bg-success/10 text-success' :
                        txn.status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-error/10 text-error'
                      }`}>
                        {txn.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}