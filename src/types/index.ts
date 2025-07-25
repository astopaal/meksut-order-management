export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  location?: string; // Koordinat bilgisi (lat,lon formatında)
  created_at?: string;
  updated_at?: string;
  district?: string | null;
  city?: string | null;
  lastOrderDate?: string | null;
  totalOrders?: number;
  isActive?: boolean;
}

export interface Order {
  id: number;
  customerId: number;
  deliveryTime: 'morning' | 'evening';
  orderDate: string;
  status: 'pending' | 'delivered' | 'cancelled';
  quantity: number;
  created_at?: string;
  updated_at?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface OrderWithCustomer extends Order {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerLocation?: string; // Koordinat bilgisi (lat,lon formatında)
}

export interface CustomerFormData {
  name: string;
  phone: string;
  address?: string;
}

export interface OrderFormData {
  customerId: number;
  deliveryTime: 'morning' | 'evening';
  orderDate: string;
  status?: 'pending' | 'delivered' | 'cancelled';
  quantity: number;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
}

// Raporlama Tipleri
export interface CustomerAnalysis {
  id: number;
  name: string;
  phone: string;
  total_orders: number;
  delivered_orders: number;
  pending_orders: number;
  first_order_date: string;
  last_order_date: string;
  avg_days_between_orders: number | null;
  days_since_last_order: number | null;
}

export interface TopCustomer {
  name: string;
  phone: string;
  order_count: number;
  morning_orders: number;
  evening_orders: number;
}

export interface DailyStats {
  total_orders_30days: number;
  daily_average: number;
  morning_orders: number;
  evening_orders: number;
  delivered_orders: number;
  pending_orders: number;
}

export interface WeeklyTrend {
  week: string;
  order_count: number;
  morning_orders: number;
  evening_orders: number;
}

export interface MonthlyTrend {
  month: string;
  order_count: number;
  morning_orders: number;
  evening_orders: number;
}

export interface InactiveCustomer {
  id: number;
  name: string;
  phone: string;
  last_order_date: string | null;
  days_inactive: number | null;
  total_orders: number;
}

export interface DeliveryTimeAnalysis {
  deliveryTime: 'morning' | 'evening';
  order_count: number;
  percentage: number;
}

export interface DailyDistribution {
  orderDate: string;
  order_count: number;
  morning_orders: number;
  evening_orders: number;
}

// Yama Notları Tipleri
export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface ChangelogModalState {
  isOpen: boolean;
  showAgain: boolean;
}

// Müşteri Analitik Tipleri
export interface CustomerAnalytics {
  totalOrders: number;
  totalQuantity: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  avgDaysBetweenOrders: number | null;
  morningOrders: number;
  eveningOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
}