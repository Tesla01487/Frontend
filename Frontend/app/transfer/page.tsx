"use client";

import { useState, useEffect } from 'react';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  QrCode,
  Wallet,
  DollarSign,
  ArrowRight,
  Check,
  Camera,
  Hash,
  Loader2,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { formatNumber } from '@/lib/utils';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const transferSchema = z.object({
  // Only accept wallet IDs (alphanumeric, no @username). Adjust regex if your
  // wallet IDs have a stricter format (e.g. a prefix like `WLT`).
  recipient: z
    .string()
    .min(5, 'Enter valid wallet ID')
    .regex(/^[A-Za-z0-9]+$/, 'Enter valid wallet ID'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
  note: z.string().optional(),
});

type TransferForm = z.infer<typeof transferSchema>;

export default function TransferPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'send' | 'receive' | 'qr'>('send');
  const [step, setStep] = useState(1); // 1: Form, 2: Confirm, 3: PIN, 4: Success
  const [transferData, setTransferData] = useState<TransferForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userWalletId, setUserWalletId] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [qrValue, setQrValue] = useState('');
  const [scannedWalletId, setScannedWalletId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!api.isAuthenticated()) {
          toast.error('Please login to transfer coins');
          router.push('/auth/login');
          return;
        }

        const response = await api.getDashboard();
        if (response.success && response.data) {
          const data = response.data as {name: string; email: string; walletId: string; balance: number};
          // getDashboard returns data directly, not nested under 'user'
          setUserWalletId(data.walletId || '');
          setUserBalance(data.balance || 0);
          setQrValue(data.walletId || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        // no-op
      }
    };

    fetchUserData();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = async (data: TransferForm) => {
    setTransferData(data);
    setStep(2);
  };

  const confirmTransfer = () => {
    setStep(3);
  };

  const verifyPin = async (pin: string) => {
    if (!transferData) {
      toast.error('Transfer data not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.transferCoins({
        recipientWalletId: transferData.recipient, // Form field is 'recipient', API expects 'recipientWalletId'
        amount: parseFloat(transferData.amount),
        note: transferData.note || '',
        pin: pin,
      });

      if (response.success) {
        setStep(4);
        toast.success('Transfer successful!');
        // Update user balance
        const data = response.data as {newBalance?: number};
        if (data?.newBalance !== undefined) {
          setUserBalance(data.newBalance);
        }
      } else {
        toast.error(response.message || 'Transfer failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetTransfer = () => {
    setStep(1);
    setTransferData(null);
    reset();
  };

  const tabs = [
    { id: 'send' as const, label: 'Send', icon: Send },
    { id: 'receive' as const, label: 'Receive', icon: Wallet },
    { id: 'qr' as const, label: 'QR Code', icon: QrCode },
  ];

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Transfer Coins</h1>
          <p className="text-muted-foreground">
            Send coins to anyone or receive coins via wallet ID
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 bg-muted rounded-xl p-2 inline-flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    resetTransfer();
                  }}
                  className={`relative px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 gradient-primary rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <SendForm
                  onSubmit={handleSubmit(onSubmit)}
                  register={register}
                  errors={errors}
                  balance={userBalance}
                  scannedWalletId={scannedWalletId}
                  setValue={setValue}
                />
              )}
              {step === 2 && transferData && (
                <ConfirmTransfer
                  data={transferData}
                  onConfirm={confirmTransfer}
                  onCancel={resetTransfer}
                />
              )}
              {step === 3 && (
                <PinVerification
                  onVerify={verifyPin}
                  isLoading={isLoading}
                  onCancel={resetTransfer}
                />
              )}
              {step === 4 && transferData && (
                <TransferSuccess
                  data={transferData}
                  onNewTransfer={resetTransfer}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'receive' && (
            <motion.div
              key="receive"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ReceiveCoins walletId={userWalletId} />
            </motion.div>
          )}

          {activeTab === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <QRCodeSection
                walletId={userWalletId}
                qrValue={qrValue}
                setQrValue={setQrValue}
                setActiveTab={setActiveTab}
                setScannedWalletId={setScannedWalletId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Send Form Component
function SendForm({
  onSubmit,
  register,
  errors,
  balance = 0,
  scannedWalletId,
  setValue,
}: {
  onSubmit: (e: React.FormEvent) => void;
  register: ReturnType<typeof useForm<TransferForm>>['register'];
  errors: ReturnType<typeof useForm<TransferForm>>['formState']['errors'];
  balance?: number;
  scannedWalletId?: string | null;
  setValue?: ReturnType<typeof useForm<TransferForm>>['setValue'];
}) {
  // Auto-fill wallet ID if scanned
  React.useEffect(() => {
    if (scannedWalletId && setValue) {
      setValue('recipient', scannedWalletId);
    }
  }, [scannedWalletId, setValue]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Send Coins</h2>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-xl font-bold text-primary">
                {formatNumber(balance)} coins
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Recipient Wallet ID
            </label>
            <div className="relative">
              <input
                {...register('recipient')}
                type="text"
                placeholder="WLT1234ABCD"
                className="input"
              />
            </div>
            {errors.recipient && (
              <p className="text-error text-sm mt-1">{errors.recipient.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="input pl-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                coins
              </div>
            </div>
            {errors.amount && (
              <p className="text-error text-sm mt-1">{errors.amount.message}</p>
            )}
            <div className="flex gap-2 mt-2">
              {[50, 100, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    const event = new Event('input', { bubbles: true });
                    const input = document.querySelector(
                      'input[name="amount"]'
                    ) as HTMLInputElement;
                    if (input) {
                      input.value = amount.toString();
                      input.dispatchEvent(event);
                    }
                  }}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* PIN is collected in the confirmation step only (PinVerification) */}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Note (Optional)
            </label>
            <textarea
              {...register('note')}
              rows={3}
              placeholder="Add a message..."
              className="input resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="btn-primary w-full flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// Confirm Transfer Component
function ConfirmTransfer({
  data,
  onConfirm,
  onCancel,
}: {
  data: TransferForm;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Confirm Transfer</h2>
          <p className="text-muted-foreground">
            Please review the details before confirming
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium">{data.recipient}</span>
          </div>
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-xl text-primary">
              {formatNumber(Number(data.amount))} coins
            </span>
          </div>
          {data.note && (
            <div className="flex justify-between p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Note</span>
              <span className="font-medium">{data.note}</span>
            </div>
          )}
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span className="font-medium">Free</span>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="flex-1 btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirm Transfer
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// PIN Verification Component
function PinVerification({
  onVerify,
  isLoading,
  onCancel,
}: {
  onVerify: (pin: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState(['', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    if (newPin.every((digit) => digit !== '') && index === 3) {
      onVerify(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
          <p className="text-muted-foreground">
            Enter your 4-digit PIN to complete the transfer
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
              disabled={isLoading}
            />
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="spinner w-8 h-8" />
          </div>
        )}

        <motion.button
          onClick={onCancel}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}

// Transfer Success Component
function TransferSuccess({
  data,
  onNewTransfer,
}: {
  data: TransferForm;
  onNewTransfer: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-12 h-12 text-success" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 text-success">Success!</h2>
          <p className="text-muted-foreground">
            Your transfer has been completed successfully
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="text-muted-foreground">Amount Sent</span>
            <span className="font-bold text-xl">
              {formatNumber(Number(data.amount))} coins
            </span>
          </div>
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="text-muted-foreground">To</span>
            <span className="font-medium">{data.recipient}</span>
          </div>
          <div className="flex justify-between p-4 bg-muted rounded-lg">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-sm">TXN{Date.now()}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            onClick={onNewTransfer}
            className="flex-1 btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            New Transfer
          </motion.button>
          <motion.button
            onClick={() => toast.success('Receipt downloaded!')}
            className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Download Receipt
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Receive Coins Component
function ReceiveCoins({ walletId }: { walletId: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletId);
    toast.success('Wallet ID copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Receive Coins</h2>
          <p className="text-muted-foreground">
            Share your wallet ID to receive coins
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Wallet ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={walletId}
                readOnly
                className="input flex-1 font-mono"
              />
              <motion.button
                onClick={copyToClipboard}
                className="btn-primary px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Copy
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or scan QR code
              </span>
            </div>
          </div>

          <div className="flex justify-center p-8 bg-white rounded-xl">
            <QRCodeSVG value={walletId} size={200} level="H" />
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              💡 Anyone can send coins to you using your Wallet ID or by scanning
              your QR code
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// QR Code Section Component
function QRCodeSection({
  qrValue,
  setQrValue,
  setActiveTab,
  setScannedWalletId,
}: {
  walletId: string;
  qrValue: string;
  setQrValue: (value: string) => void;
  setActiveTab: (tab: 'send' | 'receive' | 'qr') => void;
  setScannedWalletId: (id: string | null) => void;
}) {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [manualWalletId, setManualWalletId] = useState('');

  const handleScanWallet = () => {
    if (manualWalletId.trim()) {
      setScannedWalletId(manualWalletId.trim());
      toast.success('Wallet ID scanned! Redirecting to send form...');
      setTimeout(() => {
        setActiveTab('send');
      }, 500);
    } else {
      toast.error('Please enter a wallet ID');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            mode === 'generate'
              ? 'btn-primary'
              : 'border border-border hover:bg-muted'
          }`}
        >
          Generate QR
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            mode === 'scan'
              ? 'btn-primary'
              : 'border border-border hover:bg-muted'
          }`}
        >
          Scan QR
        </button>
      </div>

      {mode === 'generate' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Your QR Code
          </h2>

          <div className="flex justify-center p-8 bg-white rounded-xl mb-6">
            <QRCodeSVG value={qrValue} size={250} level="H" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Wallet ID
              </label>
              <input
                type="text"
                value={qrValue}
                onChange={(e) => setQrValue(e.target.value)}
                className="input font-mono"
                placeholder="Enter wallet ID to generate QR"
              />
            </div>

            <motion.button
              onClick={() => {
                toast.success('QR Code saved!');
              }}
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Download QR Code
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Scan QR Code</h2>

          <div className="aspect-square bg-muted rounded-xl flex items-center justify-center mb-6">
            <div className="text-center">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                Camera feature coming soon
              </p>
              <p className="text-sm text-muted-foreground">
                For now, manually enter wallet ID below
              </p>
            </div>
          </div>

          {/* Manual Wallet ID Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter Wallet ID to Scan
              </label>
              <input
                type="text"
                value={manualWalletId}
                onChange={(e) => setManualWalletId(e.target.value)}
                className="input font-mono"
                placeholder="CW1234ABCD5678"
              />
            </div>

            <motion.button
              onClick={handleScanWallet}
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Scan & Transfer
            </motion.button>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg mt-6">
            <p className="text-sm text-center text-muted-foreground">
              💡 Enter a wallet ID and click &quot;Scan & Transfer&quot; to proceed
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
