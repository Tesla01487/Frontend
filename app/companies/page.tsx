"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  Zap,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import toast from 'react-hot-toast';

interface InvestmentTier {
  id: string;
  min: number;
  max: number;
  dailyReturn: number;
  days: number;
  description: string;
}

const investmentTiers: InvestmentTier[] = [
  {
    id: '1',
    min: 100,
    max: 500,
    dailyReturn: 0.15,
    days: 260,
    description: 'Entry Level Investment',
  },
  {
    id: '2',
    min: 501,
    max: 1000,
    dailyReturn: 0.25,
    days: 220,
    description: 'Silver Investment',
  },
  {
    id: '3',
    min: 1001,
    max: 2000,
    dailyReturn: 0.30,
    days: 180,
    description: 'Gold Investment',
  },
  {
    id: '4',
    min: 2001,
    max: 5000,
    dailyReturn: 0.35,
    days: 150,
    description: 'Platinum Investment',
  },
  {
    id: '5',
    min: 5001,
    max: 10000,
    dailyReturn: 0.50,
    days: 120,
    description: 'Diamond Investment',
  },
  {
    id: '6',
    min: 10001,
    max: 50000,
    dailyReturn: 0.75,
    days: 90,
    description: 'Elite Investment',
  },
];

export default function InvestmentPage() {
  const [selectedTier, setSelectedTier] = useState<InvestmentTier | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);

  const calculateReturns = (amount: number, tier: InvestmentTier) => {
    const dailyReturn = (amount * tier.dailyReturn) / 100;
    const totalReturn = dailyReturn * tier.days;
    const totalValue = amount + totalReturn;
    return { dailyReturn: dailyReturn.toFixed(2), totalReturn: totalReturn.toFixed(2), totalValue: totalValue.toFixed(2) };
  };

  const handleInvest = () => {
    if (!selectedTier) {
      toast.error('Please select an investment tier');
      return;
    }

    if (!investmentAmount || parseFloat(investmentAmount) < selectedTier.min || parseFloat(investmentAmount) > selectedTier.max) {
      toast.error(
        `Investment amount must be between $${selectedTier.min} and $${selectedTier.max}`
      );
      return;
    }

    setShowInvestModal(true);
  };

  const handlePay = () => {
    if (!investmentAmount) {
      toast.error('Please enter an investment amount');
      return;
    }
    
    toast.success('Payment processing initiated');
    // Add payment processing logic here
  };

  const handleConfirmInvestment = async () => {
    try {
      // Add API call here to confirm investment
      toast.success('Investment confirmed successfully!');
      setShowInvestModal(false);
      setInvestmentAmount('');
      setSelectedTier(null);
    } catch (error) {
      toast.error('Failed to confirm investment');
    }
  };

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Investment Plans</h1>
          <p className="text-muted-foreground">
            Choose an investment plan and start earning daily returns
          </p>
        </motion.div>

        {/* Investment Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card gradient-primary p-6 mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-1">Flexible Investment Options</h3>
              <p className="text-white/90">
                Invest between $100 and $50,000 with daily returns based on your investment tier. Your capital is returned after the investment period ends.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Investment Tiers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {investmentTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTier(tier)}
              className={`card p-6 cursor-pointer transition-all border-2 ${
                selectedTier?.id === tier.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Tier Name */}
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{tier.description}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>${tier.min.toLocaleString()} - ${tier.max.toLocaleString()}</span>
                </div>
              </div>

              {/* Investment Details */}
              <div className="space-y-4 mb-6">
                {/* Daily Return */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Daily Return</span>
                  </div>
                  <span className="text-lg font-bold text-success">{tier.dailyReturn}%</span>
                </div>

                {/* Duration */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                  <span className="text-lg font-bold">{tier.days} days</span>
                </div>

                {/* Total Return (example with $1000) */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Example: $1,000 investment</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Return</span>
                    </div>
                    <span className="font-bold text-success">
                      ${(1000 * tier.dailyReturn * tier.days / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => setSelectedTier(tier)}
                className={`w-full py-2 rounded-lg font-semibold transition-all ${
                  selectedTier?.id === tier.id
                    ? 'btn-primary'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {selectedTier?.id === tier.id ? 'Selected' : 'Select'}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Investment Form */}
        {selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 max-w-2xl mx-auto mb-8"
          >
            <h3 className="text-2xl font-bold mb-6">Investment Details</h3>

            <div className="space-y-6">
              {/* Selected Tier Info */}
              <div className="bg-muted rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Min Investment</p>
                    <p className="font-bold">${selectedTier.min.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Max Investment</p>
                    <p className="font-bold">${selectedTier.max.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Daily Return</p>
                    <p className="font-bold text-success">{selectedTier.dailyReturn}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Duration</p>
                    <p className="font-bold">{selectedTier.days} days</p>
                  </div>
                </div>
              </div>

              {/* Investment Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Investment Amount (USDT)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    min={selectedTier.min}
                    max={selectedTier.max}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder={`Enter amount between $${selectedTier.min} - $${selectedTier.max}`}
                    className="input pl-10 w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Valid range: ${selectedTier.min.toLocaleString()} - ${selectedTier.max.toLocaleString()}
                </p>
              </div>

              {/* Investment Returns Preview */}
              {investmentAmount && parseFloat(investmentAmount) >= selectedTier.min && parseFloat(investmentAmount) <= selectedTier.max && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-success/10 border border-success rounded-xl p-4"
                >
                  {(() => {
                    const amount = parseFloat(investmentAmount);
                    const returns = calculateReturns(amount, selectedTier);
                    return (
                      <>
                        <h4 className="font-semibold mb-3 text-success">Your Investment Returns</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Daily Earning</p>
                            <p className="font-bold text-success text-lg">${returns.dailyReturn}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Total Return</p>
                            <p className="font-bold text-success text-lg">${returns.totalReturn}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">Total Value</p>
                            <p className="font-bold text-success text-lg">${returns.totalValue}</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={handlePay}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DollarSign className="w-5 h-5" />
                  Pay
                </motion.button>
                <motion.button
                  onClick={handleInvest}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowRight className="w-5 h-5" />
                  Invest Now
                </motion.button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By investing, you agree to our investment terms and conditions. Your capital will be returned after the investment period ends.
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!selectedTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Select an Investment Plan</h3>
            <p className="text-muted-foreground">
              Choose from our investment tiers above to get started
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
