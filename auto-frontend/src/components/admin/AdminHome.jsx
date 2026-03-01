import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/api';

function AdminHome() {
  const [recentServices, setRecentServices] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newRequests: 0,
    inProgress: 0
  });
  const [shippingStats, setShippingStats] = useState({
    pending: 0,
    received: 0,
    in_repair: 0,
    returned: 0,
    cancelled: 0,
    total: 0
  });
  const [recentShipping, setRecentShipping] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Pornim toate request-urile în paralel
      const [
        servicesRes, 
        requestsRes, 
        shippingStatsRes,
        shippingRecentRes
      ] = await Promise.all([
        API.get('/admin/services?limit=5'),
        API.get('/admin/service-requests?limit=5&status=new'),
        API.get('/admin/shipping-requests/stats/summary'),
        API.get('/admin/shipping-requests?limit=5')
      ]);

      // Servicii recente
      const services = servicesRes.data?.services || servicesRes.data || [];
      setRecentServices(Array.isArray(services) ? services.slice(0, 5) : []);

      // Cereri recente
      const requests = requestsRes.data?.requests || requestsRes.data || [];
      setRecentRequests(Array.isArray(requests) ? requests.slice(0, 5) : []);

      // Statistici cereri
      setStats({
        newRequests: Array.isArray(requests) ? requests.length : 0,
        inProgress: 0 // Poți calcula din alte request-uri
      });

      // Statistici expedieri
      if (shippingStatsRes.data) {
        setShippingStats(shippingStatsRes.data);
      }

      // Expediții recente
      if (shippingRecentRes.data?.requests) {
        setRecentShipping(shippingRecentRes.data.requests.slice(0, 5));
      }

    } catch (err) {
      console.error('Eroare dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'Nou' },
      contacted: { color: 'bg-yellow-100 text-yellow-800', label: 'Contactat' },
      scheduled: { color: 'bg-purple-100 text-purple-800', label: 'Programat' },
      in_progress: { color: 'bg-orange-100 text-orange-800', label: 'În progres' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Finalizat' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Anulat' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getShippingStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'În așteptare' },
      received: { color: 'bg-blue-100 text-blue-800', label: 'Primit' },
      in_repair: { color: 'bg-purple-100 text-purple-800', label: 'În reparație' },
      returned: { color: 'bg-green-100 text-green-800', label: 'Returnat' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Anulat' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Bine ai venit în Panou Admin</h1>
      <p className="text-gray-600 mb-6">Gestionare servicii de reparație auto</p>
      
      {/* Alert pentru cereri noi */}
      {stats.newRequests > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-3">
              <p className="font-medium text-blue-800">
                Ai {stats.newRequests} cereri noi de servicii
              </p>
              <p className="text-sm text-blue-600">
                <Link to="/admin/service-requests?status=new" className="underline">
                  Gestionează-le acum →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistici expedieri - carduri quick info */}
      {shippingStats.total > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">📦 În așteptare</p>
            <p className="text-2xl font-bold text-yellow-800">{shippingStats.pending}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">📬 Primite</p>
            <p className="text-2xl font-bold text-blue-800">{shippingStats.received}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">🔧 În reparație</p>
            <p className="text-2xl font-bold text-purple-800">{shippingStats.in_repair || 0}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">↩️ Returnate</p>
            <p className="text-2xl font-bold text-green-800">{shippingStats.returned}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Servicii Recente */}
        <div className="bg-white border rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">🔧 Servicii Recente</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Se încarcă...</p>
            </div>
          ) : recentServices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nu există servicii încă.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold">Serviciu</th>
                    <th className="p-4 text-left text-sm font-semibold">Brand</th>
                    <th className="p-4 text-left text-sm font-semibold">Preț</th>
                    <th className="p-4 text-left text-sm font-semibold">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentServices.map(service => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                            <span className="text-lg">
                              {service.serviceType?.icon || '⚙️'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-gray-500">{service.code || 'Fără cod'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{service.brand?.name || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-red-600">{service.repairPrice} {service.currency}</span>
                          <span className="ml-2 text-xs text-blue-600">Test: {service.testPrice} {service.currency}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/services?edit=${service._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/service/${service._id}`}
                            target="_blank"
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Vezi
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="p-4 border-t bg-gray-50">
            <Link
              to="/admin/services"
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Vezi toate serviciile →
            </Link>
          </div>
        </div>

        {/* Cereri Recente */}
        <div className="bg-white border rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">📋 Cereri Recente</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Se încarcă...</p>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nu există cereri recente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold">Client</th>
                    <th className="p-4 text-left text-sm font-semibold">Vehicul</th>
                    <th className="p-4 text-left text-sm font-semibold">Status</th>
                    <th className="p-4 text-left text-sm font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentRequests.map(request => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium">{request.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{request.customer?.phone || ''}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {request.vehicle?.brandName || ''} {request.vehicle?.model || ''}
                        </p>
                        <p className="text-xs text-gray-500">{request.vehicle?.year || ''}</p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="p-4 border-t bg-gray-50">
            <Link
              to="/admin/service-requests"
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Vezi toate cererile →
            </Link>
          </div>
        </div>
      </div>

      {/* Expediții Recente - Rând nou, lățime completă */}
      <div className="mt-8">
        <div className="bg-white border rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">📦 Expediții Recente</h2>
            <div className="flex gap-3 text-sm">
              <span className="text-yellow-600">📦 {shippingStats.pending} așteptare</span>
              <span className="text-blue-600">📬 {shippingStats.received} primite</span>
              <span className="text-purple-600">🔧 {shippingStats.in_repair || 0} reparație</span>
              <span className="text-green-600">↩️ {shippingStats.returned} returnate</span>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Se încarcă expedierile...</p>
            </div>
          ) : recentShipping.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nu există expedieri în sistem.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold">Tracking</th>
                    <th className="p-4 text-left text-sm font-semibold">Client</th>
                    <th className="p-4 text-left text-sm font-semibold">Serviciu</th>
                    <th className="p-4 text-left text-sm font-semibold">Status</th>
                    <th className="p-4 text-left text-sm font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentShipping.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <span className="font-mono text-sm font-bold text-blue-600">
                          {item.trackingNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{item.customer?.name}</p>
                        <p className="text-xs text-gray-500">{item.customer?.phone}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{item.serviceName}</p>
                        <p className="text-xs text-gray-500">{item.package?.description}</p>
                      </td>
                      <td className="p-4">
                        {getShippingStatusBadge(item.status)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="p-4 border-t bg-gray-50">
            <Link
              to="/admin/shipping-requests"
              className="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Gestionează toate expedierile ({shippingStats.total}) →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/services?action=create"
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center"
        >
          <span className="block text-2xl mb-2">➕</span>
          <span className="font-medium">Adaugă serviciu nou</span>
        </Link>
        
        <Link
          to="/admin/shipping-requests"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center"
        >
          <span className="block text-2xl mb-2">📦</span>
          <span className="font-medium">Vezi toate expedierile</span>
        </Link>
        
        <Link
          to="/admin/service-requests"
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center"
        >
          <span className="block text-2xl mb-2">📋</span>
          <span className="font-medium">Vezi toate cererile</span>
        </Link>
      </div>
    </div>
  );
}

export default AdminHome;