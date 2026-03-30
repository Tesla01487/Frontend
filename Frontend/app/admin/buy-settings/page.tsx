"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Upload, Save, Loader2, CheckCircle, X } from 'lucide-react';
import AdminNavigation from '@/components/admin-navigation';
import { toast } from 'react-hot-toast';

export default function BuySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBuySettings();
  }, []);

  const fetchBuySettings = async () => {
    try {
      setLoading(true);
      // For now, load from localStorage or default values
      const savedSettings = localStorage.getItem('adminBuySettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setQrCodeImage(settings.qrCodeImage || '');
      }
    } catch (error) {
      console.error('Error fetching buy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setQrCodeImage(base64String);
      toast.success('QR code image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setQrCodeImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('QR code image removed');
  };

  const handleSaveSettings = async () => {
    try {
      if (!qrCodeImage) {
        toast.error('Please upload a QR code image');
        return;
      }

      setSaving(true);

      const settings = {
        qrCodeImage,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage (in production, save to database)
      localStorage.setItem('adminBuySettings', JSON.stringify(settings));

      toast.success('Buy settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <AdminNavigation />
      
      <main className="w-full px-4 pt-24 lg:ml-64 lg:pr-8 max-w-[calc(100vw-1rem)] lg:max-w-[calc(100vw-17rem)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Buy Coins Settings</h1>
          <p className="text-muted-foreground">
            Configure payment QR code and wallet details for users to buy coins
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Settings Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Payment Details
            </h2>

            {/* QR Code Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Upload QR Code Image *
              </label>
              
              {!qrCodeImage ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload QR code</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative border border-border rounded-lg p-4">
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="bg-white p-4 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      className="w-full h-auto max-w-[300px] mx-auto"
                    />
                  </div>
                  <p className="text-xs text-center text-green-500 mt-2 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    QR code uploaded successfully
                  </p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </motion.div>

          {/* QR Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Preview
            </h2>

            {qrCodeImage ? (
              <div className="space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeImage}
                    alt="Payment QR Code"
                    className="w-full h-auto max-w-[300px]"
                  />
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">QR Code Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Users can now scan this QR code to buy coins
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <QrCode className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No QR code generated yet</p>
                <p className="text-sm text-muted-foreground">
                  Fill in the payment details and save to generate QR code
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mt-8"
        >
          <h3 className="text-lg font-bold mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Admin Setup</h4>
                <p className="text-sm text-muted-foreground">
                  Upload payment QR code for users to scan
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">User Purchase</h4>
                <p className="text-sm text-muted-foreground">
                  Users scan QR, enter amount, and make payment
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Auto Credit</h4>
                <p className="text-sm text-muted-foreground">
                  Coins are credited to user&apos;s wallet automatically
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
