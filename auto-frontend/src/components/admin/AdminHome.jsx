import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  // State pentru anunț
  const [announcement, setAnnouncement] = useState({
    isActive: false,
    title: '',
    message: '',
    type: 'info',
    expiresAt: ''
  });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAnnouncement();
  }, []);

  const fetchDashboardData = async () => {
    try {
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

      const services = servicesRes.data?.services || servicesRes.data || [];
      setRecentServices(Array.isArray(services) ? services.slice(0, 5) : []);

      const requests = requestsRes.data?.requests || requestsRes.data || [];
      setRecentRequests(Array.isArray(requests) ? requests.slice(0, 5) : []);

      setStats({
        newRequests: Array.isArray(requests) ? requests.length : 0,
        inProgress: 0
      });

      if (shippingStatsRes.data) {
        setShippingStats(shippingStatsRes.data);
      }

      if (shippingRecentRes.data?.requests) {
        setRecentShipping(shippingRecentRes.data.requests.slice(0, 5));
      }

    } catch (err) {
      console.error('Eroare dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current announcement
  const fetchAnnouncement = async () => {
    try {
      const res = await API.get('/admin/announcement');
      if (res.data) {
        setAnnouncement(res.data);
      }
    } catch (err) {
      console.error('Eroare la încărcarea anunțului:', err);
    }
  };

  // Save announcement
  const saveAnnouncement = async () => {
    setSavingAnnouncement(true);
    try {
      await API.post('/admin/announcement', announcement);
      setAnnouncementSaved(true);
      setTimeout(() => setAnnouncementSaved(false), 3000);
    } catch (err) {
      console.error('Eroare la salvarea anunțului:', err);
      alert('Eroare la salvarea anunțului');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // Delete/deactivate announcement
  const deleteAnnouncement = async () => {
    if (window.confirm('Sigur dorești să ștergi acest anunț?')) {
      try {
        await API.delete('/admin/announcement');
        setAnnouncement({
          isActive: false,
          title: '',
          message: '',
          type: 'info',
          expiresAt: ''
        });
      } catch (err) {
        console.error('Eroare la ștergerea anunțului:', err);
        alert('Eroare la ștergerea anunțului');
      }
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

  const navigate = useNavigate();

  // Opțiuni pentru tipul de anunț
  const announcementTypes = [
    { value: 'info', label: 'ℹ️ Informație', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'warning', label: '⚠️ Atenție', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'success', label: '✅ Succes', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'danger', label: '🔴 Urgent', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'vacation', label: '🏖️ Vacanță', color: 'bg-purple-100 text-purple-800 border-purple-200' }
  ];

  const getTypeColor = (type) => {
    const found = announcementTypes.find(t => t.value === type);
    return found ? found.color : announcementTypes[0].color;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Bine ai venit în Panou Admin</h1>
      <p className="text-gray-600 mb-6">Gestionare servicii de reparație auto</p>

      {/* SECȚIUNE ANUNȚ IMPORTANT */}
      <div className="mb-6 bg-white border rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <h2 className="text-lg font-semibold text-gray-900">Anunț important pentru clienți</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Activează un anunț care va apărea în partea de sus a paginii Home pentru toți vizitatorii.
          </p>
        </div>

        <div className="p-6">
          {/* Status curent */}
          {announcement.isActive && (
            <div className={`mb-4 p-3 rounded-lg border ${getTypeColor(announcement.type)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">Anunț activ:</p>
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm mt-1">{announcement.message}</p>
                  {announcement.expiresAt && (
                    <p className="text-xs mt-2 opacity-75">
                      Expiră: {new Date(announcement.expiresAt).toLocaleDateString('ro-RO')}
                    </p>
                  )}
                </div>
                <button
                  onClick={deleteAnnouncement}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  🗑️ Șterge
                </button>
              </div>
            </div>
          )}

          {/* Formular anunț */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activează anunțul
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.isActive}
                  onChange={(e) => setAnnouncement({ ...announcement, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                <span className="ms-3 text-sm text-gray-600">
                  {announcement.isActive ? 'Anunț ACTIV' : 'Anunț INACTIV'}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titlu anunț
              </label>
              <input
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                placeholder="Ex: În vacanță! sau Promoție specială"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesaj anunț
              </label>
              <textarea
                value={announcement.message}
                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                placeholder="Scrie mesajul anunțului aici..."
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip anunț
                </label>
                <select
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {announcementTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dată expirare (opțional)
                </label>
                <input
                  type="datetime-local"
                  value={announcement.expiresAt ? announcement.expiresAt.slice(0, 16) : ''}
                  onChange={(e) => setAnnouncement({ ...announcement, expiresAt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveAnnouncement}
                disabled={savingAnnouncement}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
              >
                {savingAnnouncement ? 'Se salvează...' : '📢 Salvează anunțul'}
              </button>
              
              {announcementSaved && (
                <span className="text-green-600 text-sm self-center animate-pulse">
                  ✓ Anunț salvat cu succes!
                </span>
              )}
            </div>

            {/* Previzualizare */}
            {announcement.isActive && announcement.title && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Previzualizare:</p>
                <div className={`p-3 rounded-lg border ${getTypeColor(announcement.type)} flex items-start gap-3`}>
                  <span className="text-xl">
                    {announcement.type === 'vacation' && '🏖️'}
                    {announcement.type === 'warning' && '⚠️'}
                    {announcement.type === 'danger' && '🔴'}
                    {announcement.type === 'success' && '✅'}
                    {announcement.type === 'info' && 'ℹ️'}
                  </span>
                  <div>
                    <p className="font-semibold">{announcement.title}</p>
                    <p className="text-sm">{announcement.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* Statistici expedieri */}
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

      {/* Restul codului rămâne la fel */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
                        <Link
                          to={`/admin/services?edit=${service._id}`}
                          className="block text-blue-600 hover:text-blue-800 text-sm mb-3"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/service/${service._id}`}
                          target="_blank"
                          className="block text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Vezi
                        </Link>
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

      {/* Expediții Recente */}
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