"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  TrendingUp,
  Download,
  Upload,
  History,
  DollarSign,
  Loader2,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        if (!api.isAuthenticated()) {
          toast.error('Please login to view your wallet');
          router.push('/auth/login');
          return;
        }

        const response = await api.getDashboard();
        if (response.success && response.data) {
          setWalletData(response.data);
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-8">
        <Navigation />
        <main className="container mx-auto px-4 pt-24">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  // Use real data from API or fallback to 0
  const coinBalance = walletData?.balance || 0;
  const coinValue = 60.39; // This would come from a market API in production
  const usdValue = coinBalance * coinValue;
  const totalSent = walletData?.statistics?.totalSent || 0;
  const totalReceived = walletData?.statistics?.totalReceived || 0;

  const chartData = [
    { time: 'Mon', value: 2.1 },
    { time: 'Tue', value: 2.3 },
    { time: 'Wed', value: 2.2 },
    { time: 'Thu', value: 2.5 },
    { time: 'Fri', value: 2.4 },
    { time: 'Sat', value: 2.6 },
    { time: 'Sun', value: 60.39 },
  ];

  const balanceHistory = [
    { date: 'Jan', balance: 4200 },
    { date: 'Feb', balance: 4500 },
    { date: 'Mar', balance: 4800 },
    { date: 'Apr', balance: 4600 },
    { date: 'May', balance: 5000 },
    { date: 'Jun', balance: 5234.75 },
  ];

  const timeframes = ['24h', '7d', '30d', '1y', 'All'];

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your digital coins and track value
          </p>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-mesh opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total Coin Balance
                </p>
                <h2 className="text-5xl font-bold mb-2">
                  {formatNumber(coinBalance)}
                  <span className="text-2xl text-muted-foreground ml-2">coins</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  ≈ {formatCurrency(usdValue)}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                <WalletIcon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/deposit')}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Deposit</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/withdraw')}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Withdraw</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/history')}
                className="glass border border-border px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Coin Value Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Coin Value</h3>
              <div className="flex items-center space-x-3">
                <p className="text-2xl font-bold">${coinValue}</p>
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+5.2%</span>
                </div>
              </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={12}
                />
                <YAxis
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={12}
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fill="url(#colorValue)"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Balance History Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mb-8"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-1">Balance History</h3>
            <p className="text-sm text-muted-foreground">
              Your coin balance over time
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={12}
                />
                <YAxis
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => [formatNumber(value), 'Coins']}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#fb923c"
                  strokeWidth={3}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{formatNumber(totalReceived)}</p>
                <p className="text-xs text-muted-foreground">coins</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                <Download className="w-6 h-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{formatNumber(totalSent)}</p>
                <p className="text-xs text-muted-foreground">coins</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">${coinValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per coin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
