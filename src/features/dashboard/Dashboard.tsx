import React, { useState, useEffect } from 'react';
import type { OrderWithCustomer, DashboardStats } from '../../types';
import { orderAPI, dashboardAPI } from '../../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalCustomers: 0,
  });
  const [todayOrders, setTodayOrders] = useState<OrderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [statsData, todayOrdersData] = await Promise.all([
        dashboardAPI.getStats(),
        orderAPI.getDaily(today),
      ]);

      setStats(statsData);
      setTodayOrders(todayOrdersData);
      setError(null);
    } catch (err) {
      setError('Dashboard verileri yüklenirken hata oluştu');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Toplam Sipariş</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          <div className="text-sm text-gray-600">Bekleyen</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
          <div className="text-sm text-gray-600">Teslim Edilen</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600">Toplam Müşteri</div>
        </div>
      </div>

      {/* Bugünkü Siparişler */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Bugünkü Siparişler ({formatDate(new Date().toISOString())})
        </h2>
        
        {todayOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Bugün için sipariş bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            {order.customerPhone}
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              title="Ara"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.687-2.183l-2.262-.565a2.25 2.25 0 00-2.591 1.01l-.422.704a11.978 11.978 0 01-5.31-5.31l.704-.422a2.25 2.25 0 001.01-2.591l-.565-2.262A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.quantity} B
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 