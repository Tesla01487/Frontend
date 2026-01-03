"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Send,
  Download,
  QrCode,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DashboardData {
  balance: number;
  walletId: string;
  name: string;
  email: string;
  statistics: {
    totalSent: number;
    totalReceived: number;
    totalTransactions: number;
  };
  recentTransactions: Array<{
    id: string;
    transactionId: string;
    amount: number;
    type: 'sent' | 'received';
    status: string;
    sender: {
      name: string;
      walletId: string;
    };
    receiver: {
      name: string;
      walletId: string;
    };
    description: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [adminQRCodeImage, setAdminQRCodeImage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi'>('wallet');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const COIN_RATE = 1; // 1 USD = 1 Coin (adjust as needed)

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getDashboard();
      
      if (response.success && response.data) {
        setDashboardData(response.data as DashboardData);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
      
      // If unauthorized, redirect to login
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuyCoins = () => {
    // Load admin settings
    const savedSettings = localStorage.getItem('adminBuySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAdminQRCodeImage(settings.qrCodeImage || '');
      setPaymentMethod(settings.paymentMethod || 'wallet');
    }
    
    if (!savedSettings || !JSON.parse(savedSettings).qrCodeImage) {
      toast.error('Admin has not configured buy settings yet');
      return;
    }
    
    setShowBuyModal(true);
  };

  const handleAmountChange = (value: string) => {
    setPurchaseAmount(value);
    const amount = parseFloat(value) || 0;
    setCoinAmount((amount * COIN_RATE).toFixed(2));
  };

  const handleConfirmPurchase = async () => {
    try {
      if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      setProcessingPayment(true);

      // Call backend to create deposit transaction
      const response = await api.requestDeposit({
        amount: parseFloat(purchaseAmount),
        paymentMethod: 'wallet',
      });

      if (response.success) {
        toast.success(`Deposit request submitted! Coins will be credited after admin approval.`);
        setShowBuyModal(false);
        setPurchaseAmount('');
        setCoinAmount('');
        fetchDashboardData(); // Fetch latest data after transaction
      } else {
        toast.error(response.message || 'Failed to submit deposit request');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const quickActions = [
    { icon: Send, label: 'Send', href: '/transfer', color: 'from-primary to-secondary' },
    { icon: Download, label: 'Receive', href: '/wallet', color: 'from-secondary to-primary' },
    { icon: QrCode, label: 'QR Code', href: '/transfer?tab=qr', color: 'from-primary to-secondary' },
    { icon: Plus, label: 'Buy Coins', onClick: handleBuyCoins, color: 'from-secondary to-primary' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load dashboard</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {dashboardData.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Wallet ID: {dashboardData.walletId}
          </p>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-mesh opacity-20" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-2">
              {formatCurrency(dashboardData.balance).replace('$', '')}
              </h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center text-success">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Received: {formatCurrency(dashboardData.statistics.totalReceived)}</span>
                </div>
                <div className="flex items-center text-error">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>Sent: {formatCurrency(dashboardData.statistics.totalSent)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transaction Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-6 gradient-primary text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/80">Total Transactions</p>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">#</span>
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-2">
                {dashboardData.statistics.totalTransactions}
              </h2>
              <p className="text-sm text-white/80">
                Completed transactions
              </p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const content = (
                <motion.div
                  className="card-hover p-6 text-center cursor-pointer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-medium">{action.label}</p>
                </motion.div>
              );
              
              return 'onClick' in action ? (
                <div key={index} onClick={action.onClick}>
                  {content}
                </div>
              ) : (
                <Link key={index} href={action.href!}>
                  {content}
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <Link href="/history" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {dashboardData.recentTransactions.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <Link href="/transfer" className="text-primary hover:underline mt-2 inline-block">
                Send your first transaction
              </Link>
            </div>
          ) : (
            <div className="card divide-y divide-border">
              {dashboardData.recentTransactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'received' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-error/20 text-error'
                      }`}>
                        {tx.type === 'received' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === 'received' ? 'Received from' : 'Sent to'}{' '}
                          {tx.type === 'received'
                            ? (tx.sender.name === 'Unknown' || !tx.sender.name ? (tx.description?.toLowerCase().includes('deposit') ? 'Deposit' : 'System') : tx.sender.name)
                            : tx.receiver.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()} • {tx.transactionId}
                        </p>
                        {tx.description && (
                          <p className="text-sm text-muted-foreground italic">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'received' ? 'text-success' : 'text-error'
                      }`}>
                        {tx.type === 'received' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Buy Coins Modal */}
      {showBuyModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowBuyModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card p-8 max-w-md w-full relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowBuyModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-6 text-center mt-2">
              Buy Crypto Coins
            </h2>

            {adminQRCodeImage ? (
              <>
                {/* Amount Input Section */}
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enter Amount (USD) *
                    </label>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      className="input w-full text-lg"
                    />
                  </div>

                  {purchaseAmount && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 card gradient-primary text-white"
                    >
                      <p className="text-sm mb-1">You will receive</p>
                      <p className="text-3xl font-bold">{coinAmount} Coins</p>
                      <p className="text-xs text-white/80 mt-1">Rate: 1 USD = {COIN_RATE} Coin</p>
                    </motion.div>
                  )}
                </div>

                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl mb-6 flex items-center justify-center">
                  {adminQRCodeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={adminQRCodeImage}
                      alt="Payment QR Code"
                      className="w-full h-auto max-w-[250px]"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <QrCode className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">QR Code not available</p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="card p-4 bg-muted/50 mb-6">
                  <h4 className="font-semibold mb-2">Payment Steps:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Enter the amount you want to spend</li>
                    <li>Scan the QR code with {paymentMethod === 'wallet' ? 'your wallet app' : 'GPay/PhonePe/Paytm'}</li>
                    <li>Complete the payment of ${purchaseAmount || '0.00'}</li>
                    <li>Click &quot;Confirm Payment&quot; below after paying</li>
                    <li>Coins will be credited to your account</li>
                  </ol>
                </div>

                {/* Confirm Payment Button */}
                <button
                  onClick={handleConfirmPurchase}
                  disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0 || processingPayment}
                  className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      Confirm Payment
                    </>
                  )}
                </button>

                {/* Help */}
                <div className="text-center mt-4">
                  <Link href="/help" className="text-sm text-primary hover:underline">
                    Need help? Contact Support
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Payment system not configured</p>
                <p className="text-sm text-muted-foreground">
                  Please contact admin to set up payment details
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
