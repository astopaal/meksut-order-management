import React, { useState, useEffect } from 'react';
import type { OrderWithCustomer, OrderFormData, Customer } from '../../types';
import { customerAPI } from '../../services/api';

interface OrderFormProps {
  order?: OrderWithCustomer | null;
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Modal bileşeni (basit, erişilebilir, mobil öncelikli)
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-2 relative animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Kapat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const OrderForm: React.FC<OrderFormProps> = ({ 
  order, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: 0,
    deliveryTime: 'morning',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    quantity: 1,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (order) {
      setFormData({
        customerId: order.customerId,
        deliveryTime: order.deliveryTime,
        orderDate: order.orderDate,
        status: order.status,
        quantity: order.quantity,
      });
    }
  }, [order]);

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const data = await customerAPI.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customerId === 0) {
      alert('Lütfen bir müşteri seçiniz');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customerId' ? parseInt(value) : name === 'quantity' ? parseInt(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
          Müşteri
        </label>
        <button
          type="button"
          onClick={() => setCustomerModalOpen(true)}
          className="w-full flex items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {formData.customerId && customers.find(c => c.id === formData.customerId) ? (
            <span>
              {customers.find(c => c.id === formData.customerId)?.name} - {customers.find(c => c.id === formData.customerId)?.phone}
            </span>
          ) : (
            <span className="text-gray-400">Müşteri seçiniz</span>
          )}
        </button>
        <Modal open={customerModalOpen} onClose={() => setCustomerModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-3">Müşteri Seç</h3>
          <input
            type="text"
            placeholder="İsim veya telefon ara..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {customers
              .filter(c =>
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.phone.includes(customerSearch)
              )
              .map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, customerId: c.id }));
                    setCustomerModalOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-green-50 focus:bg-green-100 rounded flex flex-col ${formData.customerId === c.id ? 'bg-green-100 font-semibold' : ''}`}
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-gray-500">{c.phone}</span>
                </button>
              ))}
            {customers.filter(c =>
              c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
              c.phone.includes(customerSearch)
            ).length === 0 && (
              <div className="text-gray-400 text-center py-6">Sonuç bulunamadı</div>
            )}
          </div>
        </Modal>
      </div>

      <div>
        <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-2">
          Sipariş Tarihi
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="date"
            id="orderDate"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
          Teslimat Saati
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <select
            id="deliveryTime"
            name="deliveryTime"
            value={formData.deliveryTime}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          >
            <option value="morning">Sabah</option>
            <option value="evening">Akşam</option>
          </select>
        </div>
      </div>

      {order && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            >
              <option value="pending">Bekliyor</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
          Miktar (Bidon)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <button
          type="submit"
          disabled={loading || customersLoading}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kaydediliyor...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {order ? 'Güncelle' : 'Kaydet'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          İptal
        </button>
      </div>
    </form>
  );
};

export default OrderForm; 