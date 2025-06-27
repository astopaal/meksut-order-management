import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Customer, CustomerAnalytics } from '../../types';
import { customerAPI } from '../../services/api';
import { LocationService } from '../../services/location';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCustomerDetail(parseInt(id));
    }
  }, [id]);

  const loadCustomerDetail = async (customerId: number) => {
    try {
      setLoading(true);
      const data = await customerAPI.getAnalytics(customerId);
      setCustomer(data.customer);
      setAnalytics(data.analytics);
      setError(null);
    } catch (err) {
      setError('Müşteri detayları yüklenirken hata oluştu');
      console.error('Error loading customer detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Henüz sipariş yok';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMapsUrl = (customer: Customer) => {
    // Önce location varsa onu kullan (direkt koordinatlar)
    if (customer.location) {
      const coords = LocationService.parseLocation(customer.location);
      if (coords) {
        return LocationService.getMapsUrl(coords.latitude, coords.longitude);
      }
    }
    
    // Location yoksa address'i kullan (Altınordu Ordu ekle)
    if (customer.address) {
      return `https://maps.apple.com/?q=${encodeURIComponent(customer.address + ' Altınordu Ordu')}`;
    }
    
    // Hiçbiri yoksa null döndür
    return null;
  };

  const getInactiveStatus = (days: number | null) => {
    if (days === null) return { text: 'Hiç sipariş vermemiş', color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌' };
    if (days === 0) return { text: 'Bugün sipariş verdi', color: 'text-green-600', bgColor: 'bg-green-50', icon: '✅' };
    if (days <= 7) return { text: `${days} gün önce`, color: 'text-green-600', bgColor: 'bg-green-50', icon: '✅' };
    if (days <= 14) return { text: `${days} gün önce`, color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: '⚠️' };
    return { text: `${days} gün önce`, color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Müşteri detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hata Oluştu</h3>
          <p className="text-gray-600 mb-6">{error || 'Müşteri bulunamadı'}</p>
          <button
            onClick={() => navigate('/customers')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Müşteri Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  const inactiveStatus = getInactiveStatus(analytics?.daysSinceLastOrder ?? null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Back Button */}
            <div className="mb-4">
              <button
                onClick={() => navigate('/customers')}
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Müşteri Listesi
              </button>
            </div>
            
            {/* Customer Info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2 break-words">{customer.name}</h1>
                <p className="text-blue-100 text-sm lg:text-base">Müşteri Detayları ve Analitikler</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${customer.phone}`}
                  className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white text-sm font-medium rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Ara
                </a>
                {getMapsUrl(customer) && (
                  <a
                    href={getMapsUrl(customer) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white text-sm font-medium rounded-lg hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Harita
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Müşteri Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                  <p className="text-gray-900 font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <p className="text-gray-900 font-medium">{customer.phone}</p>
                </div>
              </div>
              <div className="space-y-3">
                {customer.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <p className="text-gray-900">{customer.address}</p>
                  </div>
                )}
                {customer.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                    <p className="text-gray-900 font-mono text-sm">{customer.location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          {analytics && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-1">{analytics.totalOrders}</div>
                  <div className="text-blue-100 text-sm">Toplam Sipariş</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-1">{analytics.totalQuantity}</div>
                  <div className="text-green-100 text-sm">Toplam Bidon</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-1">{analytics.deliveredOrders}</div>
                  <div className="text-purple-100 text-sm">Teslim Edilen</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
                  <div className="text-3xl font-bold mb-1">{analytics.pendingOrders}</div>
                  <div className="text-yellow-100 text-sm">Bekleyen</div>
                </div>
              </div>

              {/* Detaylı Analitikler */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sipariş Geçmişi */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Sipariş Geçmişi
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">İlk Sipariş:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(analytics.firstOrderDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Son Sipariş:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(analytics.lastOrderDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Son Siparişten Beri Geçen Gün:</span>
                      <span className={`text-sm font-medium ${inactiveStatus.color}`}>
                        {inactiveStatus.text}
                      </span>
                    </div>
                    {analytics.avgDaysBetweenOrders && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Ortalama Sipariş Aralığı:</span>
                        <span className="text-sm font-medium text-gray-900">{analytics.avgDaysBetweenOrders} gün</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Teslimat Analizi */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Teslimat Analizi
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Sabah Siparişleri:</span>
                      <span className="text-sm font-medium text-gray-900">{analytics.morningOrders}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Akşam Siparişleri:</span>
                      <span className="text-sm font-medium text-gray-900">{analytics.eveningOrders}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Teslim Edilen:</span>
                      <span className="text-sm font-medium text-green-600">{analytics.deliveredOrders}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Bekleyen:</span>
                      <span className="text-sm font-medium text-yellow-600">{analytics.pendingOrders}</span>
                    </div>
                    {analytics.cancelledOrders > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">İptal Edilen:</span>
                        <span className="text-sm font-medium text-red-600">{analytics.cancelledOrders}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Aktiflik Durumu */}
              <div className={`bg-white rounded-2xl shadow-sm p-6 ${inactiveStatus.bgColor}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">{inactiveStatus.icon}</span>
                  Müşteri Aktiflik Durumu
                </h3>
                <div className="flex items-center mb-3">
                  <div className={`w-4 h-4 rounded-full mr-3 ${inactiveStatus.color.replace('text-', 'bg-')}`}></div>
                  <span className={`text-lg font-medium ${inactiveStatus.color}`}>
                    {inactiveStatus.text}
                  </span>
                </div>
                {analytics.avgDaysBetweenOrders !== null && (
                  <p className="text-gray-600">
                    Bu müşteri ortalama <span className="font-medium">{analytics.avgDaysBetweenOrders} günde bir</span> sipariş veriyor.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail; 