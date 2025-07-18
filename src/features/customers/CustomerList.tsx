import React, { useState, useEffect } from "react";
import type { Customer, CustomerFormData } from "../../types";
import { customerAPI } from "../../services/api";
import Pagination from "../../components/Pagination";
import { Link } from 'react-router-dom';
import { LocationService } from "../../services/location";

interface CustomerListProps {
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onEdit, onDelete }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sıralama state'i
  const [sortField, setSortField] = useState<'name' | 'phone' | 'lastOrderDate' | 'totalOrders'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerAPI.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError("Müşteriler yüklenirken hata oluştu");
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      try {
        await customerAPI.delete(id);
        setCustomers(customers.filter((customer) => customer.id !== id));
        // Eğer son sayfada tek kayıt kaldıysa ve silindiyse, önceki sayfaya git
        const totalPages = Math.ceil((customers.length - 1) / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } catch (err) {
        setError("Müşteri silinirken hata oluştu");
        console.error("Error deleting customer:", err);
      }
    }
  };

  // Arama filtresi
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );
  // Pagination hesaplamaları
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    if (sortField === 'lastOrderDate') {
      aValue = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
      bValue = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
    }
    if (sortField === 'totalOrders') {
      aValue = a.totalOrders || 0;
      bValue = b.totalOrders || 0;
    }
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = sortedCustomers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getMapsUrl = (customer: Customer): string | undefined => {
    if (customer.location) {
      const coords = LocationService.parseLocation(customer.location);
      if (coords) {
        return LocationService.getMapsUrl(coords.latitude, coords.longitude);
      }
    }
    
    if (customer.address) {
      return `https://maps.apple.com/?q=${encodeURIComponent(customer.address + ' Altınordu Ordu')}`;
    }
    
    return undefined;
  };

  // Sıralama başlığı tıklama fonksiyonu
  const handleSort = (field: 'name' | 'phone' | 'lastOrderDate' | 'totalOrders') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 m-6 overflow-x-hidden">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-red-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
        <button
          onClick={loadCustomers}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tekrar dene
        </button>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 overflow-x-hidden">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz müşteri bulunmuyor
        </h3>
        <p className="text-gray-500">İlk müşterinizi ekleyerek başlayın</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Arama kutusu */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 pt-4 pr-2">
        <div></div>
        <div className="relative w-full sm:w-auto sm:min-w-[320px] max-w-xs sm:ml-auto">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="İsim veya telefon ara..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm focus:shadow-lg transition-all duration-200 text-base"
            style={{ minHeight: 44 }}
          />
        </div>
      </div>
      {/* Table View - Masaüstü */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none" onClick={() => handleSort('name')}>
                İsim {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none" onClick={() => handleSort('phone')}>
                Telefon {sortField === 'phone' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none" onClick={() => handleSort('lastOrderDate')}>
                Son Sipariş {sortField === 'lastOrderDate' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none" onClick={() => handleSort('totalOrders')}>
                Toplam Sipariş {sortField === 'totalOrders' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        <Link 
                          to={`/customers/${customer.id}`}
                          className="hover:text-blue-600 transition-colors duration-200"
                        >
                          {customer.name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.address && customer.address.trim() !== '' ? (
                    <span>
                      {customer.address}
                      {customer.district ? `, ${customer.district}` : ''}
                      {customer.city ? `, ${customer.city}` : ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">Adres girilmemiş</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('tr-TR') : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.totalOrders ?? 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <a
                      href={`tel:${customer.phone}`}
                      className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                      title="Ara"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Ara
                    </a>
                    <a
                      href={`sms:${customer.phone}`}
                      className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold"
                      title="Mesaj Gönder"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8a9 9 0 1118 0z" /></svg>
                      Mesaj
                    </a>
                    <button
                      onClick={() => onEdit(customer)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors"
                    >
                      Sil
                    </button>
                    <Link
                      to={`/customers/${customer.id}`}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors"
                    >
                      Detay
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil Kart Görünümü */}
      <div className="md:hidden space-y-3">
        {currentCustomers.map((customer) => (
          <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-base font-semibold text-gray-900">{customer.name}</div>
                <div className="text-xs text-gray-500">{customer.phone}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">Adres: </span>
              {customer.address && customer.address.trim() !== '' ? (
                <span>
                  {customer.address}
                  {customer.district ? `, ${customer.district}` : ''}
                  {customer.city ? `, ${customer.city}` : ''}
                </span>
              ) : (
                <span className="text-gray-400">Adres girilmemiş</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Son Sipariş: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('tr-TR') : '-'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {customer.isActive ? 'Aktif' : 'Pasif'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Toplam Sipariş: {customer.totalOrders ?? 0}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
                title="Ara"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Ara
              </a>
              <a
                href={`sms:${customer.phone}`}
                className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 text-xs font-semibold"
                title="Mesaj Gönder"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8a9 9 0 1118 0z" /></svg>
                Mesaj
              </a>
              <button
                onClick={() => onEdit(customer)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(customer.id)}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors"
              >
                Sil
              </button>
              <Link
                to={`/customers/${customer.id}`}
                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold hover:bg-green-200 transition-colors"
              >
                Detay
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={sortedCustomers.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default CustomerList;
