"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Globe, TrendingUp, Users, Lock, Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { api } from '@/lib/api';

interface Stat {
  value: string;
  label: string;
  description?: string;
}

export default function Home() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);


// --- 1. SET YOUR DEFAULTS ---
  const INITIAL_USERS = 1000000;       
  const INITIAL_VOLUME = 1200000000;   
  const INITIAL_COUNTRIES = 80;        // Fixed at 80

  // Helper: formats 1200000 -> "1.2M"
  function formatCompactNumber(number: number) {
    if (number >= 1000000000) {
      return (number / 1000000000).toFixed(1) + 'B'; // Converts to Billions
    } else if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';    // Converts to Millions
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';       // Converts to Thousands
    }
    return number.toString();
  }

  // Helper: formats money 1200000 -> "$1.2M"
  function formatVolume(amount: number) {
    return '$' + formatCompactNumber(amount);
  }

  const fetchStats = async () => {
    try {
      const response = await api.getPublicStats();
      
      if (response.success && response.data?.metrics) {
        setMetrics(response.data.metrics);

        // --- 2. CALCULATE TOTALS ---
        
        // Users: Default + API (e.g., 1,000,000 + 100,000 = 1.1M)
        const totalUsers = INITIAL_USERS + (response.data.metrics.totalUsers || 0);
        
        // Volume: Default + API
        const totalVolume = INITIAL_VOLUME + (response.data.metrics.totalVolume || 0);
        
        // Countries: Fixed at 80 (Ignoring API)
        const totalCountries = INITIAL_COUNTRIES; 

        setStats([
          {
            value: formatCompactNumber(totalUsers), // Shows "1.1M"
            label: 'Active Users',
            description: 'Trusted users worldwide'
          },
          {
            value: formatVolume(totalVolume), // Shows "$1.2B"
            label: 'Total Volume',
            description: 'In secure transactions'
          },
          {
            value: `${totalCountries}+`, // Shows "80+"
            label: 'Countries',
            description: 'Global reach and access'
          },
          {
            value: `${response.data.metrics.uptime}%`,
            label: 'Uptime',
            description: 'Reliable service guarantee'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  
  useEffect(() => {
    fetchStats();
  }, []);

  // Call fetchStats after registration/transaction (example: window event)
  useEffect(() => {
    const handler = () => fetchStats();
    window.addEventListener('statsUpdate', handler);
    return () => window.removeEventListener('statsUpdate', handler);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Multi-layer security with OTP, PIN, and 2FA protection"
    },
    {
      icon: Zap,
      title: "Instant Transfers",
      description: "Lightning-fast coin transfers with real-time confirmation"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your wallet anywhere, anytime, from any device"
    },
    {
      icon: TrendingUp,
      title: "Live Analytics",
      description: "Real-time charts and insights for your digital assets"
    },
    {
      icon: Users,
      title: "Easy to Use",
      description: "Intuitive interface designed for everyone"
    },
    {
      icon: Lock,
      title: "Your Keys, Your Coins",
      description: "Full control and ownership of your digital assets"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-transparent dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900 p-2">
              <Image src="/T.png" alt="Tesla Logo" width={40} height={40} className="object-contain dark:hidden" priority />
              <Image src="/logo.png" alt="Tesla Logo" width={40} height={40} className="object-contain hidden dark:block" priority />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Tesla
              </h1>
              <p className="text-xs text-muted-foreground">Digital Coins</p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <motion.button
                className="hidden sm:block btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-6"
            >
              <div className="gradient-border px-6 py-2">
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ✨ Next Generation Digital Wallet
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Transfer Digital Coins
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Securely & Instantly
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            >
              Experience the future of digital finance with our premium platform. 
              Send, receive, and manage your digital coins with ease and security.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/register">
                <motion.button
                  className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link href="/auth/login">
                <motion.button
                  className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-20 relative"
          >
            <div className="glass rounded-3xl p-8 max-w-5xl mx-auto border border-primary/20 shadow-2xl glow">
              {loadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10"
                    >
                      <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                      {stat.description && (
                        <div className="text-xs text-muted-foreground/70 mt-1">
                          {stat.description}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Tesla?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology and security best practices
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card-hover p-8 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-20 text-center relative overflow-hidden border border-primary/20"
          >
            <div className="absolute inset-0 gradient-mesh opacity-30" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of users who trust Tesla for their digital coin transactions
              </p>
              <Link href="/auth/register">
                <motion.button
                  className="btn-primary text-lg px-12 py-5 inline-flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Create Your Wallet Now</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10">
                  <Image src="/logo.png" alt="Tesla Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-lg font-bold">Tesla</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure digital coin transfer platform for the modern world.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2025 Tesla. All rights reserved. Built with ❤️ for secure digital transactions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}