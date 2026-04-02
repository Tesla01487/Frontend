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
  X,
  Copy,
  Share2
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
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [adminQRCodeImage, setAdminQRCodeImage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi'>('wallet');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [USDTAmount, setUSDTAmount] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState<any>(null);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const USDT_RATE = 1; // 1 USD = 1 USDT (adjust as needed)
  const REFERRAL_COMMISSION = 0.15; // 15% commission

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

  const fetchReferralData = async () => {
    try {
      // Fetch referral code
      const codeResponse = await api.getMyReferralCode();
      if (codeResponse.success && codeResponse.data && codeResponse.data.code) {
        setReferralCode(codeResponse.data.code);
        // Store in localStorage as backup
        localStorage.setItem('userReferralCode', codeResponse.data.code);
      } else {
        // If no code exists, generate one
        const generateResponse = await api.generateReferralCode();
        if (generateResponse.success && generateResponse.data) {
          const newCode = generateResponse.data.code;
          setReferralCode(newCode);
          localStorage.setItem('userReferralCode', newCode);
          toast.success('Referral code generated successfully!');
        } else {
          // Fallback: check localStorage
          const storedCode = localStorage.getItem('userReferralCode');
          if (storedCode) {
            setReferralCode(storedCode);
          } else {
            // Generate a unique code locally if backend fails
            const user = api.getUser();
            const localCode = `${user?.walletId?.slice(0, 6) || 'USER'}${Date.now().toString(36).toUpperCase()}`;
            setReferralCode(localCode);
            localStorage.setItem('userReferralCode', localCode);
          }
        }
      }

      // Fetch referral stats
      const statsResponse = await api.getReferralStats();
      if (statsResponse.success && statsResponse.data) {
        setReferralStats(statsResponse.data);
      }

      // Fetch referral earnings
      const earningsResponse = await api.getReferralEarnings();
      if (earningsResponse.success && earningsResponse.data) {
        setReferralEarnings(earningsResponse.data.totalEarnings || 0);
      }
    } catch (error) {
      console.error('Referral data fetch error:', error);
      // Fallback to localStorage
      const storedCode = localStorage.getItem('userReferralCode');
      if (storedCode) {
        setReferralCode(storedCode);
      } else {
        // Generate a unique code locally as last resort
        const user = api.getUser();
        const localCode = `${user?.walletId?.slice(0, 6) || 'USER'}${Date.now().toString(36).toUpperCase()}`;
        setReferralCode(localCode);
        localStorage.setItem('userReferralCode', localCode);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuyUSDTs = () => {
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
    setUSDTAmount((amount * USDT_RATE).toFixed(2));
  };

  const handleConfirmPurchase = async () => {
    try {
      if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      setProcessingPayment(true);

      // Call backend to create deposit transaction with referral
      const response = await api.depositWithReferral({
        amount: parseFloat(purchaseAmount),
        paymentMethod: 'wallet',
        referralCode: referralCodeInput || undefined,
      });

      if (response.success) {
        // Calculate referral bonus earned (if they used someone's referral code)
        const referralBonus = parseFloat(purchaseAmount) * REFERRAL_COMMISSION;
        
        toast.success(
          referralCodeInput && referralBonus > 0
            ? `Deposit request submitted! You'll receive ${referralBonus.toFixed(2)} USDT as referral bonus!`
            : `Deposit request submitted! USDT will be credited after admin approval.`
        );
        
        setShowBuyModal(false);
        setPurchaseAmount('');
        setUSDTAmount('');
        setReferralCodeInput('');
        fetchDashboardData(); // Fetch latest data after transaction
        fetchReferralData(); // Update referral data
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

  const handleGenerateReferralCode = async () => {
    try {
      setProcessingPayment(true); // Reusing for loading state
      const response = await api.generateReferralCode();
      
      if (response.success && response.data) {
        const newCode = response.data.code;
        setReferralCode(newCode);
        localStorage.setItem('userReferralCode', newCode);
        toast.success('New referral code generated! 🎉');
        fetchReferralData(); // Refresh data
      } else {
        toast.error('Failed to generate referral code');
      }
    } catch (error) {
      console.error('Generate code error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate code');
    } finally {
      setProcessingPayment(false);
    }
  };

  const quickActions = [
    { icon: Send, label: 'Send', href: '/transfer', color: 'from-primary to-secondary' },
    { icon: Download, label: 'Receive', href: '/wallet', color: 'from-secondary to-primary' },
    { icon: QrCode, label: 'QR Code', href: '/transfer?tab=qr', color: 'from-primary to-secondary' },
    { icon: Plus, label: 'Buy Crypto', onClick: handleBuyUSDTs, color: 'from-amber-500 to-orange-500' },
  ];

  const getReferralLink = () => {
    if (!referralCode) return '';
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?ref=${referralCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              ${formatCurrency(dashboardData.balance).replace('$', '')}
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
                <p className="text-muted-foreground">Total Transactions</p>
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

          {/* Referral Earnings Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`card p-6 relative overflow-hidden ${referralCode ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`}
            onClick={() => referralCode && setShowReferralModal(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Referral Earnings</p>
                <Share2 className="w-5 h-5 text-amber-500" />
              </div>
              {referralCode ? (
                <>
                  <h2 className="text-4xl font-bold mb-2 text-amber-500">
                    {referralEarnings.toFixed(2)}
                  </h2>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {referralStats?.totalReferrals || 0} referrals
                    </p>
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="text-xs px-2 py-1 bg-amber-500/20 text-amber-600 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-3">No referral code yet</p>
                  <button
                    onClick={() => setShowReferralModal(true)}
                    className="w-full text-sm px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors font-semibold"
                  >
                    Get Your Code & Start Earning
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.5 }}
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

      {/* Buy USDTs Modal */}
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
              Buy Crypto USDTs
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

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value)}
                      placeholder="Enter referral code to get 15% bonus"
                      className="input w-full text-sm"
                    />
                    {referralCodeInput && (
                      <p className="text-xs text-success mt-2">
                        ✓ You'll get {(parseFloat(purchaseAmount || '0') * REFERRAL_COMMISSION).toFixed(2)} USDT bonus!
                      </p>
                    )}
                  </div>

                  {purchaseAmount && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 card gradient-primary text-white"
                    >
                      <p className="text-sm mb-1">You will receive</p>
                      <p className="text-3xl font-bold">{USDTAmount} USDT</p>
                      <p className="text-xs text-white/80 mt-1">Rate: 1 USD = {USDT_RATE} USDT</p>
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
                    <li>USDT will be credited to your account</li>
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

      {/* Referral Modal */}
      {showReferralModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowReferralModal(false)}
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
              onClick={() => setShowReferralModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-6 text-center mt-2">
              🎉 Referral Program
            </h2>

            {referralCode ? (
              <div className="space-y-6">
                {/* Earnings Card */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 card gradient-primary text-white rounded-lg"
                >
                  <p className="text-sm mb-1">Total Referral Earnings</p>
                  <p className="text-3xl font-bold">{referralEarnings.toFixed(2)} USDT</p>
                  <p className="text-xs text-white/80 mt-2">
                    Earn 15% when someone uses your referral code
                  </p>
                </motion.div>

                {/* Referral Stats */}
                {referralStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card p-4 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {referralStats.totalReferrals || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Referrals</p>
                    </div>
                    <div className="card p-4 text-center">
                      <p className="text-2xl font-bold text-success">
                        {referralStats.activeReferrals || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                  </div>
                )}

                {/* Your Referral Code */}
                <div className="card p-4 bg-muted/50">
                  <h4 className="font-semibold mb-3">Your Referral Code</h4>
                  {referralCode ? (
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={referralCode}
                        readOnly
                        className="flex-1 px-3 py-2 input text-sm font-mono bg-primary/10"
                      />
                      <button
                        onClick={() => copyToClipboard(referralCode)}
                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateReferralCode}
                      disabled={processingPayment}
                      className="w-full btn-primary py-2 mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Generate My Code
                        </>
                      )}
                    </button>
                  )}
                  {referralCode && (
                    <button
                      onClick={handleGenerateReferralCode}
                      disabled={processingPayment}
                      className="w-full text-xs py-1 px-2 bg-amber-500/20 text-amber-600 rounded hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                    >
                      {processingPayment ? 'Regenerating...' : 'Regenerate Code'}
                    </button>
                  )}
                </div>

                {/* Your Referral Link */}
                <div className="card p-4 bg-muted/50">
                  <h4 className="font-semibold mb-3">Your Referral Link</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={getReferralLink()}
                      readOnly
                      className="flex-1 px-3 py-2 input text-xs"
                    />
                    <button
                      onClick={() => copyToClipboard(getReferralLink())}
                      className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = `Join me and get 15% bonus on your first purchase! Use my referral code: ${referralCode}`;
                      if (typeof window !== 'undefined' && navigator.share) {
                        navigator.share({
                          title: 'CryptoUSDT Referral',
                          text: text,
                          url: getReferralLink(),
                        });
                      } else {
                        copyToClipboard(text);
                      }
                    }}
                    className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* How It Works */}
                <div className="card p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">How It Works</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Share your referral code or link</li>
                    <li>Your friend uses it during sign up</li>
                    <li>When they buy USDT, you get 15%</li>
                    <li>Earnings added to your wallet instantly</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Share2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Referral program loading...</p>
                <p className="text-sm text-muted-foreground">
                  Please refresh the page
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
