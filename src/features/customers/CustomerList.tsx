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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Pagination hesaplamaları
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = customers.slice(startIndex, endIndex);

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
      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İsim</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adres</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
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
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.address || 'Adres girilmemiş'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.location ? (
                    <a
                      href={getMapsUrl(customer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Haritada Göster
                    </a>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Konum yok
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                    >
                      Sil
                    </button>
                    <Link
                      to={`/customers/${customer.id}`}
                      className="text-green-600 hover:text-green-900 transition-colors duration-200"
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={customers.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default CustomerList;
