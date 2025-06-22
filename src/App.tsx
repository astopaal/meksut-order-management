import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerList from './features/customers/CustomerList';
import CustomerForm from './features/customers/CustomerForm';
import OrderList from './features/orders/OrderList';
import OrderForm from './features/orders/OrderForm';
import Dashboard from './features/dashboard/Dashboard';
import Reports from './features/reports/Reports';
import type { Customer, OrderWithCustomer, CustomerFormData, OrderFormData } from './types';
import { customerAPI, orderAPI } from './services/api';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/customers', label: 'Müşteriler', icon: '👥' },
    { path: '/orders', label: 'Siparişler', icon: '📦' },
    { path: '/reports', label: 'Raporlar', icon: '📈' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-lg">🥛</span>
                </div>
                <h1 className="text-xl font-bold text-white">MEKSÜT</h1>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white bg-opacity-20 text-white shadow-md'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Ana menüyü aç</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-blue-700`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-white bg-opacity-20 text-white shadow-md'
                  : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const CustomersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await customerAPI.delete(id);
      // CustomerList bileşeni kendi state'ini güncelleyecek
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      if (editingCustomer) {
        await customerAPI.update(editingCustomer.id, data);
      } else {
        await customerAPI.create(data);
      }
      setShowForm(false);
      setEditingCustomer(null);
      // Sayfayı yenilemek için window.location.reload() kullanabiliriz
      window.location.reload();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Müşteri Yönetimi</h1>
              <p className="text-gray-600">Müşterilerinizi ekleyin, düzenleyin ve yönetin</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Müşteri Ekle
              </button>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}
              </h2>
            </div>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <CustomerList onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
      </div>
    </div>
  );
};

const OrdersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderWithCustomer | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (order: OrderWithCustomer) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await orderAPI.delete(id);
      // OrderList bileşeni kendi state'ini güncelleyecek
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);
      if (editingOrder) {
        await orderAPI.update(editingOrder.id, data);
      } else {
        await orderAPI.create(data);
      }
      setShowForm(false);
      setEditingOrder(null);
      // Sayfayı yenilemek için window.location.reload() kullanabiliriz
      window.location.reload();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Yönetimi</h1>
              <p className="text-gray-600">Günlük süt siparişlerini yönetin ve takip edin</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Sipariş Ekle
              </button>
            )}
          </div>
        </div>

        {showForm ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingOrder ? 'Sipariş Düzenle' : 'Yeni Sipariş Ekle'}
              </h2>
            </div>
            <OrderForm
              order={editingOrder}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <OrderList onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Günlük süt teslimat işlemlerinizi takip edin</p>
        </div>
        <Dashboard />
      </div>
    </div>
  );
};

const ReportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Raporlar</h1>
          <p className="text-gray-600">İşletmenizin performansını analiz edin</p>
        </div>
        <Reports />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
