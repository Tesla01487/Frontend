import React from 'react';
import dynamic from 'next/dynamic';

// Lazy load admin components (only load when needed)
export const AdminDashboard = dynamic(() => import('@/app/admin/dashboard/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner w-8 h-8" />
    </div>
  ),
  ssr: false,
});

export const AdminUsers = dynamic(() => import('@/app/admin/users/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner w-8 h-8" />
    </div>
  ),
  ssr: false,
});

export const AdminTransactions = dynamic(() => import('@/app/admin/transactions/page'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner w-8 h-8" />
    </div>
  ),
  ssr: false,
});

// Lazy load heavy components
export const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-xl" />,
  ssr: false,
});

export const AnimatedComponents = dynamic(
  () => import('framer-motion').then((mod) => ({ motion: mod.motion, AnimatePresence: mod.AnimatePresence })),
  {
    ssr: true,
  }
);

export default {
  AdminDashboard,
  AdminUsers,
  AdminTransactions,
  QRCodeSVG,
  AnimatedComponents,
};
