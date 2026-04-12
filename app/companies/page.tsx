"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  Zap,
  Wallet,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface InvestmentTier {
  id: string;
  min: number;
  max: number;
  dailyReturn: number;
  days: number;
  description: string;
}

const investmentTiers: InvestmentTier[] = [
  { id: '1', min: 100, max: 500, dailyReturn: 1.50, days: 90, description: 'Entry Level Investment' },
  { id: '2', min: 501, max: 1000, dailyReturn: 1.50, days: 70, description: 'Silver Investment' },
  { id: '3', min: 1001, max: 2000, dailyReturn: 1.50, days: 60, description: 'Gold Investment' },
  { id: '4', min: 2001, max: 5000, dailyReturn: 1.50, days: 50, description: 'Platinum Investment' },
  { id: '5', min: 5001, max: 10000, dailyReturn: 1.50, days: 30, description: 'Diamond Investment' },
  { id: '6', min: 10001, max: 50000, dailyReturn: 1.75, days: 30, description: 'Elite Investment' },
];

export default function InvestmentPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<InvestmentTier | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  
  // ✅ YOUR SPECIFIC WALLET ID
  const DEPOSIT_WALLET_ID = "TCd65pAziQ4oAGhmPaiJBrk3ezupCEqtok";

  useEffect(() => {
    if (!api.isAuthenticated()) {
      toast.error('Please login to invest');
      router.push('/auth/login');
    }
  }, [router]);

  const calculateReturns = (amount: number, tier: InvestmentTier) => {
    const dailyReturn = (amount * tier.dailyReturn) / 100;
    const totalReturn = dailyReturn * tier.days;
    const totalValue = amount + totalReturn;
    return {
      dailyReturn: dailyReturn.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      totalValue: totalValue.toFixed(2),
    };
  };

  const handleInvestNow = () => {
    if (!selectedTier) {
      toast.error('Please select an investment tier');
      return;
    }
    const amount = parseFloat(investmentAmount);
    if (!investmentAmount || amount < selectedTier.min || amount > selectedTier.max) {
      toast.error(`Amount must be between $${selectedTier.min} and $${selectedTier.max}`);
      return;
    }
    setShowPopup(true);
  };

  const handleWithdraw = () => {
    if (!selectedTier || !investmentAmount) {
      toast.error('Please select a plan and amount');
      return;
    }
    setShowInvestModal(true);
  };

  const handleConfirmInvestment = async () => {
    toast.success('Investment confirmed successfully!');
    setShowInvestModal(false);
    setInvestmentAmount('');
    setSelectedTier(null);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Investment Plans</h1>
          <p className="text-muted-foreground">Choose a plan and start earning daily returns</p>
        </motion.div>

        {/* Info Banner */}
        <div className="card gradient-primary p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-1">Flexible Investment Options</h3>
              <p className="text-white/90">Invest between $100 and $50,000. Capital is returned after the period ends.</p>
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {investmentTiers.map((tier) => (
            <div 
              key={tier.id} 
              onClick={() => setSelectedTier(tier)}
              className={`card p-6 cursor-pointer transition-all border-2 ${selectedTier?.id === tier.id ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <h3 className="text-xl font-bold mb-1">{tier.description}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <DollarSign className="w-4 h-4" />
                <span>${tier.min.toLocaleString()} - ${tier.max.toLocaleString()}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Daily Return:</span><span className="font-bold text-success">{tier.dailyReturn}%</span></div>
                <div className="flex justify-between"><span>Duration:</span><span className="font-bold">{tier.days} days</span></div>
              </div>
              <button className={`w-full mt-4 py-2 rounded-lg font-semibold ${selectedTier?.id === tier.id ? 'btn-primary' : 'border border-border'}`}>
                {selectedTier?.id === tier.id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>

        {/* Details and Actions */}
        {selectedTier && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 max-w-2xl mx-auto mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Investment Amount (USDT)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder={`Min: $${selectedTier.min}`}
                    className="input pl-10 w-full"
                  />
                </div>
              </div>

              {investmentAmount && parseFloat(investmentAmount) >= selectedTier.min && (
                <div className="bg-success/10 border border-success rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><p className="text-xs">Daily</p><p className="font-bold">${calculateReturns(parseFloat(investmentAmount), selectedTier).dailyReturn}</p></div>
                    <div><p className="text-xs">Total ROI</p><p className="font-bold">${calculateReturns(parseFloat(investmentAmount), selectedTier).totalReturn}</p></div>
                    <div><p className="text-xs">Total Value</p><p className="font-bold">${calculateReturns(parseFloat(investmentAmount), selectedTier).totalValue}</p></div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={handleInvestNow} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                  <ArrowRight className="w-5 h-5" /> Invest Now
                </button>
                <button onClick={handleWithdraw} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" /> Withdraw
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ✅ Payment Popup with Your QR Code */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card p-6 rounded-2xl w-full max-w-md relative border border-border">
            <button onClick={() => setShowPopup(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white">✕</button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Receive USDT</h2>
              <p className="text-muted-foreground text-sm">Send <span className="text-primary font-bold">${investmentAmount}</span> to the address below</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Deposit Address (TRC20)</label>
                <div className="flex gap-2">
                  <input readOnly value={DEPOSIT_WALLET_ID} className="input flex-1 text-[10px] font-mono bg-muted" />
                  <button onClick={() => { navigator.clipboard.writeText(DEPOSIT_WALLET_ID); toast.success('Copied!'); }} className="btn-primary px-3 text-xs">Copy</button>
                </div>
              </div>

              {/* QR Image Integration */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl">
                <img 
                  src="/qr-code.jpeg" 
                  alt="Payment QR" 
                  className="w-40 h-40 object-contain"
                />
                <span className="text-[10px] text-black mt-2 font-bold uppercase tracking-widest">Scan to Pay</span>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg text-center text-[11px] text-muted-foreground">
                ⚠️ Ensure you use the <b>TRC20</b> network. Payments on other networks may be lost.
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
           <div className="bg-card p-6 rounded-2xl max-w-sm w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Confirm Withdrawal</h2>
              <p className="text-sm text-muted-foreground mb-6">Process withdrawal of ${investmentAmount} from {selectedTier?.description}?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowInvestModal(false)} className="flex-1 py-2 border border-border rounded-lg">Cancel</button>
                <button onClick={handleConfirmInvestment} className="flex-1 py-2 btn-primary rounded-lg">Confirm</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
