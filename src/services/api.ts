import axios from 'axios';
import type { 
  Customer,
  OrderWithCustomer, 
  CustomerFormData, 
  OrderFormData, 
  DashboardStats,
  CustomerAnalysis,
  TopCustomer,
  DailyStats,
  WeeklyTrend,
  MonthlyTrend,
  InactiveCustomer,
  DeliveryTimeAnalysis,
  DailyDistribution,
  CustomerAnalytics,
  SubscriptionFormData
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer API
export const customerAPI = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getAnalytics: async (id: number): Promise<{ customer: Customer; analytics: CustomerAnalytics }> => {
    const response = await api.get(`/customers/${id}/analytics`);
    return response.data;
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CustomerFormData>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  updateLocation: async (id: number, location: string): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, { location });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

// Order API
export const orderAPI = {
  getAll: async (): Promise<OrderWithCustomer[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id: number): Promise<OrderWithCustomer> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getDaily: async (date: string): Promise<OrderWithCustomer[]> => {
    const response = await api.get(`/orders/daily/${date}`);
    return response.data;
  },

  create: async (data: OrderFormData): Promise<OrderWithCustomer> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  update: async (id: number, data: Partial<OrderFormData>): Promise<OrderWithCustomer> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, status: 'pending' | 'delivered' | 'cancelled'): Promise<OrderWithCustomer> => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const [customers, orders] = await Promise.all([
      customerAPI.getAll(),
      orderAPI.getAll(),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const totalCustomers = customers.length;

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalCustomers,
    };
  },
};

// Reports API
export const reportsAPI = {
  getCustomerAnalysis: async (): Promise<CustomerAnalysis[]> => {
    const response = await api.get('/reports/customer-analysis');
    return response.data;
  },

  getTopCustomers30Days: async (): Promise<TopCustomer[]> => {
    const response = await api.get('/reports/top-customers-30days');
    return response.data;
  },

  getDailyAverage: async (): Promise<DailyStats> => {
    const response = await api.get('/reports/daily-average');
    return response.data;
  },

  getWeeklyTrend: async (): Promise<WeeklyTrend[]> => {
    const response = await api.get('/reports/weekly-trend');
    return response.data;
  },

  getMonthlyTrend: async (): Promise<MonthlyTrend[]> => {
    const response = await api.get('/reports/monthly-trend');
    return response.data;
  },

  getInactiveCustomers: async (): Promise<InactiveCustomer[]> => {
    const response = await api.get('/reports/inactive-customers');
    return response.data;
  },

  getDeliveryTimeAnalysis: async (): Promise<DeliveryTimeAnalysis[]> => {
    const response = await api.get('/reports/delivery-time-analysis');
    return response.data;
  },

  getDailyDistribution: async (): Promise<DailyDistribution[]> => {
    const response = await api.get('/reports/daily-distribution');
    return response.data;
  },
}; 

// Abonelik API
export const subscriptionAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/subscriptions`);
    if (!response.ok) throw new Error('Abonelikler getirilemedi');
    return response.json();
  },

  getByCustomer: async (customerId: number) => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/customer/${customerId}`);
    if (!response.ok) throw new Error('Müşteri abonelikleri getirilemedi');
    return response.json();
  },

  create: async (data: SubscriptionFormData) => {
    const response = await fetch(`${API_BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Abonelik oluşturulamadı');
    return response.json();
  },

  update: async (id: number, data: Partial<SubscriptionFormData>) => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Abonelik güncellenemedi');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Abonelik silinemedi');
    return response.json();
  },

  generateOrders: async (days: number = 7) => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/generate-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days }),
    });
    if (!response.ok) throw new Error('Abonelik siparişleri oluşturulamadı');
    return response.json();
  },
}; 