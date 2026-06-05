import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/api';
import LabelPreview from '../components/LabelPreview';
import { downloadShippingLabel, printShippingLabel, generateShippingLabel } from '../utils/pdfGenerator';
import { Helmet } from 'react-helmet-async';

function ShippingLabel() {
    const location = useLocation();
    const navigate = useNavigate();
    const { serviceId, serviceName } = location.state || {};

    const [step, setStep] = useState(1); // 1: formular, 2: preview
    const [loading, setLoading] = useState(false);
    const [service, setService] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [formData, setFormData] = useState({
        customer: {
            name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            postalCode: ''
        },
        package: {
            description: '',
            weight: '',
            dimensions: '',
            isFragile: true
        },
        serviceId: serviceId || '',
        serviceName: serviceName || '',
        notes: ''
    });

    // Preia datele serviciului dacă avem serviceId
    useEffect(() => {
        if (serviceId) {
            fetchServiceDetails(serviceId);
        }
    }, [serviceId]);

    const fetchServiceDetails = async (id) => {
        try {
            const res = await API.get(`/services/${id}`);
            setService(res.data);
            setFormData(prev => ({
                ...prev,
                serviceName: res.data.name
            }));
        } catch (err) {
            console.error('Eroare la preluarea serviciului:', err);
        }
    };

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const generateTrackingNumber = () => {
        const prefix = 'DER';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validare
        if (!formData.customer.name || !formData.customer.phone || !formData.customer.address) {
            alert('Completează numele, telefonul și adresa!');
            return;
        }

        setLoading(true);

        try {
            // Generează număr de urmărire
            const newTrackingNumber = generateTrackingNumber();
            setTrackingNumber(newTrackingNumber);

            // Pregătește datele pentru backend
            const shippingData = {
                trackingNumber: newTrackingNumber,
                customer: formData.customer,
                package: formData.package,
                serviceId: serviceId || null,
                serviceName: formData.serviceName || service?.name || 'Reparație electronică auto',
                notes: formData.notes,
                status: 'pending'
            };

            console.log('📦 Se trimite cerere de expediere:', shippingData);

            // Salvează în backend
            const res = await API.post('/admin/shipping-requests', shippingData);

            console.log('✅ Cerere salvată:', res.data);

            // Treci la pasul de preview
            setStep(2);

        } catch (err) {
            console.error('❌ Eroare la generarea etichetei:', err);
            alert('A apărut o eroare: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const labelData = {
            customer: formData.customer,
            serviceName: formData.serviceName || service?.name || 'Reparație electronică auto',
            trackingNumber: trackingNumber
        };
        downloadShippingLabel(labelData);
    };

    const handlePrint = () => {
        const labelData = {
            customer: formData.customer,
            serviceName: formData.serviceName || service?.name || 'Reparație electronică auto',
            trackingNumber: trackingNumber
        };
        printShippingLabel(labelData);
    };

    const resetForm = () => {
        setStep(1);
        setFormData({
            customer: {
                name: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                postalCode: ''
            },
            package: {
                description: '',
                weight: '',
                dimensions: '',
                isFragile: true
            },
            serviceId: serviceId || '',
            serviceName: serviceName || '',
            notes: ''
        });
    };

    return (
        <>
            <Helmet>
                <title>Expediere Piesă | Derstronik - Service la Distanță</title>
                <meta name="description" content="Expediază piesa defectă prin curier și o reparăm la distanță. Instrucțiuni complete pentru ambalare și expediere." />
                <link rel="canonical" href="https://www.derstronik.md/shipping-label" />
            </Helmet>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Expediere piesă pentru reparație</h1>
                    <p className="text-gray-600 mt-2">
                        Completează datele și vei primi o etichetă PDF pentru a o lipi pe colet
                    </p>
                </div>

                {/* Breadcrumb */}
                {serviceName && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-800 font-medium">Expediere pentru:</p>
                                <p className="text-lg font-bold text-gray-900">{serviceName}</p>
                                {service && (
                                    <div className="mt-1 text-sm text-gray-600">
                                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                                            {service.brand?.name}
                                        </span>
                                        <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                                            {service.repairPrice} {service.currency}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                ← Înapoi
                            </button>
                        </div>
                    </div>
                )}

                {step === 1 ? (
                    /* FORMULAR DATE EXPEDIERE */
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* DATE CLIENT */}
                        <div className="bg-white rounded-xl border p-6">
                            <h2 className="text-xl font-bold mb-6 pb-3 border-b">Datele tale pentru expediere</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nume complet *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customer.name}
                                        onChange={(e) => handleChange('customer', 'name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: Popescu Ion"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefon *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.customer.phone}
                                        onChange={(e) => handleChange('customer', 'phone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="07xx xxx xxx"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email (pentru confirmare)
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.customer.email}
                                        onChange={(e) => handleChange('customer', 'email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresă completă (str., nr., bloc, ap.) *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customer.address}
                                        onChange={(e) => handleChange('customer', 'address', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: str. Ștefan cel Mare 123, ap. 45"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Oraș / Localitate *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customer.city}
                                        onChange={(e) => handleChange('customer', 'city', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: Chișinău"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cod poștal
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customer.postalCode}
                                        onChange={(e) => handleChange('customer', 'postalCode', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: 2001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* DETALII COLET */}
                        <div className="bg-white rounded-xl border p-6">
                            <h2 className="text-xl font-bold mb-6 pb-3 border-b">Detalii colet</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrierea piesei *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.package.description}
                                        onChange={(e) => handleChange('package', 'description', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: Unitate ABS BOSCH 5.3"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Greutate aproximativă (kg)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.package.weight}
                                        onChange={(e) => handleChange('package', 'weight', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: 0.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Dimensiuni (L x l x h) cm
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.package.dimensions}
                                        onChange={(e) => handleChange('package', 'dimensions', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Ex: 20x15x10"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.package.isFragile}
                                            onChange={(e) => handleChange('package', 'isFragile', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Piesa este fragilă (necesită protecție specială)</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observații / Instrucțiuni speciale
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        placeholder="Orice informație suplimentară despre piesă sau defecțiune..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* INFORMAȚII ADIȚIONALE */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-bold text-blue-800 mb-3">📦 Cum să expediezi piesa:</h3>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li>✓ Ambalază piesa în material protector (folie cu bule, polistiren)</li>
                                <li>✓ Asigură-te că piesa nu se poate mișca în interiorul coletului</li>
                                <li>✓ Lipește eticheta generată vizibil pe colet</li>
                                <li>✓ Expediază coletul la adresa atelierului prin orice curier</li>
                                <li>✓ După reparație, vom returna piesa în aceleași condiții</li>
                            </ul>
                        </div>

                        {/* BUTOANE */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Anulează
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                            >
                                {loading ? 'Se generează...' : 'Generează etichetă PDF'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* PREVIEW ETICHETĂ */
                    <div className="space-y-6">
                        <LabelPreview
                            data={{
                                customer: formData.customer,
                                serviceName: formData.serviceName || service?.name || 'Reparație electronică auto',
                                trackingNumber: trackingNumber
                            }}
                            onDownload={handleDownload}
                            onPrint={handlePrint}
                        />

                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <div className="text-4xl mb-3">✅</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Eticheta a fost generată cu succes!</h3>
                            <p className="text-green-700 mb-4">
                                Numărul tău de urmărire: <span className="font-bold">{trackingNumber}</span>
                            </p>
                            <p className="text-gray-600">
                                Printează eticheta, lipește-o pe colet și expediază piesa la adresa:
                            </p>
                            <p className="font-bold mt-2">Șoseaua Balcani 53, Chișinău</p>

                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Creează altă etichetă
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Pagina principală
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
}

export default ShippingLabel;