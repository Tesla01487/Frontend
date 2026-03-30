"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Ban,
  Eye,
  Loader2,
} from 'lucide-react';
import AdminNavigation from '@/components/admin-navigation';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  status: 'active' | 'suspended' | 'pending';
  joinedDate: string;
}

interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalVolume: number;
  };
  charts: {
    transactionData: Array<{ day: string; transactions: number }>;
    revenueData: Array<{ month: string; revenue: number }>;
  };
  recentUsers: User[];
  recentTransactions: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        setLoading(true);
        const response = await api.getAdminDashboard();
        
        if (response.success && response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleSendEmail = async () => {
    if (!selectedUser || !emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await api.sendEmailToUser(
        selectedUser.id,
        emailSubject,
        emailMessage
      );

      if (response.success) {
        toast.success('Email sent successfully!');
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailMessage('');
        setSelectedUser(null);
      } else {
        toast.error(response.message || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSuspendAccount = async () => {
    if (!selectedUser) return;

    const confirmSuspend = confirm(
      `Are you sure you want to suspend ${selectedUser.name}'s account?`
    );

    if (!confirmSuspend) return;

    try {
      const newStatus = selectedUser.status === 'suspended' ? 'active' : 'suspended';
      const response = await api.updateUserStatus(selectedUser.id, newStatus);

      if (response.success) {
        toast.success(
          `Account ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`
        );
        setSelectedUser(null);
        // Refresh dashboard data
        window.location.reload();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error.message || 'Failed to update status');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <AdminNavigation />
        <div className="min-h-screen bg-background md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state if no data
  if (!dashboardData) {
    return (
      <>
        <AdminNavigation />
        <div className="min-h-screen bg-background md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error mb-4">Failed to load dashboard data</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Transactions',
      value: dashboardData.stats.totalTransactions.toLocaleString(),
      change: '+8.2%',
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Volume',
      value: formatCurrency(dashboardData.stats.totalVolume),
      change: '+15.3%',
      icon: DollarSign,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Active Users',
      value: dashboardData.stats.activeUsers.toLocaleString(),
      change: '+5.1%',
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  const filteredUsers = dashboardData.recentUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AdminNavigation />
      <div className="min-h-screen bg-background md:ml-64">
        <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-success">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transactions Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-bold mb-4">Weekly Transactions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.charts.transactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="transactions" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-bold mb-4">Monthly Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.charts.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">User Management</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Joined</th>
                  <th className="text-right py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono font-semibold">
                        {formatCurrency(user.balance)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div
            onClick={() => setSelectedUser(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold mb-6">User Details</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-semibold">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-semibold">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedUser.balance)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Joined Date</span>
                  <span className="font-semibold">
                    {new Date(selectedUser.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowEmailModal(true);
                    setSelectedUser(selectedUser);
                  }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </button>
                <button 
                  onClick={handleSuspendAccount}
                  className="flex-1 px-6 py-3 rounded-lg border border-error text-error hover:bg-error/10 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Ban className="w-5 h-5" />
                  {selectedUser.status === 'suspended' ? 'Activate' : 'Suspend'} Account
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Email Composition Modal */}
        {showEmailModal && selectedUser && (
          <div
            onClick={() => setShowEmailModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold mb-6">Send Email to {selectedUser.name}</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    To
                  </label>
                  <input
                    type="text"
                    value={selectedUser.email}
                    disabled
                    className="w-full px-4 py-3 bg-muted rounded-lg border border-border text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Enter your message"
                    rows={8}
                    className="w-full px-4 py-3 bg-background rounded-lg border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailSubject('');
                    setEmailMessage('');
                  }}
                  disabled={sendingEmail}
                  className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </main>
      </div>
    </>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'active' | 'suspended' | 'pending' }) {
  const config = {
    active: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      label: 'Active',
    },
    suspended: {
      icon: XCircle,
      color: 'text-error',
      bg: 'bg-error/10',
      label: 'Suspended',
    },
    pending: {
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      label: 'Pending',
    },
  };

  const { icon: Icon, color, bg, label } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
}
