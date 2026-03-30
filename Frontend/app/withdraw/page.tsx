'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Building, CreditCard, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Navigation from '@/components/navigation';

export default function WithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
    remarks: ''
  });

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.getDashboard();
      setCurrentBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);

    // Validation
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 100) {
      toast.error('Minimum withdrawal amount is 100 coins');
      return;
    }

    if (amount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!formData.accountNumber.trim() || !formData.ifscCode.trim() || !formData.accountHolderName.trim()) {
      toast.error('Please fill all required bank details');
      return;
    }

    // IFSC validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
      toast.error('Invalid IFSC code format');
      return;
    }

    setLoading(true);

    try {
      await api.requestWithdrawal({
        amount,
        bankAccount: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.toUpperCase().trim(),
        accountHolderName: formData.accountHolderName.trim()
      });

      toast.success('Withdrawal request submitted successfully! Admin will review your request.');
      router.push('/wallet');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Withdraw Funds</h1>
          <p className="text-muted-foreground">Transfer money from your wallet to bank</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-6 bg-success/5 border-l-4 border-l-success"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-foreground">{currentBalance.toFixed(2)} <span className="text-lg text-muted-foreground">coins</span></p>
            </div>
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
              <DollarSign className="text-success" size={32} />
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 mb-6 border-l-4 border-l-warning bg-warning/5"
        >
          <div className="flex gap-3">
            <AlertCircle className="text-warning flex-shrink-0" size={24} />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-2">Important Information:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Withdrawals are processed within 2-3 business days</li>
                <li>Minimum withdrawal: 100 coins</li>
                <li>Ensure bank details are accurate</li>
                <li>Processing fee may apply</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Withdrawal Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Withdrawal Amount (Coins) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="number"
                  step="0.01"
                  min="100"
                  max={currentBalance}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: 100 coins | Available: {currentBalance.toFixed(2)} coins
              </p>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                placeholder="Enter account holder name"
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                required
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bank Name *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Enter bank name"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Account Number *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter account number"
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                />
              </div>
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                IFSC Code *
              </label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g., SBIN0001234"
                maxLength={11}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all uppercase"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                11-character bank code (e.g., SBIN0001234)
              </p>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Remarks (Optional)
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Add any additional information..."
                rows={3}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || currentBalance < 100}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Submit Withdrawal Request'
              )}
            </motion.button>

            {currentBalance < 100 && (
              <p className="text-center text-sm text-error">
                Insufficient balance for withdrawal (minimum 100 coins required)
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
