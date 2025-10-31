import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { OrderWithCustomer, DashboardStats, ChangelogEntry, ChangelogModalState } from '../../types';
import { orderAPI, dashboardAPI, customerAPI } from '../../services/api';
import { LocationService } from '../../services/location';

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [changelogModal, setChangelogModal] = useState<ChangelogModalState>({
    isOpen: false,
    showAgain: true,
  });

  const changelogEntries: ChangelogEntry[] = [
    {
      id: '1',
      title: 'Müşteri Kaydı Telefon Giriş Sorunları Düzeltildi.',
      description: 'Müşteri kaydı formunda telefon girişi sorunları düzeltildi. Telefon numarasının formatlanması ve doğrulanması işlevselliği güncellendi.'
    },
    {
      id: '2',
      title: 'Abonelik Bidon Sayısı Kayıt Sorunu Düzeltildi',
      description: 'Abonelik formunda bidon sayısı değiştirildiğinde kayıt yapılmama sorunu çözüldü. Number input değerleri artık doğru şekilde işleniyor.'
    }
  ];

  const currentVersion = '1.4.1';

  useEffect(() => {
    loadDashboardData();
    checkChangelogModal();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const checkChangelogModal = () => {
    const dismissedVersions = JSON.parse(localStorage.getItem('dismissedChangelogVersions') || '[]');
    const isCurrentVersionDismissed = dismissedVersions.includes(currentVersion);
    
    if (!isCurrentVersionDismissed) {
      setChangelogModal(prev => ({ ...prev, isOpen: true }));
    }
  };

  const handleChangelogClose = () => {
    setChangelogModal(prev => ({ ...prev, isOpen: false }));
    
    if (changelogModal.showAgain) {
      // Checkbox işaretliyse mevcut versiyonu dismissed listesine ekle
      const dismissedVersions = JSON.parse(localStorage.getItem('dismissedChangelogVersions') || '[]');
      if (!dismissedVersions.includes(currentVersion)) {
        dismissedVersions.push(currentVersion);
        localStorage.setItem('dismissedChangelogVersions', JSON.stringify(dismissedVersions));
      }
    }
  };

  const handleShowAgainChange = (checked: boolean) => {
    setChangelogModal(prev => ({ ...prev, showAgain: checked }));
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsData, ordersData] = await Promise.all([
        dashboardAPI.getStats(),
        orderAPI.getDaily(selectedDate),
      ]);

      setStats(statsData);
      setTodayOrders(ordersData);
      setError(null);
    } catch (err) {
      setError('Dashboard verileri yüklenirken hata oluştu');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
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

  const handleQuickDeliver = async (orderId: number, customerId: number) => {
    try {
      const confirmDelivery = window.confirm('Bu siparişi teslim etmek istediğinize emin misiniz?');
      if (!confirmDelivery) return;

      await orderAPI.updateStatus(orderId, 'delivered');
      setTodayOrders((orders: OrderWithCustomer[]) => orders.map((o: OrderWithCustomer) => o.id === orderId ? { ...o, status: 'delivered' } : o));
    } catch (err) {
      alert('Teslim etme işlemi başarısız!');
      console.error('Error delivering order:', err);
    }
  };

  const getMapsUrl = (order: OrderWithCustomer) => {
    if (order.customerLocation) {
      const coords = LocationService.parseLocation(order.customerLocation);
      if (coords) {
        return LocationService.getMapsUrl(coords.latitude, coords.longitude);
      }
    }
    
    if (order.customerAddress) {
      return `https://maps.apple.com/?q=${encodeURIComponent(order.customerAddress + ' Altınordu Ordu')}`;
    }
    
    return null;
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Toplam Sipariş</div>
        </motion.div>
        <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          <div className="text-sm text-gray-600">Bekleyen</div>
        </motion.div>
        <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
          <div className="text-sm text-gray-600">Teslim Edilen</div>
        </motion.div>
        <motion.div className="card text-center" whileHover={{ scale: 1.04 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="text-2xl font-bold text-purple-600">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600">Toplam Müşteri</div>
        </motion.div>
      </div>

      {/* Bugünkü Siparişler */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Günlük Siparişler</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Önceki gün"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-900">
                {selectedDate === new Date().toISOString().split('T')[0] 
                  ? 'Bugün' 
                  : formatDate(selectedDate)
                }
              </span>
            </div>
            
            <button
              onClick={goToNextDay}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Sonraki gün"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {todayOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Bu tarih için sipariş bulunmuyor.</p>
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
                  {todayOrders
                    .sort((a, b) => {
                      // Önce teslim durumuna göre sırala (teslim edilmemiş üstte)
                      if (a.status !== b.status) {
                        return a.status === 'delivered' ? 1 : -1;
                      }
                      
                      // Aynı teslim durumunda, sabah/akşam sıralaması (sabah üstte)
                      if (a.deliveryTime !== b.deliveryTime) {
                        return a.deliveryTime === 'morning' ? -1 : 1;
                      }
                      
                      // Aynı durumda, müşteri adına göre sırala
                      return a.customerName.localeCompare(b.customerName);
                    })
                    .map((order) => (
                    <tr key={order.id} className={`relative overflow-hidden ${
                      order.deliveryTime === 'morning'
                        ? 'bg-gradient-to-r from-blue-200 via-white to-blue-100 border-l-4 border-l-blue-500'
                        : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 border-l-4 border-l-purple-700'
                    }`}>
                      {/* SVG dekorasyon */}
                      {order.deliveryTime === 'morning' ? (
                        <svg className="absolute left-0 top-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <ellipse cx="40" cy="30" rx="40" ry="18" fill="#fff" />
                          <ellipse cx="120" cy="20" rx="30" ry="12" fill="#fff" />
                          <ellipse cx="170" cy="40" rx="20" ry="8" fill="#fff" />
                        </svg>
                      ) : (
                        <svg className="absolute left-0 top-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="30" cy="20" r="3" fill="#fff" />
                          <circle cx="80" cy="10" r="1.5" fill="#fff" />
                          <circle cx="150" cy="30" r="2" fill="#fff" />
                          <circle cx="180" cy="15" r="1.2" fill="#fff" />
                          <circle cx="120" cy="50" r="1.7" fill="#fff" />
                        </svg>
                      )}
                      <td className={`px-4 py-4 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-lg' : 'text-white text-lg'}`}>
                        <div className="font-semibold">
                          {order.customerName}
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-base' : 'text-white text-base'}`}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className={`inline-flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full ${order.deliveryTime === 'morning' ? 'bg-blue-100 text-blue-600' : 'bg-white bg-opacity-20 text-white'} hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            title="Ara"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-4 md:h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.687-2.183l-2.262-.565a2.25 2.25 0 00-2.591 1.01l-.422.704a11.978 11.978 0 01-5.31-5.31l.704-.422a2.25 2.25 0 001.01-2.591l-.565-2.262A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                          </a>
                          {(order.customerAddress || order.customerLocation) && (
                            <a
                              href={getMapsUrl(order) || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full ${order.deliveryTime === 'morning' ? 'bg-green-100 text-green-700' : 'bg-white bg-opacity-20 text-white'} hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-green-400`}
                              title="Haritada Göster"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-4 md:h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                            </a>
                          )}
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => handleQuickDeliver(order.id, order.customerId)}
                              className={`inline-flex items-center justify-center w-auto h-10 md:h-8 px-3 rounded-full ${order.deliveryTime === 'morning' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white bg-opacity-20 hover:bg-opacity-40 text-white'} focus:outline-none focus:ring-2 focus:ring-green-400 ml-1 text-base font-semibold`}
                              title="Teslim Et"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-4 md:h-4 mr-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Teslim Et
                            </button>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-base' : 'text-white text-base'}`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium ${
                          order.deliveryTime === 'morning' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-white bg-opacity-20 text-white'
                        }`}>
                          {order.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'}
                        </span>
                      </td>
                      <td className={`px-4 py-4 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-base' : 'text-white text-base'}`}>
                        {order.quantity} B
                      </td>
                      <td className={`px-4 py-4 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-base' : 'text-white text-base'}`}>
                        <span className={`inline-flex px-2 py-1 text-base font-semibold rounded-full ${getStatusColor(order.status)}`}> {getStatusText(order.status)} </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobil Kartlar */}
            <div className="md:hidden space-y-3">
              {todayOrders
                .sort((a, b) => {
                  // Önce teslim durumuna göre sırala (teslim edilmemiş üstte)
                  if (a.status !== b.status) {
                    return a.status === 'delivered' ? 1 : -1;
                  }
                  
                  // Aynı teslim durumunda, sabah/akşam sıralaması (sabah üstte)
                  if (a.deliveryTime !== b.deliveryTime) {
                    return a.deliveryTime === 'morning' ? -1 : 1;
                  }
                  
                  // Aynı durumda, müşteri adına göre sırala
                  return a.customerName.localeCompare(b.customerName);
                })
                .map((order) => (
                <div key={order.id} className={`relative overflow-hidden rounded-lg p-4 shadow-sm flex flex-col gap-2 border border-gray-200 ${
                  order.deliveryTime === 'morning'
                    ? 'bg-gradient-to-r from-blue-200 via-white to-blue-100 border-l-4 border-l-blue-500'
                    : 'bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 border-l-4 border-l-purple-700'
                }`}>
                  {/* SVG dekorasyon */}
                  {order.deliveryTime === 'morning' ? (
                    <svg className="absolute left-0 top-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="40" cy="30" rx="40" ry="18" fill="#fff" />
                      <ellipse cx="120" cy="20" rx="30" ry="12" fill="#fff" />
                      <ellipse cx="170" cy="40" rx="20" ry="8" fill="#fff" />
                    </svg>
                  ) : (
                    <svg className="absolute left-0 top-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="30" cy="20" r="3" fill="#fff" />
                      <circle cx="80" cy="10" r="1.5" fill="#fff" />
                      <circle cx="150" cy="30" r="2" fill="#fff" />
                      <circle cx="180" cy="15" r="1.2" fill="#fff" />
                      <circle cx="120" cy="50" r="1.7" fill="#fff" />
                    </svg>
                  )}
                  <div className={`font-semibold mb-1 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-lg' : 'text-white text-lg'}`}>{order.customerName}</div>
                  <div className={`flex items-center gap-2 mb-2 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-base' : 'text-white text-base'}`}>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className={`inline-flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full ${order.deliveryTime === 'morning' ? 'bg-blue-100 text-blue-600' : 'bg-white bg-opacity-20 text-white'} hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      title="Ara"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-4 md:h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h0a2.25 2.25 0 002.25-2.25v-2.386a2.25 2.25 0 00-1.687-2.183l-2.262-.565a2.25 2.25 0 00-2.591 1.01l-.422.704a11.978 11.978 0 01-5.31-5.31l.704-.422a2.25 2.25 0 001.01-2.591l-.565-2.262A2.25 2.25 0 006.886 2.25H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </a>
                    {(order.customerAddress || order.customerLocation) && (
                      <a
                        href={getMapsUrl(order) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center w-10 h-10 md:w-8 md:h-8 rounded-full ${order.deliveryTime === 'morning' ? 'bg-green-100 text-green-700' : 'bg-white bg-opacity-20 text-white'} hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-green-400`}
                        title="Haritada Göster"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-4 md:h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </a>
                    )}
                    {order.status !== 'delivered' && (
                      <button
                        onClick={() => handleQuickDeliver(order.id, order.customerId)}
                        className={`inline-flex items-center justify-center w-auto h-10 md:h-8 px-3 rounded-full ${order.deliveryTime === 'morning' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white bg-opacity-20 hover:bg-opacity-40 text-white'} focus:outline-none focus:ring-2 focus:ring-green-400 ml-1 text-base font-semibold`}
                        title="Teslim Et"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 md:w-4 md:h-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Teslim Et
                      </button>
                    )}
                  </div>
                  <div className={`flex items-center gap-4 ${order.deliveryTime === 'morning' ? 'text-blue-900 text-base' : 'text-white text-base'}`}>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium ${
                      order.deliveryTime === 'morning' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-white bg-opacity-20 text-white'
                    }`}>
                      {order.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'}
                    </span>
                    <span className={`font-medium ${order.deliveryTime === 'morning' ? 'text-blue-900' : 'text-white'}`}>
                      Miktar: {order.quantity} B
                    </span>
                    <span className={`inline-flex px-2 py-1 text-base font-semibold rounded-full ${getStatusColor(order.status)}`}> {getStatusText(order.status)} </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Yama Notları Modal */}
      {changelogModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 shadow-lg">
            <div className="border-b border-gray-200 flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold text-gray-800">Yama Notları ({currentVersion})</h2>
              <button
                onClick={handleChangelogClose}
                className="text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label="Kapat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
                {changelogEntries.map((entry) => (
                  <li key={entry.id}>
                    <span className="font-semibold">{entry.title}:</span> {entry.description}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mt-6 mb-2">
                <input
                  type="checkbox"
                  id="showAgain"
                  checked={changelogModal.showAgain}
                  onChange={(e) => handleShowAgainChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="showAgain" className="text-sm text-gray-700 select-none cursor-pointer">
                  Bu versiyonu tekrar gösterme
                </label>
              </div>
            </div>
            <div className="border-t border-gray-200 px-5 py-3 flex justify-end">
              <button
                onClick={handleChangelogClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;