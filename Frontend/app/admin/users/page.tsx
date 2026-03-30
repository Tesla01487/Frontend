"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Wallet,
  Ban,
  Trash2,
  Eye,
  Loader2,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import AdminNavigation from '@/components/admin-navigation';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  wallet_id: string;
  balance: number;
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  last_login: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface AdminUsersResponse {
  users: User[];
  pagination: PaginationData;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      setLoading(true);
      const response = await api.getAdminUsers({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: searchQuery,
      });

      if (response.success && response.data) {
        const data = response.data as AdminUsersResponse;
        setUsers(data.users || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter]);

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const response = await api.updateUserStatus(userId, newStatus);

      if (response.success) {
        toast.success(`User status updated to ${newStatus}`);
        fetchUsers();
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setUpdating(true);
      const response = await api.deleteUser(userToDelete.id);

      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (loading && users.length === 0) {
    return (
      <>
        <AdminNavigation />
        <div className="min-h-screen bg-background md:ml-64 flex items-center justify-center pt-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavigation />
      <div className="min-h-screen bg-background md:ml-64 pt-20 pb-24 md:pb-8">
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage all registered users, view details, and update status
            </p>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or wallet ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input pl-12 w-full"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-0/5 w-5 h-5 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input pl-10 w-full"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleSearch}
                className="btn-primary"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>

              <button
                onClick={fetchUsers}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 inline ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold">User</th>
                    <th className="text-left py-4 px-4 font-semibold">Contact</th>
                    <th className="text-left py-4 px-4 font-semibold">Wallet</th>
                    <th className="text-right py-4 px-4 font-semibold">Balance</th>
                    <th className="text-center py-4 px-4 font-semibold">Status</th>
                    <th className="text-center py-4 px-4 font-semibold">Joined</th>
                    <th className="text-right py-4 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <p className="text-muted-foreground">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs truncate max-w-[150px]">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs">{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{user.wallet_id}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-mono font-semibold">
                            {formatCurrency(user.balance || 0)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <StatusBadge status={user.status} />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div
            onClick={() => setShowUserModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-semibold">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Wallet ID</span>
                  <span className="font-mono font-semibold">{selectedUser.wallet_id}</span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedUser.balance || 0)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={selectedUser.status} />
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Joined Date</span>
                  <span className="font-semibold">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Last Login</span>
                  <span className="font-semibold">
                    {selectedUser.last_login
                      ? new Date(selectedUser.last_login).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                    disabled={updating}
                    className="flex-1 px-6 py-3 rounded-lg border border-error text-error hover:bg-error/10 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Ban className="w-5 h-5" />
                        Suspend User
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                    disabled={updating}
                    className="flex-1 px-6 py-3 rounded-lg bg-success text-white hover:bg-success/90 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        Activate User
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-error" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Delete User?</h2>
                <p className="text-muted-foreground">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-foreground">{userToDelete.name}</span>?
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-border hover:bg-muted transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={updating}
                  className="flex-1 px-6 py-3 rounded-lg bg-error text-white hover:bg-error/90 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
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
