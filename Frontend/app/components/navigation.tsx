"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Wallet, 
  ArrowLeftRight, 
  History, 
  User, 
  Building2,
  HelpCircle,
  LogOut
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Transfer', href: '/transfer', icon: ArrowLeftRight },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'History', href: '/history', icon: History },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.logout();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed');
      // Still clear local storage and redirect
      localStorage.clear();
      router.push('/auth/login');
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/dashboard">
            <motion.div
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow bg-transparent dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900 p-2">
                <Image src="/T.png" alt="Tesla Logo" width={40} height={40} className="object-contain dark:hidden" priority />
                <Image src="/logo.png" alt="Tesla Logo" width={40} height={40} className="object-contain hidden dark:block" priority />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Tesla</h1>
                <p className="text-xs text-muted-foreground">Digital Coins</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      "relative px-4 py-2 rounded-lg flex items-center gap-3 transition-colors min-w-fit",
                      isActive 
                        ? "text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <motion.button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-error hover:bg-error/10 transition-colors min-w-fit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 pb-safe z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg transition-colors relative gap-1",
                    isActive 
                      ? "text-white bg-gradient-to-r from-orange-500 to-orange-600 font-semibold" 
                      : "text-muted-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
