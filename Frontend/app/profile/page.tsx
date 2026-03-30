"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Camera,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Wallet,
  Settings,
  Save,
  Loader2,
} from 'lucide-react';
import Navigation from '@/components/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'notifications'
  >('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [walletId, setWalletId] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Settings state
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!api.isAuthenticated()) {
          toast.error('Please login to view your profile');
          router.push('/auth/login');
          return;
        }

        const response = await api.getProfile();
        if (response.success && response.data) {
          const user = response.data;
          setValue('name', user.name || '');
          setValue('email', user.email || '');
          setValue('phone', user.phone || '');
          setWalletId(user.wallet_id || user.walletId || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, setValue]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setUpdating(true);
    try {
      const response = await api.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setUpdating(true);
    try {
      const response = await api.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
        resetPassword();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile picture uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const copyWalletId = () => {
    navigator.clipboard.writeText(walletId);
    setCopied(true);
    toast.success('Wallet ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 bg-muted rounded-xl p-2 inline-flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeProfileTab"
                      className="absolute inset-0 gradient-primary rounded-lg"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center h-96"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activeTab === 'profile' && (
              <div className="max-w-3xl">
                <div className="card p-8 mb-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-card flex items-center justify-center">
                        {profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Click to upload profile picture
                  </p>
                </div>

                {/* Wallet ID Display */}
                <div className="mb-6 p-4 bg-muted rounded-xl">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Your Wallet ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={walletId}  
                      readOnly
                      className="input flex-1 font-mono bg-background"
                    />
                    <motion.button
                      onClick={copyWalletId}
                      className="btn-primary px-6"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('name')}
                        type="text"
                        disabled={!isEditing}
                        className="input pl-10"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-error text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('email')}
                        type="email"
                        disabled={!isEditing}
                        className="input pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-error text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                      <input
                        {...register('phone')}
                        type="tel"
                        disabled={!isEditing}
                        className="input pl-10"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-error text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    {isEditing ? (
                      <>
                        <motion.button
                          type="submit"
                          disabled={updating}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                          whileHover={{ scale: updating ? 1 : 1.02 }}
                          whileTap={{ scale: updating ? 1 : 0.98 }}
                        >
                          {updating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          {updating ? 'Saving...' : 'Save Changes'}
                        </motion.button>
                        <motion.button
                          type="button"
                          disabled={updating}
                          onClick={() => setIsEditing(false)}
                          className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold disabled:opacity-50"
                          whileHover={{ scale: updating ? 1 : 1.02 }}
                          whileTap={{ scale: updating ? 1 : 0.98 }}
                        >
                          Cancel
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Settings className="w-5 h-5" />
                        Edit Profile
                      </motion.button>
                    )}
                  </div>
                </form>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">156</div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-success mb-2">45 days</div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                </div>
                <div className="card p-6 text-center">
                  <div className="text-3xl font-bold text-warning mb-2">$2.5K</div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-3xl">
              {/* Change Password */}
              <div className="card p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Change Password
                </h2>
                <form
                  onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...registerPassword('currentPassword')}
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="input pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-error text-sm mt-1">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...registerPassword('newPassword')}
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="input pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-error text-sm mt-1">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        {...registerPassword('confirmPassword')}
                        type="password"
                        placeholder="Confirm new password"
                        className="input pl-10"
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-error text-sm mt-1">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    className="btn-primary w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Update Password
                  </motion.button>
                </form>
              </div>

              {/* Security Settings */}
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <h3 className="font-semibold mb-1">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twoFaEnabled}
                        onChange={(e) => setTwoFaEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <h3 className="font-semibold mb-1">Biometric Login</h3>
                      <p className="text-sm text-muted-foreground">
                        Use fingerprint or face ID to login
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={biometricEnabled}
                        onChange={(e) => setBiometricEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-3xl">
              <div className="card p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <h3 className="font-semibold mb-1">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive updates via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <h3 className="font-semibold mb-1">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div>
                      <h3 className="font-semibold mb-1">Transaction Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Get notified about all transactions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={transactionAlerts}
                        onChange={(e) => setTransactionAlerts(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-muted-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
