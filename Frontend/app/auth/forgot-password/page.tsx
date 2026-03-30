"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/ui/theme-toggle';
import { api } from '@/lib/api';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmitEmail = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      setEmail(data.email);
      const response = await api.forgotPassword({ email: data.email });
      
      if (response.success && response.data) {
        const userData = response.data as { userId: string };
        setUserId(userData.userId);
        toast.success(response.message || 'OTP sent to your email!');
        setStep(2);
      } else {
        toast.error(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      console.error('Forgot password error:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      if (!userId) {
        toast.error('Session expired. Please start over.');
        setStep(1);
        return;
      }

      const response = await api.resetPassword({
        userId,
        otp: data.otp,
        newPassword: data.password,
      });
      
      if (response.success) {
        toast.success(response.message || 'Password reset successfully!');
        router.push('/auth/login?email=' + encodeURIComponent(email));
      } else {
        toast.error(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      console.error('Reset password error:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Link href="/auth/login">
        <motion.button
          className="fixed top-6 left-6 glass p-3 rounded-xl hover:scale-105 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </motion.button>
      </Link>

      <div className="fixed top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center space-x-3 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg bg-transparent dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900 p-3">
                <Image src="/T.png" alt="Tesla Logo" width={48} height={48} className="object-contain dark:hidden" priority />
                <Image src="/logo.png" alt="Tesla Logo" width={48} height={48} className="object-contain hidden dark:block" priority />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              {step === 1
                ? 'Enter your email to receive a reset code'
                : 'Enter the OTP and your new password'}
            </p>
          </div>

          {step === 1 ? (
            <motion.div
              className="card p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                    <input
                      {...registerEmail('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="input pl-10"
                    />
                  </div>
                  {emailErrors.email && (
                    <p className="text-error text-sm mt-1">{emailErrors.email.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="spinner w-5 h-5 mx-auto" />
                  ) : (
                    <span>Send Reset Code</span>
                  )}
                </motion.button>
              </form>

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="card p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-6 p-4 bg-primary/10 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  Code sent to: <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Code
                  </label>
                  <input
                    {...registerReset('otp')}
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="input text-center text-lg tracking-widest"
                  />
                  {resetErrors.otp && (
                    <p className="text-error text-sm mt-1">{resetErrors.otp.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                    <input
                      {...registerReset('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-0/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {resetErrors.password && (
                    <p className="text-error text-sm mt-1">{resetErrors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                    <input
                      {...registerReset('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-0/5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {resetErrors.confirmPassword && (
                    <p className="text-error text-sm mt-1">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="spinner w-5 h-5 mx-auto" />
                  ) : (
                    <span>Reset Password</span>
                  )}
                </motion.button>
              </form>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await api.forgotPassword({ email });
                      if (response.success) {
                        toast.success('New code sent to your email!');
                      }
                    } catch {
                      toast.error('Failed to resend code. Please try again.');
                    }
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Didn&apos;t receive code? Resend
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
