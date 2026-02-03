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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [servicesRes, requestsRes] = await Promise.all([
        API.get('/admin/services?limit=5'),
        API.get('/admin/service-requests?limit=5&status=new')
      ]);

      // Servicii recente
      const services = servicesRes.data?.services || servicesRes.data || [];
      setRecentServices(Array.isArray(services) ? services.slice(0, 5) : []);

      // Cereri recente
      const requests = requestsRes.data?.requests || requestsRes.data || [];
      setRecentRequests(Array.isArray(requests) ? requests.slice(0, 5) : []);

      // Statistici simple
      setStats({
        newRequests: Array.isArray(requests) ? requests.length : 0,
        inProgress: 0 // Poți calcula din alte request-uri
      });

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Servicii Recente */}
        <div className="bg-white border rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Servicii Recente</h2>
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
                      <td className="p-4 font-bold text-red-600">
                        {service.repairPrice} {service.currency}
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
            <h2 className="text-lg font-semibold text-gray-900">Cereri Recente</h2>
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
    </div>
  );
}

export default AdminHome;