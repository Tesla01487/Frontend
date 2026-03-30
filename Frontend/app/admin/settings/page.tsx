"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Mail,
  Bell,
  Shield,
  Database,
  Key,
  Globe,
  DollarSign,
} from 'lucide-react';
import AdminNavigation from '@/components/admin-navigation';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Tesla',
    siteUrl: 'https://tesla.com',
    supportEmail: 'support@tesla.com',
    
    // Email Settings
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    emailFrom: 'noreply@tesla.com',
    
    // Security Settings
    jwtSecret: '********',
    jwtExpiry: '7d',
    otpExpiry: '10',
    maxLoginAttempts: '5',
    
    // Transaction Settings
    minTransferAmount: '1',
    maxTransferAmount: '100000',
    transactionFee: '0.5',
    withdrawalLimit: '10000',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Feature Toggles
    registrationEnabled: true,
    withdrawalsEnabled: true,
    depositsEnabled: true,
    transfersEnabled: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <>
      <AdminNavigation />
      
      <div className="min-h-screen bg-background pt-16 lg:pl-64">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">System Settings</h1>
            <p className="text-muted-foreground">
              Configure platform settings and preferences
            </p>
          </motion.div>

          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Globe className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Site URL</label>
                <input
                  type="text"
                  value={settings.siteUrl}
                  onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Email Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Mail className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Email Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Port</label>
                <input
                  type="text"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">SMTP User</label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Password</label>
                <input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email From Address</label>
                <input
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Security Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">JWT Expiry</label>
                <input
                  type="text"
                  value={settings.jwtExpiry}
                  onChange={(e) => setSettings({ ...settings, jwtExpiry: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="7d"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">OTP Expiry (minutes)</label>
                <input
                  type="number"
                  value={settings.otpExpiry}
                  onChange={(e) => setSettings({ ...settings, otpExpiry: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Transaction Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <DollarSign className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Transaction Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Transfer Amount ($)</label>
                <input
                  type="number"
                  value={settings.minTransferAmount}
                  onChange={(e) => setSettings({ ...settings, minTransferAmount: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Max Transfer Amount ($)</label>
                <input
                  type="number"
                  value={settings.maxTransferAmount}
                  onChange={(e) => setSettings({ ...settings, maxTransferAmount: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Transaction Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.transactionFee}
                  onChange={(e) => setSettings({ ...settings, transactionFee: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Daily Withdrawal Limit ($)</label>
                <input
                  type="number"
                  value={settings.withdrawalLimit}
                  onChange={(e) => setSettings({ ...settings, withdrawalLimit: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>

          {/* Feature Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Feature Toggles</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Enable User Registration</span>
                <input
                  type="checkbox"
                  checked={settings.registrationEnabled}
                  onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Enable Withdrawals</span>
                <input
                  type="checkbox"
                  checked={settings.withdrawalsEnabled}
                  onChange={(e) => setSettings({ ...settings, withdrawalsEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Enable Deposits</span>
                <input
                  type="checkbox"
                  checked={settings.depositsEnabled}
                  onChange={(e) => setSettings({ ...settings, depositsEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Enable Transfers</span>
                <input
                  type="checkbox"
                  checked={settings.transfersEnabled}
                  onChange={(e) => setSettings({ ...settings, transfersEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass rounded-xl p-6 mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">Notification Settings</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">SMS Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-border focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save All Settings</span>
          </motion.button>
        </div>
      </div>
    </>
  );
}
