const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://teslacoin.co';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      // Try to parse response as JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, throw a clear error
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error('Invalid response from server');
      }

      // Handle HTTP errors
      if (!response.ok) {
        // Extract error message more carefully
        let errorMessage = 'An error occurred';
        
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data && typeof data === 'object') {
          // Backend returns: { success: false, error: { message: "...", stack: "..." } }
          if (data.error && typeof data.error.message === 'string') {
            errorMessage = data.error.message;
          } else if (typeof data.message === 'string') {
            errorMessage = data.message;
          } else if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (data.message && typeof data.message === 'object') {
            errorMessage = JSON.stringify(data.message);
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        }
        
        // Handle token expiry - redirect to login
        if (response.status === 401 && (errorMessage.includes('Invalid token') || errorMessage.includes('Token expired'))) {
          this.clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      // Log the full error for debugging
      console.error('API Request Error Details:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorObject: error
      });
      
      // Handle different error types
      if (error instanceof Error) {
        // If it's already an Error with a message, throw it
        throw error;
      }
      
      // Handle TypeError (network errors, CORS, etc.)
      if (error instanceof TypeError) {
        throw new Error('Failed to connect to server. Please check if the backend is running.');
      }
      
      // Handle unknown errors - convert to string
      const errorMessage = typeof error === 'string' ? error : JSON.stringify(error);
      throw new Error(`An unexpected error occurred: ${errorMessage}`);
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  private clearAuth(): void {
    this.removeToken();
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: { userId: string; otp: string; purpose: string }) {
    const response = await this.request<{
      user: any;
      token: string;
      refreshToken: string;
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens and user data
    if (response.data) {
      this.setToken(response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async resendOTP(data: { userId: string; purpose: string }) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: { email: string }) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: {
    userId: string;
    otp: string;
    newPassword: string;
  }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }

  // User endpoints
  async getDashboard() {
    return this.request('/users/dashboard', {
      method: 'GET',
    });
  }

  async getProfile() {
    return this.request('/users/profile', {
      method: 'GET',
    });
  }

  async updateProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async setTransactionPin(data: { pin: string; currentPin?: string; password?: string }) {
    return this.request('/users/pin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance', {
      method: 'GET',
    });
  }

  async deposit(data: { amount: number }) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdraw(data: { amount: number }) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async getTransactions(params?: {
    type?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return this.request(`/transactions/history${queryString}`, {
      method: 'GET',
    });
  }

  async transferCoins(data: {
    recipientWalletId: string;
    amount: number;
    note?: string;
    pin?: string;
  }) {
    return this.request('/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestDeposit(data: {
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
  }) {
    return this.request('/transactions/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async requestWithdrawal(data: {
    amount: number;
    bankAccount: string;
    ifscCode: string;
    accountHolderName: string;
  }) {
    return this.request('/transactions/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'GET',
    });
  }

  async exportTransactions() {
    return this.request('/transactions/export', {
      method: 'GET',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard', {
      method: 'GET',
    });
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
      : '';
    return this.request(`/admin/users${queryString}`, {
      method: 'GET',
    });
  }

  async getAdminUserById(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'GET',
    });
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async sendEmailToUser(userId: string, subject: string, message: string) {
    return this.request('/admin/send-email', {
      method: 'POST',
      body: JSON.stringify({ userId, subject, message }),
    });
  }

  // Public endpoints (no auth required)
  async getPublicStats() {
    try {
      const response = await fetch(`${this.baseUrl}/public/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Prevent caching issues
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching public stats:', error);
      // Return default stats in case of error
      return { 
        success: false, 
        error: 'Failed to fetch statistics',
        data: {
          stats: [
            { value: '0+', label: 'Active Users', description: 'Trusted users worldwide' },
            { value: '$0.0M', label: 'Total Volume', description: 'In secure transactions' },
            { value: '99.9%', label: 'Uptime', description: 'Reliable service' },
            { value: '24/7', label: 'Support', description: 'Always available' },
          ]
        }
      };
    }
  }

  // Transactions endpoints
  async getAllTransactions() {
    return this.request('/admin/transactions', {
      method: 'GET',
    });
  }

  async getTransactionById(id: string) {
    return this.request(`/admin/transactions/${id}`, {
      method: 'GET',
    });
  }

  // Deposits endpoints
  async getAllDeposits() {
    return this.request('/admin/deposits', {
      method: 'GET',
    });
  }

  async approveDeposit(depositId: string) {
    return this.request(`/admin/deposits/${depositId}/approve`, {
      method: 'POST',
    });
  }

  async rejectDeposit(depositId: string) {
    return this.request(`/admin/deposits/${depositId}/reject`, {
      method: 'POST',
    });
  }

  // Withdrawals endpoints
  async getAllWithdrawals() {
    return this.request('/admin/withdrawals', {
      method: 'GET',
    });
  }

  async approveWithdrawal(withdrawalId: string) {
    return this.request(`/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'POST',
    });
  }

  async rejectWithdrawal(withdrawalId: string) {
    return this.request(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'POST',
    });
  }

  // Support tickets endpoints
  async getAllSupportTickets() {
    return this.request('/admin/support', {
      method: 'GET',
    });
  }

  async getSupportTicketById(id: string) {
    return this.request(`/admin/support/${id}`, {
      method: 'GET',
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    return this.request(`/admin/support/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async replyToTicket(ticketId: string, message: string) {
    return this.request(`/admin/support/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // User support ticket endpoints
  async createSupportTicket(data: { subject: string; category: string; message: string }) {
    return this.request('/users/support-tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserSupportTickets() {
    return this.request('/users/support-tickets', {
      method: 'GET',
    });
  }

  async getUserSupportTicketById(id: string) {
    return this.request(`/users/support-tickets/${id}`, {
      method: 'GET',
    });
  }

  // Company endpoints
  async getAllCompanies() {
    return this.request('/companies', {
      method: 'GET',
    });
  }

  async getCompanyById(id: string) {
    return this.request(`/companies/${id}`, {
      method: 'GET',
    });
  }

  async getCompanyChart(id: string, period: string = '6m') {
    return this.request(`/companies/${id}/chart?period=${period}`, {
      method: 'GET',
    });
  }

  async updateCompanyQRCode(id: string, qrCode: string, walletId: string) {
    return this.request(`/companies/${id}/qr-code`, {
      method: 'POST',
      body: JSON.stringify({ qrCode, walletId }),
    });
  }

  async seedCompanies() {
    return this.request('/companies/seed', {
      method: 'POST',
    });
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}

export const api = new ApiClient();
export default api;
