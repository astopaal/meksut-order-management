import React, { useState, useEffect } from 'react';
import type { SubscriptionFormData, Customer } from '../../types';
import { customerAPI } from '../../services/api';

interface SubscriptionFormProps {
  subscription?: any;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ 
  subscription, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    customerId: subscription?.customerId || 0,
    days: subscription?.days || [],
    deliveryTime: subscription?.deliveryTime || 'morning',
    quantity: subscription?.quantity || 1,
    isActive: subscription?.isActive ?? true,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  // Türkçe karakterleri normalize et
  const normalizeTurkishChars = (text: string) => {
    return text
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .replace(/Ğ/g, 'g')
      .replace(/Ç/g, 'c')
      .replace(/Ö/g, 'o')
      .replace(/Ş/g, 's')
      .replace(/Ü/g, 'u')
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u');
  };

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.customer-dropdown')) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customerAPI.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.customerId && formData.days.length > 0) {
      onSubmit(formData);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const days = [
    { key: 'monday', label: 'Pazartesi' },
    { key: 'tuesday', label: 'Salı' },
    { key: 'wednesday', label: 'Çarşamba' },
    { key: 'thursday', label: 'Perşembe' },
    { key: 'friday', label: 'Cuma' },
    { key: 'saturday', label: 'Cumartesi' },
    { key: 'sunday', label: 'Pazar' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Müşteri Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Müşteri *
        </label>
        <div className="relative customer-dropdown">
          <input
            type="text"
            placeholder="Müşteri ara..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            onFocus={() => setShowCustomerDropdown(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedCustomer && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">{selectedCustomer.name}</div>
              <div className="text-xs text-blue-700">{selectedCustomer.phone}</div>
            </div>
          )}
          {formData.customerId === 0 && (
            <p className="text-red-500 text-sm mt-1">Müşteri seçilmelidir</p>
          )}
          
          {/* Dropdown */}
          {showCustomerDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {customers
                .filter(c => {
                  const searchNormalized = normalizeTurkishChars(customerSearch);
                  const nameNormalized = normalizeTurkishChars(c.name);
                  const phoneLower = c.phone.toLowerCase();
                  
                  return nameNormalized.includes(searchNormalized) || phoneLower.includes(searchNormalized);
                })
                .map(customer => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, customerId: customer.id }));
                      setCustomerSearch(customer.name);
                      setShowCustomerDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Gün Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teslimat Günleri *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {days.map(day => (
            <label key={day.key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.days.includes(day.key)}
                onChange={() => handleDayChange(day.key)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{day.label}</span>
            </label>
          ))}
        </div>
        {formData.days.length === 0 && (
          <p className="text-red-500 text-sm mt-1">En az bir gün seçilmelidir</p>
        )}
      </div>

      {/* Teslimat Saati */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teslimat Saati *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="deliveryTime"
              value="morning"
              checked={formData.deliveryTime === 'morning'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`flex items-center space-x-3 w-full ${formData.deliveryTime === 'morning' ? 'text-blue-600' : 'text-gray-700'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.deliveryTime === 'morning' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                {formData.deliveryTime === 'morning' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
                <span className="font-medium">Sabah</span>
              </div>
            </div>
          </label>
          
          <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="deliveryTime"
              value="evening"
              checked={formData.deliveryTime === 'evening'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`flex items-center space-x-3 w-full ${formData.deliveryTime === 'evening' ? 'text-blue-600' : 'text-gray-700'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.deliveryTime === 'evening' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                {formData.deliveryTime === 'evening' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
                </svg>
                <span className="font-medium">Akşam</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Miktar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Miktar (Bidon) *
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Aktif Durumu */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="text-sm text-gray-700">Aktif Abonelik</label>
      </div>

      {/* Butonlar */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading || formData.customerId === 0 || formData.days.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Kaydediliyor...' : (subscription ? 'Güncelle' : 'Oluştur')}
        </button>
      </div>


    </form>
  );
};

export default SubscriptionForm; 