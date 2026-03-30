"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  DollarSign,
  Mail,
  CreditCard,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Transactions', href: '/admin/transactions', icon: Activity },
  { name: 'Deposits', href: '/admin/deposits', icon: CreditCard },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: DollarSign },
  { name: 'Buy Settings', href: '/admin/buy-settings', icon: Mail },
  { name: 'Support', href: '/admin/support', icon: HelpCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.logout();
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
      // Still clear local storage and redirect
      localStorage.clear();
      router.push('/admin/login');
    }
  };

  return (
    <>
      {/* Top Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 bg-background/95 backdrop-blur-lg"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Admin Logo */}
            <Link href="/admin/dashboard">
              <motion.div
                className="flex items-center gap-3 group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-transparent dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900 p-1.5">
                  <Image src="/T.png" alt="Tesla Logo" width={32} height={32} className="object-contain dark:hidden" priority />
                  <Image src="/logo.png" alt="Tesla Logo" width={32} height={32} className="object-contain hidden dark:block" priority />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-muted-foreground">Tesla Management</p>
                </div>
              </motion.div>
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* Admin Profile */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium whitespace-nowrap">Admin</p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">Administrator</p>
                </div>
              </div>

              <motion.button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors min-w-fit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border/50 overflow-y-auto z-40 hidden lg:block"
      >
        <div className="p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "relative px-4 py-3 rounded-lg flex items-center space-x-3 transition-all",
                    isActive
                      ? "bg-blue-500/10 text-blue-500 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminTab"
                      className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5", isActive && "relative z-10")} />
                  <span className={cn(isActive && "relative z-10")}>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-muted/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Administrator</p>
              <p className="text-xs text-muted-foreground">admin@cryptowallet.com</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border/50"
      >
        <div className="grid grid-cols-4 gap-1 p-2">
          {adminNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg transition-colors relative",
                    isActive
                      ? "text-blue-500 bg-blue-500/10 font-semibold"
                      : "text-muted-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={cn("w-6 h-6", isActive && "relative z-10")} />
                  <span className={cn("text-xs font-medium mt-1", isActive && "relative z-10")}>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
