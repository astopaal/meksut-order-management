import React, { useState, useEffect } from 'react';
import type { OrderWithCustomer, DashboardStats, ChangelogEntry, ChangelogModalState } from '../../types';
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
  const [changelogModal, setChangelogModal] = useState<ChangelogModalState>({
    isOpen: false,
    showAgain: true,
  });

  // Yama notları verisi
  const changelogEntries: ChangelogEntry[] = [
    {
      id: '1',
      title: 'Sipariş Miktar Girme',
      description: 'Sipariş oluştururken miktar girişi eklendi. Artık her sipariş için bidon miktarı belirtilebilir.',
      date: '2024-01-15',
      version: '1.1.0',
    },
    {
      id: '2',
      title: 'Müşteri Filtreleme',
      description: 'Sipariş oluştururken müşteri arama ve filtreleme özelliği eklendi. Müşteri adı veya telefon numarası ile hızlı arama yapabilirsiniz.',
      date: '2024-01-15',
      version: '1.1.0',
    },
    {
      id: '3',
      title: 'Telefon Arama Kısayolu',
      description: 'Ana sayfadaki sipariş listesinde müşteri telefon numaralarına tıklayarak direkt arama yapabilirsiniz.',
      date: '2024-01-15',
      version: '1.1.0',
    },
    {
      id: '4',
      title: 'Ana Sayfa Tasarım İyileştirmesi',
      description: 'Dashboard tasarımı mobil cihazlar için optimize edildi. Horizontal scroll sorunu çözüldü ve kart görünümü eklendi.',
      date: '2024-01-15',
      version: '1.1.0',
    },
  ];

  useEffect(() => {
    loadDashboardData();
    checkChangelogModal();
  }, []);

  const checkChangelogModal = () => {
    const showChangelog = localStorage.getItem('showChangelog');
    if (showChangelog !== 'false') {
      setChangelogModal(prev => ({ ...prev, isOpen: true }));
    }
  };

  const handleChangelogClose = () => {
    setChangelogModal(prev => ({ ...prev, isOpen: false }));
    if (!changelogModal.showAgain) {
      localStorage.setItem('showChangelog', 'false');
    }
  };

  const handleShowAgainChange = (checked: boolean) => {
    setChangelogModal(prev => ({ ...prev, showAgain: checked }));
  };

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
          <div className="overflow-hidden">
            {/* Desktop Tablo */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
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
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{order.customerPhone}</span>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            title="Ara"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.687-2.183l-2.262-.565a2.25 2.25 0 00-2.591 1.01l-.422.704a11.978 11.978 0 01-5.31-5.31l.704-.422a2.25 2.25 0 001.01-2.591l-.565-2.262A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                          </a>
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

            {/* Mobil Kartlar */}
            <div className="md:hidden space-y-3">
              {todayOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {order.customerName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{order.customerPhone}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          title="Ara"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.687-2.183l-2.262-.565a2.25 2.25 0 00-2.591 1.01l-.422.704a11.978 11.978 0 01-5.31-5.31l.704-.422a2.25 2.25 0 001.01-2.591l-.565-2.262A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        <span className="font-medium">Saat:</span> {order.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'}
                      </span>
                      <span className="text-gray-600">
                        <span className="font-medium">Miktar:</span> {order.quantity} B
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Yama Notları Modal */}
      {changelogModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.732.699 2.431 0l4.318-4.318c.699-.699.699-1.732 0-2.431L9.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  Yeni Özellikler
                </h2>
                <button
                  onClick={handleChangelogClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {changelogEntries.map((entry) => (
                  <div key={entry.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{entry.title}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        v{entry.version}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{entry.description}</p>
                    <span className="text-xs text-gray-400">{entry.date}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="showAgain"
                  checked={changelogModal.showAgain}
                  onChange={(e) => handleShowAgainChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="showAgain" className="text-sm text-gray-600">
                  Bir sonraki girişte tekrar göster
                </label>
              </div>

              <button
                onClick={handleChangelogClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 