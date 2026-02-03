import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/api';
import ServiceCard from '../components/ServiceCard';
import ServiceFinder from '../components/ServiceFinder';
import { getFirstImageUrl } from '../utils/imageUtils';

function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    serviceType: '',
    search: ''
  });

  useEffect(() => {
    fetchFilters();
    fetchServices();
  }, [filters]);

  const fetchFilters = async () => {
    try {
      const res = await API.get('/filters');
      setBrands(res.data.brands || []);
      setServiceTypes(res.data.serviceTypes || []);
    } catch (err) {
      console.error('Eroare filtre:', err);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.serviceType) params.append('serviceType', filters.serviceType);
      if (filters.search) params.append('search', filters.search);

      const res = await API.get(`/services?${params.toString()}`);
      setServices(res.data);
    } catch (err) {
      console.error('Eroare servicii:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Servicii de reparație auto</h1>
        <p className="text-gray-600 mt-2">
          Servicii profesionale pentru toate mărcile și modelele
        </p>
      </div>

      {/* SERVICE FINDER COMPONENT */}
      {/* <div className="mb-10">
        <ServiceFinder onSearch={(data) => {
          setFilters({
            brand: data.brandId,
            search: data.model
          });
        }} />
      </div> */}

      {/* FILTRE RAPIDE */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marcă
          </label>
          <select
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Toate mărcile</option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tip serviciu
          </label>
          <select
            value={filters.serviceType}
            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">Toate tipurile</option>
            {serviceTypes.map(st => (
              <option key={st._id} value={st._id}>
                {st.icon} {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Căutare
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Nume serviciu sau model..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      {/* REZULTATE */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă serviciile...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <h3 className="text-xl font-semibold text-gray-700">Nu s-au găsit servicii</h3>
          <p className="text-gray-600 mt-2 mb-6">Încearcă alte filtre sau caută după alt model</p>
          <Link
            to="/request-service"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Solicită serviciu personalizat
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              {services.length} servicii găsite
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ brand: '', serviceType: '', search: '' })}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Resetează filtrele
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ServiceCatalog;