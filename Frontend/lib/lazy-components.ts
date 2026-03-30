// Dynamic imports for lazy loading heavy components without JSX syntax
import React from 'react';
import dynamic from 'next/dynamic';

function loadingSpinner() {
  return React.createElement(
    'div',
    { className: 'flex items-center justify-center min-h-screen' },
    React.createElement('div', { className: 'spinner w-8 h-8' })
  );
}

export const AdminDashboard = dynamic(() => import('@/app/admin/dashboard/page'), {
  loading: loadingSpinner,
  ssr: false,
});

export const AdminUsers = dynamic(() => import('@/app/admin/users/page'), {
  loading: loadingSpinner,
  ssr: false,
});

export const AdminTransactions = dynamic(() => import('@/app/admin/transactions/page'), {
  loading: loadingSpinner,
  ssr: false,
});

export const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), {
  loading: () => React.createElement('div', { className: 'w-full h-full bg-muted animate-pulse rounded-xl' }),
  ssr: false,
});

export const AnimatedComponents = dynamic(
  () => import('framer-motion').then((mod) => ({ motion: mod.motion, AnimatePresence: mod.AnimatePresence })),
  { ssr: true }
);

const exported = {
  AdminDashboard,
  AdminUsers,
  AdminTransactions,
  QRCodeSVG,
  AnimatedComponents,
};

export default exported;
