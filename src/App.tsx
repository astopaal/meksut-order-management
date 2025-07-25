import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import CustomerList from './features/customers/CustomerList';
import CustomerForm from './features/customers/CustomerForm';
import CustomerDetail from './features/customers/CustomerDetail';
import OrderList from './features/orders/OrderList';
import OrderForm from './features/orders/OrderForm';
import Dashboard from './features/dashboard/Dashboard';
import Reports from './features/reports/Reports';
import type { Customer, OrderWithCustomer, CustomerFormData, OrderFormData } from './types';
import { customerAPI, orderAPI } from './services/api';

// Basit Auth Context
const AuthContext = React.createContext<{ isLoggedIn: boolean; login: (u: string, p: string) => boolean; logout: () => void }>({ isLoggedIn: false, login: () => false, logout: () => {} });

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');

  const login = (username: string, password: string) => {
    if (username === 'coban52' && password === '123456yy11q') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  };
  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };
  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>;
};

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = React.useContext(AuthContext);
  const location = useLocation();
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// Login Page
const LoginPage: React.FC = () => {
  const { login } = React.useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Kullanıcı adı veya şifre hatalı');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 transition-all duration-700">
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xs space-y-6 transform transition-all duration-700 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="mb-2">
            <img src="/logo.png" alt="Meksüt Logo" className="h-20 w-20 rounded-full shadow-lg object-cover mx-auto" />
          </div>
          <h2 className="text-lg font-bold text-center text-gray-800 tracking-tight leading-snug mb-1">
            MEKSÜT Yönetim Paneli
          </h2>
          <div className="text-sm text-gray-500 font-medium">Giriş Yap</div>
        </div>
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base shadow-sm hover:shadow-md"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 text-base shadow-sm hover:shadow-md"
        />
        {error && <div className="text-red-600 text-sm text-center animate-pulse">{error}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-green-400 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 shadow-lg transition-all duration-200 text-base tracking-wide"
        >
          Giriş Yap
        </button>
      </form>
    </div>
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
              <Link
                to="/customers/new"
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Müşteri Ekle
              </Link>
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
              <Link
                to="/orders/new"
                className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni Sipariş Ekle
              </Link>
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

const CustomerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setLoading(true);
      await customerAPI.create(data);
      navigate('/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/customers');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Müşteri Ekle</h1>
          <p className="text-gray-600">Yeni müşteri bilgilerini girin</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <CustomerForm
            customer={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

const OrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);
      await orderAPI.create(data);
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Sipariş Ekle</h1>
          <p className="text-gray-600">Yeni sipariş bilgilerini girin</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <OrderForm
            order={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout } = React.useContext(AuthContext);
  
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

  // Menü dışına tıklayınca kapat fonksiyonu
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const menu = document.getElementById('mobile-menu-panel');
      if (menu && !menu.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isMenuOpen]);

  if (!isLoggedIn) return null;

  return (
    <nav className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img src="/logo.png" alt="Meksüt Logo" className="h-10 w-10 rounded-full shadow object-cover" />
              <h1 className="text-xl font-bold text-gray-900">MEKSÜT</h1>
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
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
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
          {/* Masaüstü çıkış butonu */}
          <div className="hidden md:inline-flex items-center ml-4">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full bg-red-50 text-red-700 font-semibold text-sm shadow hover:bg-red-100 border border-red-200 transition"
            >
              Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with improved design and animation */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: isMenuOpen ? 'rgba(0,0,0,0.25)' : 'transparent' }}
      >
        <div
          id="mobile-menu-panel"
          className={`absolute top-0 right-0 w-72 max-w-full h-full bg-white shadow-2xl transition-all duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Üstte logo ve kapat butonu */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center">
                <span className="text-lg">🥛</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">MEKSÜT</h1>
            </div>
            <button
              onClick={closeMenu}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              aria-label="Kapat"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col h-full">
            <div className="px-4 pt-6 pb-3 space-y-3 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="p-4">
              <button
                onClick={logout}
                className="w-full px-4 py-3 rounded-full bg-red-600 text-white font-bold text-base shadow hover:bg-red-700 transition"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<OrderFormPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Navigation />
      <AppRouter />
    </Router>
  </AuthProvider>
);

export default App;
