import React, { useState, useEffect } from 'react';
import type { Subscription } from '../../types';
import { subscriptionAPI } from '../../services/api';
import Pagination from '../../components/Pagination';

interface SubscriptionListProps {
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: number) => void;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ onEdit, onDelete }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionAPI.getAll();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      setError("Abonelikler yüklenirken hata oluştu");
      console.error("Error loading subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bu aboneliği silmek istediğinizden emin misiniz?")) {
      try {
        await subscriptionAPI.delete(id);
        setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      } catch (err) {
        setError("Abonelik silinirken hata oluştu");
        console.error("Error deleting subscription:", err);
      }
    }
  };

  const handleGenerateOrders = async () => {
    if (window.confirm("Önümüzdeki 7 gün için abonelik siparişlerini oluşturmak istediğinize emin misiniz?")) {
      try {
        const result = await subscriptionAPI.generateOrders(7);
        alert(result.message);
        // Dashboard'ı yenilemek için sayfayı yenile
        window.location.reload();
      } catch (err) {
        alert("Sipariş oluşturulurken hata oluştu");
        console.error("Error generating orders:", err);
      }
    }
  };

  const getDayLabels = (days: string[]) => {
    const dayMap: { [key: string]: string } = {
      monday: 'Pzt',
      tuesday: 'Sal',
      wednesday: 'Çar',
      thursday: 'Per',
      friday: 'Cum',
      saturday: 'Cmt',
      sunday: 'Paz',
    };
    return days.map(day => dayMap[day] || day).join(', ');
  };

  const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscriptions = subscriptions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Abonelikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadSubscriptions}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Üst Butonlar */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Abonelikler</h2>
        <button
          onClick={handleGenerateOrders}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Siparişleri Oluştur
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz abonelik bulunmuyor.</p>
        </div>
      ) : (
        <>
          {/* Desktop Tablo */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Günler</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subscription.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDayLabels(subscription.days)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.deliveryTime === 'morning' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subscription.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscription.quantity} L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {subscription.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEdit(subscription)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(subscription.id)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil Kartlar */}
          <div className="md:hidden space-y-3 p-4">
            {currentSubscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {subscription.customerName}
                    </h3>
                    <div className="text-sm text-gray-500 mb-2">
                      {subscription.customerPhone}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">
                        Günler: {getDayLabels(subscription.days)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        subscription.deliveryTime === 'morning' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subscription.deliveryTime === 'morning' ? 'Sabah' : 'Akşam'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {subscription.quantity} L
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {subscription.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Pasif
                      </span>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(subscription)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(subscription.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={subscriptions.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionList; 