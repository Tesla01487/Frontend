"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Wallet,
  ArrowLeftRight,
  History,
  User,
  Building2,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Transfer", href: "/transfer", icon: ArrowLeftRight },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "History", href: "/history", icon: History },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    } finally {
      localStorage.clear();
      router.push("/auth/login");
    }
  };

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/dashboard">
              <motion.div
                className="flex items-center space-x-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 rounded-xl p-2 bg-transparent dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-900">
                  <Image
                    src="/T.png"
                    alt="Tesla Logo"
                    width={40}
                    height={40}
                    className="dark:hidden"
                  />
                  <Image
                    src="/logo.png"
                    alt="Tesla Logo"
                    width={40}
                    height={40}
                    className="hidden dark:block"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">Tesla</h1>
                  <p className="text-xs text-muted-foreground">
                    Digital Coins
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={cn(
                        "px-4 py-2 rounded-lg flex items-center gap-3 transition",
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-lg"
                whileHover={{ scale: 1.05 }}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg gap-1",
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "text-muted-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}

          {/* More */}
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center p-3 rounded-lg text-muted-foreground gap-1"
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs">More</span>
          </motion.button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Menu</h3>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl",
                        isActive
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                          : "bg-muted hover:bg-muted/70"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="col-span-2 flex items-center gap-3 p-4 rounded-xl text-error bg-error/10"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
