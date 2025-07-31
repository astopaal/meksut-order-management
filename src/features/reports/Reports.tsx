import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { 
  CustomerAnalysis, 
  TopCustomer, 
  DailyStats, 
  WeeklyTrend, 
  MonthlyTrend, 
  InactiveCustomer, 
  DeliveryTimeAnalysis, 
  DailyDistribution 
} from '../../types';
import { reportsAPI } from '../../services/api';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [customerAnalysis, setCustomerAnalysis] = useState<CustomerAnalysis[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrend[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<InactiveCustomer[]>([]);
  const [deliveryAnalysis, setDeliveryAnalysis] = useState<DeliveryTimeAnalysis[]>([]);
  const [dailyDistribution, setDailyDistribution] = useState<DailyDistribution[]>([]);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const [
        customerAnalysisData,
        topCustomersData,
        dailyStatsData,
        weeklyTrendData,
        monthlyTrendData,
        inactiveCustomersData,
        deliveryAnalysisData,
        dailyDistributionData
      ] = await Promise.all([
        reportsAPI.getCustomerAnalysis(),
        reportsAPI.getTopCustomers30Days(),
        reportsAPI.getDailyAverage(),
        reportsAPI.getWeeklyTrend(),
        reportsAPI.getMonthlyTrend(),
        reportsAPI.getInactiveCustomers(),
        reportsAPI.getDeliveryTimeAnalysis(),
        reportsAPI.getDailyDistribution()
      ]);

      setCustomerAnalysis(customerAnalysisData);
      setTopCustomers(topCustomersData);
      setDailyStats(dailyStatsData);
      setWeeklyTrend(weeklyTrendData);
      setMonthlyTrend(monthlyTrendData);
      setInactiveCustomers(inactiveCustomersData);
      setDeliveryAnalysis(deliveryAnalysisData);
      setDailyDistribution(dailyDistributionData);
      setError(null);
    } catch (err) {
      setError('Raporlar yüklenirken hata oluştu');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getInactiveStatus = (days: number | null) => {
    if (!days) return { text: 'Hiç sipariş vermemiş', color: 'text-red-600' };
    if (days <= 7) return { text: `${days} gün önce`, color: 'text-green-600' };
    if (days <= 14) return { text: `${days} gün önce`, color: 'text-yellow-600' };
    return { text: `${days} gün önce`, color: 'text-red-600' };
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
          onClick={loadAllReports}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', name: 'Genel Bakış' },
            { id: 'customers', name: 'Müşteri Analizi' },
            { id: 'trends', name: 'Trendler' },
            { id: 'inactive', name: 'Pasif Müşteriler' },
            { id: 'delivery', name: 'Teslimat Analizi' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Daily Stats */}
          {dailyStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="text-2xl font-bold text-blue-600">{dailyStats.daily_average}</div>
                <div className="text-sm text-gray-600">Günlük Ortalama</div>
              </motion.div>
              <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className="text-2xl font-bold text-green-600">{dailyStats.total_orders_30days}</div>
                <div className="text-sm text-gray-600">Son 30 Gün</div>
              </motion.div>
              <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex flex-row justify-center items-center gap-1">
                  <span className="text-lg font-bold text-yellow-600">S: {dailyStats.morning_orders}</span>
                  <span className="text-lg font-bold text-purple-600">A: {dailyStats.evening_orders}</span>
                </div>
                <div className="text-sm text-gray-600">Sabah & Akşam Siparişleri</div>
              </motion.div>
              <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <div className="text-2xl font-bold text-purple-600">{
                  dailyDistribution && dailyDistribution.length > 0
                    ? (
                        dailyDistribution.slice(0, 7).reduce((sum, day) => sum + (day.order_count ?? 0), 0) / Math.min(7, dailyDistribution.length)
                      ).toFixed(1)
                    : '-'
                }</div>
                <div className="text-sm text-gray-600">Son 1 Hafta Ortalama</div>
              </motion.div>
              <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="text-2xl font-bold text-indigo-600">{dailyStats.total_orders_30days ? (dailyStats.total_orders_30days / 30).toFixed(1) : '-'}</div>
                <div className="text-sm text-gray-600">Son 1 Ay Ortalama</div>
              </motion.div>
            </div>
          )}

          {/* Top Customers */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son 30 Günde En Çok Sipariş Veren Müşteriler</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sabah</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akşam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topCustomers.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.order_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.morning_orders}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.evening_orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {customerAnalysis.length}
                </div>
                <div className="text-sm text-blue-700 font-medium">Toplam Müşteri</div>
                <div className="text-xs text-blue-600">Analiz edilen</div>
              </div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {customerAnalysis.reduce((sum, c) => sum + c.total_orders, 0)}
                </div>
                <div className="text-sm text-green-700 font-medium">Toplam Sipariş</div>
                <div className="text-xs text-green-600">Tüm müşteriler</div>
              </div>
            </div>
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {customerAnalysis.reduce((sum, c) => sum + c.delivered_orders, 0)}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Teslim Edilen</div>
                <div className="text-xs text-yellow-600">Toplam teslimat</div>
              </div>
            </div>
            <div className="card bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(customerAnalysis.reduce((sum, c) => sum + (c.avg_days_between_orders || 0), 0) / customerAnalysis.filter(c => c.avg_days_between_orders).length)}
                </div>
                <div className="text-sm text-purple-700 font-medium">Ortalama Gün</div>
                <div className="text-xs text-purple-600">Siparişler arası</div>
              </div>
            </div>
          </div>

          {/* En Aktif Müşteriler */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">En Aktif Müşteriler (Top 5)</h3>
            <div className="space-y-3">
              {customerAnalysis.slice(0, 5).map((customer, index) => {
                const maxOrders = Math.max(...customerAnalysis.map(c => c.total_orders));
                const percentage = maxOrders > 0 ? (customer.total_orders / maxOrders) * 100 : 0;
                
                return (
                  <div key={customer.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{customer.total_orders}</div>
                      <div className="text-xs text-gray-500">sipariş</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detaylı Tablo */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tüm Müşteri Analizi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teslim Edilen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teslimat Oranı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İlk Sipariş</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Sipariş</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ortalama Gün</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customerAnalysis.map((customer) => {
                    const deliveryRate = customer.total_orders > 0 ? Math.round((customer.delivered_orders / customer.total_orders) * 100) : 0;
                    const getStatusColor = () => {
                      if (customer.total_orders === 0) return 'text-gray-500 bg-gray-100';
                      if (deliveryRate >= 90) return 'text-green-600 bg-green-100';
                      if (deliveryRate >= 70) return 'text-yellow-600 bg-yellow-100';
                      return 'text-red-600 bg-red-100';
                    };
                    const getStatusText = () => {
                      if (customer.total_orders === 0) return 'Yeni';
                      if (deliveryRate >= 90) return 'Mükemmel';
                      if (deliveryRate >= 70) return 'İyi';
                      return 'Düşük';
                    };
                    
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{customer.total_orders}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.delivered_orders}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                            %{deliveryRate}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {customer.first_order_date ? formatDate(customer.first_order_date) : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {customer.last_order_date ? formatDate(customer.last_order_date) : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {customer.avg_days_between_orders ? `${customer.avg_days_between_orders} gün` : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                            {getStatusText()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {weeklyTrend.reduce((sum, week) => sum + week.order_count, 0)}
                </div>
                <div className="text-sm text-blue-700 font-medium">Son 4 Hafta Toplam</div>
                <div className="text-xs text-blue-600">Haftalık ortalama: {Math.round(weeklyTrend.reduce((sum, week) => sum + week.order_count, 0) / 4)}</div>
              </div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {monthlyTrend.reduce((sum, month) => sum + month.order_count, 0)}
                </div>
                <div className="text-sm text-green-700 font-medium">Son 12 Ay Toplam</div>
                <div className="text-xs text-green-600">Aylık ortalama: {Math.round(monthlyTrend.reduce((sum, month) => sum + month.order_count, 0) / 12)}</div>
              </div>
            </div>
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {weeklyTrend.reduce((sum, week) => sum + week.morning_orders, 0)}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Sabah Siparişleri</div>
                <div className="text-xs text-yellow-600">Son 4 hafta</div>
              </div>
            </div>
            <div className="card bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {weeklyTrend.reduce((sum, week) => sum + week.evening_orders, 0)}
                </div>
                <div className="text-sm text-purple-700 font-medium">Akşam Siparişleri</div>
                <div className="text-xs text-purple-600">Son 4 hafta</div>
              </div>
            </div>
          </div>

          {/* Haftalık Trend Grafik */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Haftalık Sipariş Trendi (Son 4 Hafta)</h3>
            <div className="space-y-4">
              {weeklyTrend.map((week, index) => {
                const total = week.order_count;
                const morningPercent = total > 0 ? (week.morning_orders / total) * 100 : 0;
                const eveningPercent = total > 0 ? (week.evening_orders / total) * 100 : 0;
                const maxValue = Math.max(...weeklyTrend.map(w => w.order_count));
                const barHeight = maxValue > 0 ? (total / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{week.week}</span>
                      <span className="text-gray-500">{total} sipariş</span>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-purple-500 rounded-lg"
                        style={{ width: `${barHeight}%` }}
                      >
                        <div className="flex h-full">
                          <div 
                            className="bg-yellow-400 h-full"
                            style={{ width: `${morningPercent}%` }}
                          ></div>
                          <div 
                            className="bg-purple-500 h-full"
                            style={{ width: `${eveningPercent}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs text-white font-medium">
                        <span>{week.morning_orders} sabah</span>
                        <span>{week.evening_orders} akşam</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Sabah Siparişleri</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Akşam Siparişleri</span>
              </div>
            </div>
          </div>

          {/* Aylık Trend Grafik */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Sipariş Trendi (Son 12 Ay)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {monthlyTrend.map((month, index) => {
                const total = month.order_count;
                const maxValue = Math.max(...monthlyTrend.map(m => m.order_count));
                const barHeight = maxValue > 0 ? (total / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-2">{month.month}</div>
                    <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                        style={{ height: `${barHeight}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-end justify-center pb-2">
                        <span className="text-xs font-medium text-gray-700">{total}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Sabah: {month.morning_orders}</div>
                      <div>Akşam: {month.evening_orders}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detaylı Tablolar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Haftalık Detaylar</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hafta</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sabah</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Akşam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {weeklyTrend.map((week, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-900">{week.week}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-medium">{week.order_count}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{week.morning_orders}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{week.evening_orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Aylık Detaylar</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ay</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sabah</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Akşam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthlyTrend.map((month, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs text-gray-900">{month.month}</td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-medium">{month.order_count}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{month.morning_orders}</td>
                        <td className="px-3 py-2 text-xs text-gray-900">{month.evening_orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Customers Tab */}
      {activeTab === 'inactive' && (
        <div className="space-y-6">
          {/* Açıklama Kartı */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Pasif Müşteri Kriterleri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Kritik (14+ gün)</span>
                    <span className="text-red-600">Acil aksiyon gerekli</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-700 font-medium">Uyarı (8-14 gün)</span>
                    <span className="text-yellow-600">İletişim kurulmalı</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-red-50 border-red-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {inactiveCustomers.filter(c => !c.days_inactive || c.days_inactive > 14).length}
                </div>
                <div className="text-sm text-red-700 font-medium">Kritik Durum</div>
                <div className="text-xs text-red-600">14+ gün pasif</div>
              </div>
            </div>
            <div className="card bg-yellow-50 border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {inactiveCustomers.filter(c => c.days_inactive && c.days_inactive > 7 && c.days_inactive <= 14).length}
                </div>
                <div className="text-sm text-yellow-700 font-medium">Uyarı</div>
                <div className="text-xs text-yellow-600">8-14 gün pasif</div>
              </div>
            </div>
            <div className="card bg-gray-50 border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {inactiveCustomers.filter(c => !c.days_inactive).length}
                </div>
                <div className="text-sm text-gray-700 font-medium">Hiç Sipariş Vermemiş</div>
                <div className="text-xs text-gray-600">Yeni müşteriler</div>
              </div>
            </div>
          </div>

          {/* Müşteri Listesi */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pasif Müşteri Listesi</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Sipariş</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Sipariş</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inactiveCustomers.map((customer) => {
                    const status = getInactiveStatus(customer.days_inactive);
                    const getActionText = () => {
                      if (!customer.days_inactive) return 'İlk sipariş için teşvik et';
                      if (customer.days_inactive > 14) return 'Acil iletişim kur';
                      if (customer.days_inactive > 7) return 'Hatırlatma gönder';
                      return 'Normal durum';
                    };
                    const getActionColor = () => {
                      if (!customer.days_inactive) return 'text-blue-600 bg-blue-50';
                      if (customer.days_inactive > 14) return 'text-red-600 bg-red-50';
                      if (customer.days_inactive > 7) return 'text-yellow-600 bg-yellow-50';
                      return 'text-green-600 bg-green-50';
                    };
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {customer.last_order_date ? formatDate(customer.last_order_date) : 'Hiç sipariş vermemiş'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`}></div>
                            <span className={status.color}>{status.text}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.total_orders}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor()}`}>
                            {getActionText()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Analysis Tab */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          {/* Delivery Time Analysis */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Saati Analizi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveryAnalysis.map((delivery, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{delivery.order_count}</div>
                  <div className="text-sm text-gray-600">
                    {delivery.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'} Siparişleri
                  </div>
                  <div className="text-xs text-gray-500">%{delivery.percentage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Sipariş Dağılımı (Son 7 Gün)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sabah</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akşam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyDistribution.map((day, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{formatDate(day.orderDate)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{day.order_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{day.morning_orders}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{day.evening_orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;