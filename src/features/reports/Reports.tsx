import React, { useState, useEffect } from 'react';
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
    <div className="space-y-6">
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
        <div className="space-y-6">
          {/* Daily Stats */}
          {dailyStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600">{dailyStats.daily_average}</div>
                <div className="text-sm text-gray-600">Günlük Ortalama</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">{dailyStats.total_orders_30days}</div>
                <div className="text-sm text-gray-600">Son 30 Gün</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-yellow-600">{dailyStats.morning_orders}</div>
                <div className="text-sm text-gray-600">Sabah Siparişleri</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">{dailyStats.evening_orders}</div>
                <div className="text-sm text-gray-600">Akşam Siparişleri</div>
              </div>
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
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Müşteri Sipariş Analizi</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teslim Edilen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İlk Sipariş</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Sipariş</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ortalama Gün</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customerAnalysis.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{customer.total_orders}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{customer.delivered_orders}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.first_order_date ? formatDate(customer.first_order_date) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.last_order_date ? formatDate(customer.last_order_date) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.avg_days_between_orders ? `${customer.avg_days_between_orders} gün` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Weekly Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Haftalık Sipariş Trendi (Son 8 Hafta)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hafta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sabah</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akşam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weeklyTrend.map((week, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{week.week}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{week.order_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{week.morning_orders}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{week.evening_orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Sipariş Trendi (Son 12 Ay)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sabah</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akşam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyTrend.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{month.month}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{month.order_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{month.morning_orders}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{month.evening_orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Customers Tab */}
      {activeTab === 'inactive' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pasif Müşteriler</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Sipariş</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasif Gün</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam Sipariş</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inactiveCustomers.map((customer) => {
                  const status = getInactiveStatus(customer.days_inactive);
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
                        <span className={status.color}>{status.text}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{customer.total_orders}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    </div>
  );
};

export default Reports; 