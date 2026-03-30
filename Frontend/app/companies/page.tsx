"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Building2,
  X,
  Heart,
  BarChart3,
  ShoppingCart,
  ArrowLeft,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { formatNumber } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
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

interface Company {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  category: string;
  current_price: number;
  starting_price: number;
  market_cap: number;
  daily_increase_rate: number;
  description: string;
  total_supply: number;
  circulating_supply: number;
  admin_qr_code?: string;
  admin_wallet_id?: string;
  chart_data: { date: string; price: number; volume: number }[];
  last_updated: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
}

const categories = ['All', 'Cryptocurrency', 'Technology', 'Stablecoin'];

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [adminQRCodeImage, setAdminQRCodeImage] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const COIN_RATE = 1; // 1 USD = 1 Coin

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.getAllCompanies();
      if (response.success && response.data) {
        setCompanies(response.data as Company[]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  // Calculate 24h change
  const calculate24hChange = (company: Company) => {
    if (!company.chart_data || company.chart_data.length < 2) {
      // Return a more realistic estimate based on volatility
      const baseRate = company.daily_increase_rate * 100;
      // Add some volatility factor
      const volatility = (Math.random() - 0.45) * 7; // -3% to +4% range
      return baseRate + volatility;
    }
    const latestPrice = company.chart_data[company.chart_data.length - 1].price;
    const yesterdayPrice = company.chart_data[company.chart_data.length - 2].price;
    return ((latestPrice - yesterdayPrice) / yesterdayPrice) * 100;
  };

  // Calculate price range
  const calculatePriceRange = (company: Company) => {
    if (!company.chart_data || company.chart_data.length === 0) {
      return { min: company.current_price * 0.95, max: company.current_price * 1.05 };
    }
    const prices = company.chart_data.map(d => d.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || company.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (companyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(companyId)) {
      newFavorites.delete(companyId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(companyId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const openCompanyDetails = async (company: Company) => {
    setSelectedCompany(company);
    setShowBuyModal(false);
    
    // Fetch detailed chart data
    try {
      const response = await api.getCompanyChart(company.id, selectedPeriod);
      if (response.success && response.data) {
        const chartResponse = response.data as { chart: ChartDataPoint[] };
        setChartData(chartResponse.chart);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Use existing chart data
      setChartData(company.chart_data);
    }
  };

  const handleBuyNow = () => {
    // Load admin QR settings
    const savedSettings = localStorage.getItem('adminBuySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAdminQRCodeImage(settings.qrCodeImage || '');
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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-8">
        <Navigation />
        <main className="container mx-auto px-4 pt-24">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading companies...</p>
          </div>
        </main>
      </div>
    );
  }

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Companies</h1>
          <p className="text-muted-foreground">
            Explore and invest in top crypto currencies
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'btn-primary'
                      : 'border border-border hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Companies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCompanies.map((company, index) => {
              const change24h = calculate24hChange(company);
              const priceRange = calculatePriceRange(company);
              
              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => openCompanyDetails(company)}
                  className="card p-6 cursor-pointer hover:shadow-lg transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
                        {company.logo}
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {company.symbol}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(company.id);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(company.id)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Price & Market Cap */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold">
                        ${formatNumber(company.current_price)}
                      </span>
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          change24h >= 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(change24h).toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Market Cap: {formatMarketCap(company.market_cap)}</span>
                      <span className="text-success">↑ ${priceRange.min.toFixed(2)}</span>
                      <span className="text-error">↓ ${priceRange.max.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="h-16 -mx-2 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={company.chart_data.slice(-30)}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={change24h >= 0 ? '#10b981' : '#ef4444'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Details
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredCompanies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No companies found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </main>

      {/* Company Details Modal */}
      <AnimatePresence>
        {selectedCompany && !showBuyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCompany(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 max-w-4xl w-full my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCompany(null)}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-4xl">
                  {selectedCompany.logo}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-1">{selectedCompany.name}</h2>
                  <p className="text-lg text-muted-foreground">{selectedCompany.symbol}</p>
                  <p className="text-sm text-muted-foreground mt-2">{selectedCompany.description}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                  <p className="text-2xl font-bold">${formatNumber(selectedCompany.current_price)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Starting Price</p>
                  <p className="text-2xl font-bold">${formatNumber(selectedCompany.starting_price)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                  <p className="text-2xl font-bold">{formatMarketCap(selectedCompany.market_cap)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Daily Growth</p>
                  <p className="text-2xl font-bold text-success">+{(selectedCompany.daily_increase_rate * 100).toFixed(2)}%</p>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Price Chart (6 Months)</h3>
                  <div className="flex gap-2">
                    {['1m', '3m', '6m', '1y'].map(period => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          selectedPeriod === period
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-64 card p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Supply Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                  <p className="text-xl font-bold">{formatNumber(selectedCompany.total_supply)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Circulating Supply</p>
                  <p className="text-xl font-bold">{formatNumber(selectedCompany.circulating_supply)}</p>
                </div>
              </div>

              {/* Buy Now Button */}
              <button 
                onClick={handleBuyNow}
                className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Buy Now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Now Modal with QR Code */}
      <AnimatePresence>
        {showBuyModal && selectedCompany && (
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
              className="card p-8 max-w-md w-full"
            >
              {/* Back Button */}
              <button
                onClick={() => setShowBuyModal(false)}
                className="absolute top-4 left-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowBuyModal(false);
                  setSelectedCompany(null);
                }}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-6 text-center mt-8">
                Buy {selectedCompany.symbol}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={adminQRCodeImage}
                      alt="Payment QR Code"
                      className="w-full h-auto max-w-[250px]"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="card p-4 bg-muted/50 mb-6">
                    <h4 className="font-semibold mb-2">Payment Steps:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Enter the amount you want to spend</li>
                      <li>Scan the QR code with your payment app</li>
                      <li>Complete the payment of ${purchaseAmount || '0.00'}</li>
                      <li>Click &quot;Confirm Payment&quot; below after paying</li>
                      <li>Coins will be credited to your account after admin approval</li>
                    </ol>
                  </div>

                  {/* Confirm Payment Button */}
                  <button
                    onClick={async () => {
                      if (!purchaseAmount || parseFloat(purchaseAmount) <= 0) {
                        toast.error('Please enter a valid amount');
                        return;
                      }
                      try {
                        const response = await api.requestDeposit({
                          amount: parseFloat(purchaseAmount),
                          paymentMethod: 'wallet',
                        });
                        if (response.success) {
                          toast.success('Deposit request submitted! Coins will be credited after admin approval.');
                          setShowBuyModal(false);
                          setPurchaseAmount('');
                          setCoinAmount('');
                          await fetchCompanies();
                        } else {
                          toast.error(response.message || 'Failed to submit deposit request');
                        }
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
                      }
                    }}
                    disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0}
                    className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Confirm Payment
                  </button>

                  {/* Current Price Info */}
                  <div className="text-center p-4 card gradient-primary text-white">
                    <p className="text-sm mb-1">{selectedCompany.name} Price</p>
                    <p className="text-3xl font-bold">${formatNumber(selectedCompany.current_price)}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Payment QR code not configured yet. Please contact the administrator.
                  </p>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="btn-primary"
                  >
                    Got it
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
