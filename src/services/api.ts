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
  DailyDistribution
} from '../types';

const API_BASE_URL = 'http://13.60.40.99:3001/api';

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

  create: async (data: CustomerFormData): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CustomerFormData>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
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