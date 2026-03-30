"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/ui/theme-toggle';
import { api } from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [userData, setUserData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await api.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      
      if (response.success) {
        setUserData(response.data);
        toast.success(response.message || 'OTP sent to your email!');
        setStep(2);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      console.error('Registration error:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (otp: string) => {
    if (!userData?.userId) {
      toast.error('Session expired. Please register again.');
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.verifyOTP({
        userId: userData.userId,
        otp,
        purpose: 'registration',
      });
      
      if (response.success) {
        toast.success('Account verified! Let\'s set up your transaction PIN.');
        // User is now authenticated (tokens set by api.verifyOTP). Redirect to set-pin page
        setTimeout(() => {
          router.push('/auth/set-pin');
        }, 800);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP. Please try again.';
      console.error('OTP verification error:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userData?.userId) {
      toast.error('Session expired. Please register again.');
      setStep(1);
      return;
    }

    try {
      const response = await api.resendOTP({
        userId: userData.userId,
        purpose: 'registration',
      });
      
      if (response.success) {
        toast.success(response.message || 'OTP resent successfully!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP.';
      console.error('Resend OTP error:', error);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      {/* Back Button */}
      <Link href="/">
        <motion.button
          className="fixed top-6 left-6 glass p-3 rounded-xl hover:scale-105 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </motion.button>
      </Link>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              {step === 1
                ? 'Sign up to start managing your digital coins'
                : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {/* Registration Form */}
          {step === 1 ? (
            <motion.div
              className="card p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Rahul Sharma"
                      className="input pl-12"
                      style={{ paddingLeft: '3rem', height: '44px' }}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-error text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="rahul.sharma@example.com"
                      className="input pl-12"
                      style={{ paddingLeft: '3rem', height: '44px' }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-error text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      {...register('phone')}
                      style={{ paddingLeft: '3rem', height: '44px' }}
                      type="tel"
                      placeholder="+919876543210"
                      className="input pl-12"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-error text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-12 pr-12"
                      style={{ paddingLeft: '3rem', paddingRight: '3rem', height: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-0/5 text-muted-foreground hover:text-foreground transition-colors"
                      style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-error text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-10 pr-10"
                      style={{ paddingLeft: '3rem', paddingRight: '3rem', height: '44px' }}
                    />
                    <button
                      type="button"
                      style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
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
                  {errors.confirmPassword && (
                    <p className="text-error text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-border mt-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </div>

                {/* Submit Button */}
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
                    <span>Create Account</span>
                  )}
                </motion.button>
              </form>

              {/* Sign In Link */}
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <OTPVerification
              onVerify={handleOTPVerification}
              isLoading={isLoading}
              onResend={handleResendOTP}
              email={userData?.email}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// OTP Verification Component
function OTPVerification({
  onVerify,
  isLoading,
  onResend,
  email,
}: {
  onVerify: (otp: string) => void;
  isLoading: boolean;
  onResend: () => void;
  email?: string;
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      onVerify(otpString);
    } else {
      toast.error('Please enter all 6 digits');
    }
  };

  return (
    <motion.div
      className="card p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to {email ? (
              <span className="font-medium text-foreground">{email}</span>
            ) : (
              'your email'
            )}
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
            />
          ))}
        </div>

        {/* Resend Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onResend}
            className="text-sm text-primary hover:underline"
          >
            Didn&apos;t receive code? Resend
          </button>
        </div>

        {/* Verify Button */}
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
            <span>Verify & Continue</span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
