import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import API from '../../api/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Eroare la stats:', err);
      // Fallback dacă endpoint-ul nu există încă
      setStats({
        services: 0,
        brands: 0,
        serviceTypes: 0,
        serviceRequests: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoggedIn');
    delete API.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă panoul admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel AutoRepair</h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Servicii
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <span className="mr-1">←</span> Site principal
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Deconectare
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards pentru SERVICII */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
                <span className="text-red-600 text-2xl">🔧</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Servicii</p>
                <p className="text-2xl font-bold">{stats?.services || 0}</p>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <span className="text-blue-600 text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mărci</p>
                <p className="text-2xl font-bold">{stats?.brands || 0}</p>
              </div>
            </div>
          </div> */}

          {/* <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                <span className="text-green-600 text-2xl">🏷️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tipuri Servicii</p>
                <p className="text-2xl font-bold">{stats?.serviceTypes || 0}</p>
              </div>
            </div>
          </div> */}

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                <span className="text-purple-600 text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cereri</p>
                <p className="text-2xl font-bold">{stats?.serviceRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation pentru SERVICII */}
          <aside className="md:col-span-1">
            <nav className="space-y-2">
              <Link
                to="/admin"
                end="true"
                className="block py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                📊 Dashboard
              </Link>
              <Link
                to="/admin/services"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                🔧 Servicii
              </Link>
              {/* <Link
                to="/admin/service-types"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                🏷️ Tipuri Servicii
              </Link> */}
              <Link
                to="/admin/service-requests"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                📋 Cereri Servicii
              </Link>
              {/* <Link
                to="/admin/brands"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                🏢 Mărci
              </Link> */}
            </nav>

            {/* Quick Actions pentru SERVICII */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold mb-4">Acțiuni rapide</h3>
              
              <button
                onClick={() => navigate('/admin/services?action=create')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium mb-3"
              >
                + Serviciu nou
              </button>
              
              {/* <button
                onClick={() => navigate('/admin/service-types')}
                className="w-full border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 font-medium"
              >
                + Tip serviciu
              </button> */}
              
              <p className="text-sm text-gray-600 mt-3">
                Adaugă servicii noi.
              </p>
              
              {/* <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p className="flex items-center">
                  <span className="mr-1">✓</span> Garanție inclusă
                </p>
                <p className="flex items-center">
                  <span className="mr-1">✓</span> Diagnostic gratuit
                </p>
                <p className="flex items-center">
                  <span className="mr-1">✓</span> Compatibilitate completă
                </p>
              </div> */}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 min-h-[500px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;