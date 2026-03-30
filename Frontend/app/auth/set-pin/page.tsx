"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function SetPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`) as HTMLInputElement | null;
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`) as HTMLInputElement | null;
      prev?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = pin.join('');
    if (pinString.length !== 4) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.setTransactionPin({ pin: pinString, password });
      if (response.success) {
        toast.success('Transaction PIN set successfully');
        setTimeout(() => router.push('/dashboard'), 800);
      } else {
        toast.error(response.message || 'Failed to set PIN');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set PIN';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Set Transaction PIN</h1>
            <p className="text-sm text-muted-foreground">Create a 4-digit PIN to secure your transfers (required).</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Enter 4-digit PIN</label>
              <div className="flex gap-3 justify-center">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm with your account password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your account password"
                className="input"
              />
              <p className="text-sm text-muted-foreground mt-2">Password is required for first-time PIN setup to verify your identity.</p>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? <div className="spinner w-5 h-5 mx-auto" /> : <span>Set PIN</span>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
