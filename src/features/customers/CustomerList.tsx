import React, { useState, useEffect } from "react";
import type { Customer } from "../../types";
import { customerAPI } from "../../services/api";

interface CustomerListProps {
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ onEdit, onDelete }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError("Müşteri silinirken hata oluştu");
        console.error("Error deleting customer:", err);
      }
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
    <div className="overflow-x-auto w-full">
      {/* Table View */}
<div className="mx-auto w-full">
  <div className="w-full overflow-x-auto">
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
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">{customer.name}</td>
            <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{customer.phone}</td>
            <td className="px-4 py-4 text-sm text-gray-900 break-words max-w-[200px]">
              {customer.address}
              {customer.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${customer.address} Altınordu Ordu`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-500 underline text-xs mt-1"
                >
                  Haritada Göster
                </a>
              )}
            </td>
            <td className="px-4 py-4 text-right text-sm whitespace-nowrap">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onEdit(customer)}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-red-700 bg-red-50 rounded hover:bg-red-100"
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
</div>

    </div>
  );
};

export default CustomerList;
