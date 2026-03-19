import { useState, useEffect } from 'react';
import API from '../../api/api';

function AdminServiceRequests() {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Date pentru update status
    const [updateStatus, setUpdateStatus] = useState({
        status: '',
        notes: ''
    });

    useEffect(() => {
        fetchServiceRequests();
    }, [statusFilter, dateRange]);

    const fetchServiceRequests = async () => {
        setLoading(true);
        try {
            let url = '/admin/service-requests';
            const params = new URLSearchParams();

            if (statusFilter) params.append('status', statusFilter);
            if (dateRange.from) params.append('dateFrom', dateRange.from);
            if (dateRange.to) params.append('dateTo', dateRange.to);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await API.get(url);
            setRequests(res.data.requests || []);
            setStats(res.data.stats || {});
        } catch (err) {
            console.error('❌ Eroare cereri:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId) => {
        if (!updateStatus.status) {
            alert('Selectează un status nou');
            return;
        }

        try {
            await API.patch(`/admin/service-requests/${requestId}/status`, updateStatus);
            alert('✅ Status actualizat!');
            setUpdateStatus({ status: '', notes: '' });
            setSelectedRequest(null);
            fetchServiceRequests();
        } catch (err) {
            console.error('❌ Eroare update:', err);
            alert('Eroare: ' + (err.response?.data?.error || err.message));
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            new: { color: 'bg-blue-100 text-blue-800', label: 'Nouă' },
            contacted: { color: 'bg-yellow-100 text-yellow-800', label: 'Contactată' },
            scheduled: { color: 'bg-purple-100 text-purple-800', label: 'Programată' },
            in_progress: { color: 'bg-orange-100 text-orange-800', label: 'În progres' },
            completed: { color: 'bg-green-100 text-green-800', label: 'Finalizată' },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Anulată' }
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            low: { color: 'bg-gray-100 text-gray-800', label: 'Scăzută' },
            medium: { color: 'bg-blue-100 text-blue-800', label: 'Medie' },
            high: { color: 'bg-orange-100 text-orange-800', label: 'Ridicată' },
            urgent: { color: 'bg-red-100 text-red-800', label: 'Urgentă' }
        };

        const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', label: priority };
        return (
            <span className={`px-2 py-1 rounded text-xs ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportToCSV = () => {
        // Simplu export CSV
        const headers = ['ID', 'Nume', 'Telefon', 'Vehicul', 'Serviciu', 'Status', 'Data'];
        const csvContent = [
            headers.join(','),
            ...requests.map(req => [
                req._id,
                `"${req.customer.name}"`,
                req.customer.phone,
                `"${req.vehicle.brandName} ${req.vehicle.model}"`,
                `"${req.service.serviceName}"`,
                req.status,
                new Date(req.createdAt).toISOString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cereri-servicii-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading && requests.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">Se încarcă cererile de servicii...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Cereri de Servicii</h1>
                    <p className="text-gray-600">
                        Total: {requests.length} cereri • {stats.new || 0} noi
                    </p>
                </div>

                <div className="flex space-x-3 mt-4 md:mt-0">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={fetchServiceRequests}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">{stats.new || 0}</div>
                    <div className="text-sm text-gray-600">Noi</div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">{stats.contacted || 0}</div>
                    <div className="text-sm text-gray-600">Contactate</div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">{stats.in_progress || 0}</div>
                    <div className="text-sm text-gray-600">În progres</div>
                </div>
                <div className="bg-white border rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
                    <div className="text-sm text-gray-600">Finalizate</div>
                </div>
            </div>

            {/* FILTRE */}
            <div className="bg-white border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">Toate statusurile</option>
                            <option value="new">Noi</option>
                            <option value="contacted">Contactate</option>
                            <option value="scheduled">Programate</option>
                            <option value="in_progress">În progres</option>
                            <option value="completed">Finalizate</option>
                            <option value="cancelled">Anulate</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            De la
                        </label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Până la
                        </label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                </div>

                {(statusFilter || dateRange.from || dateRange.to) && (
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                            Filtre active
                            {statusFilter && ` • Status: ${statusFilter}`}
                            {dateRange.from && ` • De la: ${dateRange.from}`}
                            {dateRange.to && ` • Până la: ${dateRange.to}`}
                        </span>
                        <button
                            onClick={() => {
                                setStatusFilter('');
                                setDateRange({ from: '', to: '' });
                            }}
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Șterge filtre
                        </button>
                    </div>
                )}
            </div>

            {/* CERERI TABEL */}
            <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg">
                            Nu există cereri de servicii.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto max-h-[1000px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-700">Client</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Vehicul</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Serviciu</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Data</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map(request => (
                                    <tr key={request._id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{request.customer.name}</p>
                                                <p className="text-sm text-gray-600">{request.customer.phone}</p>
                                                {request.customer.email && (
                                                    <p className="text-xs text-gray-500">{request.customer.email}</p>
                                                )}
                                                {request.customer.city && (
                                                    <p className="text-xs text-gray-500">{request.customer.city}</p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <p className="font-medium">{request.vehicle.brandName}</p>
                                            <p className="text-sm text-gray-600">
                                                {request.vehicle.model} ({request.vehicle.year})
                                            </p>
                                            {request.vehicle.registration && (
                                                <p className="text-xs text-gray-500">
                                                    {request.vehicle.registration}
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <p className="font-medium">{request.service.serviceName}</p>
                                            {request.service.notes && (
                                                <p className="text-sm text-gray-600 italic">
                                                    "{request.service.notes}"
                                                </p>
                                            )}
                                            <div className="mt-1">
                                                {getPriorityBadge(request.priority)}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {getStatusBadge(request.status)}
                                            {request.contactNotes && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {request.contactNotes}
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <p className="text-sm">{formatDate(request.createdAt)}</p>
                                            {request.preferredContactTime && (
                                                <p className="text-xs text-gray-500">
                                                    Preferă: {request.preferredContactTime}
                                                </p>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                >
                                                    Gestionează
                                                </button>
                                                <a
                                                    href={`tel:${request.customer.phone}`}
                                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                >
                                                    Sună
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL PENTRU GESTIONARE */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* HEADER MODAL */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">Gestionează cererea</h2>
                                    <p className="text-gray-600">
                                        #{selectedRequest._id.toString().slice(-6).toUpperCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setUpdateStatus({ status: '', notes: '' });
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* DETALII CERERE */}
                            <div className="space-y-6">
                                {/* CLIENT */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-bold mb-3">Date client</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Nume</p>
                                            <p className="font-medium">{selectedRequest.customer.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Telefon</p>
                                            <p className="font-medium">
                                                <a href={`tel:${selectedRequest.customer.phone}`} className="text-blue-600 hover:text-blue-800">
                                                    {selectedRequest.customer.phone}
                                                </a>
                                            </p>
                                        </div>
                                        {selectedRequest.customer.email && (
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium">{selectedRequest.customer.email}</p>
                                            </div>
                                        )}
                                        {selectedRequest.customer.city && (
                                            <div>
                                                <p className="text-sm text-gray-600">Oraș</p>
                                                <p className="font-medium">{selectedRequest.customer.city}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* VEHICUL */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-bold mb-3">Date vehicul</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Marcă</p>
                                            <p className="font-medium">{selectedRequest.vehicle.brandName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Model</p>
                                            <p className="font-medium">{selectedRequest.vehicle.model}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">An</p>
                                            <p className="font-medium">{selectedRequest.vehicle.year}</p>
                                        </div>
                                        {selectedRequest.vehicle.registration && (
                                            <div>
                                                <p className="text-sm text-gray-600">Înmatriculare</p>
                                                <p className="font-medium">{selectedRequest.vehicle.registration}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SERVICIU & PROBLEMA */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-bold mb-3">Serviciu solicitat</h3>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Serviciu</p>
                                        <p className="font-medium">{selectedRequest.service.serviceName}</p>
                                        {selectedRequest.service.notes && (
                                            <p className="text-sm text-gray-600 mt-1 italic">
                                                "{selectedRequest.service.notes}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">Descriere problemă</p>
                                        <p className="text-gray-800 whitespace-pre-line">
                                            {selectedRequest.issueDescription}
                                        </p>
                                    </div>

                                    {/* SIMPTOME */}
                                    {selectedRequest.symptoms && selectedRequest.symptoms.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">Simptome</p>
                                            <ul className="list-disc pl-5 text-gray-800">
                                                {selectedRequest.symptoms.map((symptom, idx) => (
                                                    <li key={idx}>{symptom}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* CODURI EROARE */}
                                    {selectedRequest.errorCodes && selectedRequest.errorCodes.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600">Coduri eroare</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedRequest.errorCodes.map((code, idx) => (
                                                    <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                                        {code}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* UPDATE STATUS */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-bold mb-3">Actualizează status</h3>

                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Status curent</p>
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status nou
                                            </label>
                                            <select
                                                value={updateStatus.status}
                                                onChange={(e) => setUpdateStatus({ ...updateStatus, status: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            >
                                                <option value="">Selectează status</option>
                                                <option value="contacted">Contactat</option>
                                                <option value="scheduled">Programat</option>
                                                <option value="in_progress">În progres</option>
                                                <option value="completed">Finalizat</option>
                                                <option value="cancelled">Anulat</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Note interne
                                            </label>
                                            <textarea
                                                value={updateStatus.notes}
                                                onChange={(e) => setUpdateStatus({ ...updateStatus, notes: e.target.value })}
                                                rows="3"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                                placeholder="Note, feedback, detalii despre interacțiunea cu clientul..."
                                            />
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleStatusUpdate(selectedRequest._id)}
                                                disabled={!updateStatus.status}
                                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                                            >
                                                Salvează status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS FOOTER */}
                            <div className="flex justify-between items-center pt-6 border-t">
                                <div className="text-sm text-gray-500">
                                    Creată la: {formatDate(selectedRequest.createdAt)}
                                    {selectedRequest.updatedAt !== selectedRequest.createdAt && (
                                        <span className="ml-3">
                                            Actualizată: {formatDate(selectedRequest.updatedAt)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex space-x-3">
                                    <a
                                        href={`tel:${selectedRequest.customer.phone}`}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        📞 Sună acum
                                    </a>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedRequest._id);
                                            alert('ID copiat în clipboard!');
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Copiază ID
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminServiceRequests;