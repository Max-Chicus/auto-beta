import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/api';

function AdminShippingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState(''); // NOU
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [stats, setStats] = useState({
        pending: 0,
        received: 0,
        returned: 0
    });

    useEffect(() => {
        fetchShippingRequests();
    }, [filter, searchTerm]); // Reîncarcă la schimbarea filtrului sau search-ului

    const fetchShippingRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (searchTerm) params.append('search', searchTerm); // NOU

            const res = await API.get(`/admin/shipping-requests?${params.toString()}`);

            if (res.data) {
                setRequests(res.data.requests || []);
                setStats(res.data.stats || {
                    pending: 0,
                    received: 0,
                    returned: 0
                });
            }
        } catch (err) {
            console.error('❌ Eroare la încărcarea expedierilor:', err);
            alert('Nu s-au putut încărca expedierile. Verifică conexiunea la server.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await API.put(`/admin/shipping-requests/${id}/status`, {
                status: newStatus
            });

            if (res.data) {
                setRequests(prev =>
                    prev.map(req =>
                        req._id === id ? { ...req, status: newStatus } : req
                    )
                );
                fetchShippingRequests();
                alert('✅ Status actualizat cu succes');
            }
        } catch (err) {
            console.error('❌ Eroare la actualizare status:', err);
            alert('Eroare la actualizarea statusului: ' + (err.response?.data?.error || err.message));
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: 'În așteptare' },
            received: { color: 'bg-blue-100 text-blue-800', label: 'Primit' },
            in_repair: { color: 'bg-purple-100 text-purple-800', label: 'În reparație' },
            returned: { color: 'bg-green-100 text-green-800', label: 'Returnat' },
            cancelled: { color: 'bg-red-100 text-red-800', label: 'Anulat' }
        };
        const c = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
    };

    const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div>
            {/* Header cu Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">📦 Gestionare Expediții</h1>
                    <p className="text-gray-600 mt-1">
                        Urmărește piesele trimise de clienți
                    </p>
                </div>
                
                {/* NOU - Search Bar */}
                <div className="w-full md:w-96">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Caută după număr tracking sau nume client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Statistici */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total expedieri</p>
                    <p className="text-2xl font-bold">{requests.length}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">În așteptare</p>
                    <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Primite</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.received}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">Returnate</p>
                    <p className="text-2xl font-bold text-green-800">{stats.returned}</p>
                </div>
            </div>

            {/* Filtre și rezultate căutare */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'received', 'in_repair', 'returned', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                filter === f
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {f === 'all' && 'Toate'}
                            {f === 'pending' && 'În așteptare'}
                            {f === 'received' && 'Primite'}
                            {f === 'in_repair' && 'În reparație'}
                            {f === 'returned' && 'Returnate'}
                            {f === 'cancelled' && 'Anulate'}
                        </button>
                    ))}
                </div>
                
                {/* Indicator rezultate căutare */}
                {searchTerm && (
                    <div className="text-sm text-gray-600">
                        Rezultate pentru: <span className="font-medium">"{searchTerm}"</span>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="ml-2 text-red-600 hover:text-red-800 text-xs"
                        >
                            Șterge căutarea
                        </button>
                    </div>
                )}
            </div>

            {/* Tabel expedieri */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    <p className="mt-2 text-gray-600">Se încarcă expedierile...</p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                    {searchTerm ? (
                        <div>
                            <p className="text-gray-500 mb-2">Nu s-au găsit expedieri pentru "{searchTerm}"</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-red-600 hover:text-red-800 font-medium"
                            >
                                Șterge căutarea
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-500">Nu există expedieri în această categorie.</p>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-sm">Tracking</th>
                                    <th className="p-3 text-left font-semibold text-sm">Client</th>
                                    <th className="p-3 text-left font-semibold text-sm">Piesă</th>
                                    <th className="p-3 text-left font-semibold text-sm">Status</th>
                                    <th className="p-3 text-left font-semibold text-sm">Data</th>
                                    <th className="p-3 text-left font-semibold text-sm">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.map(req => (
                                    <tr key={req._id} className="hover:bg-gray-50">
                                        <td className="p-3">
                                            <span className="font-mono text-sm font-bold text-blue-600">
                                                {req.trackingNumber}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <p className="font-medium">{req.customer?.name}</p>
                                            <p className="text-xs text-gray-500">{req.customer?.phone}</p>
                                        </td>
                                        <td className="p-3">
                                            <p className="text-sm font-medium">{req.package?.description || req.serviceName}</p>
                                            <p className="text-xs text-gray-500">
                                                {req.customer?.city}
                                            </p>
                                        </td>
                                        <td className="p-3">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {formatDate(req.createdAt)}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    value={req.status}
                                                    onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                                    className="text-xs border rounded px-2 py-1 w-28"
                                                >
                                                    <option value="pending">Așteptare</option>
                                                    <option value="received">Primit</option>
                                                    <option value="in_repair">Reparație</option>
                                                    <option value="returned">Returnat</option>
                                                    <option value="cancelled">Anulat</option>
                                                </select>
                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 text-left"
                                                >
                                                    Detalii →
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal pentru detalii complete */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">📦 Detalii complete expediere</h2>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Număr urmărire */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium">Număr urmărire</p>
                                <p className="text-2xl font-mono font-bold text-blue-600">{selectedRequest.trackingNumber}</p>
                            </div>

                            {/* Date client */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b">👤 Date client</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nume complet</p>
                                        <p className="font-medium">{selectedRequest.customer?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Telefon</p>
                                        <p className="font-medium">{selectedRequest.customer?.phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{selectedRequest.customer?.email || 'Nespecificat'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Adresă completă</p>
                                        <p className="font-medium">{selectedRequest.customer?.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Oraș</p>
                                        <p className="font-medium">{selectedRequest.customer?.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Cod poștal</p>
                                        <p className="font-medium">{selectedRequest.customer?.postalCode || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalii colet */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b">📦 Detalii colet</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Descriere piesă</p>
                                        <p className="font-medium">{selectedRequest.package?.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Greutate</p>
                                        <p className="font-medium">{selectedRequest.package?.weight || 'Nespecificat'} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Dimensiuni</p>
                                        <p className="font-medium">{selectedRequest.package?.dimensions || 'Nespecificat'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Fragil</p>
                                        <p className="font-medium">{selectedRequest.package?.isFragile ? 'Da' : 'Nu'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Serviciu și observații */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b">🔧 Serviciu</h3>
                                <p className="font-medium">{selectedRequest.serviceName}</p>
                                {selectedRequest.serviceId && (
                                    <p className="text-xs text-gray-500 mt-1">ID Serviciu: {selectedRequest.serviceId}</p>
                                )}
                            </div>

                            {selectedRequest.notes && (
                                <div>
                                    <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b">📝 Observații client</h3>
                                    <p className="bg-gray-50 p-3 rounded">{selectedRequest.notes}</p>
                                </div>
                            )}

                            {/* Date sistem */}
                            <div>
                                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b">⚙️ Date sistem</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Creat la</p>
                                        <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString('ro-RO')}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-medium">{getStatusBadge(selectedRequest.status)}</p>
                                    </div>
                                    {selectedRequest.updatedAt && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Ultima actualizare</p>
                                            <p className="font-medium">{new Date(selectedRequest.updatedAt).toLocaleString('ro-RO')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Închide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminShippingRequests;