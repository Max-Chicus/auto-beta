import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/api';
import ServiceCard from '../components/ServiceCard';

function ServiceCatalog() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    serviceType: '',
    serviceTypeName: '',
    search: '',
    model: ''
  });

  // Citește parametrii din URL la încărcare
  useEffect(() => {
    const brand = searchParams.get('brand') || '';
    const model = searchParams.get('model') || '';
    const search = searchParams.get('search') || '';
    const serviceType = searchParams.get('serviceType') || '';
    const serviceTypeName = searchParams.get('serviceTypeName') || '';
    
    console.log('📥 Parametri URL primiți:', { brand, model, search, serviceType });
    
    setFilters({
      brand,
      model,
      search,
      serviceType,
      serviceTypeName
    });
  }, [searchParams]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (filters.brand || filters.serviceType || filters.search || filters.model) {
      fetchServices();
    } else {
      // Dacă nu sunt filtre, încarcă toate serviciile
      fetchServices();
    }
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
      if (filters.serviceTypeName) params.append('serviceTypeName', filters.serviceTypeName);
      if (filters.search) params.append('search', filters.search);
      if (filters.model) params.append('model', filters.model);

      console.log('🔍 Cerere către API cu parametrii:', params.toString());

      const res = await API.get(`/services?${params.toString()}`);
      console.log('📦 Servicii primite:', res.data.length);
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

  const selectedBrand = brands.find(b => b._id === filters.brand);
  const selectedServiceType = serviceTypes.find(st => st._id === filters.serviceType);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Servicii de reparație auto</h1>
        
        {/* Afișează mesajul pentru tipul de serviciu selectat */}
        {filters.serviceType && selectedServiceType && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 flex items-center flex-wrap gap-2">
              <span className="text-2xl">{selectedServiceType.icon}</span>
              <span className="font-bold">
                Servicii pentru: {selectedServiceType.name}
              </span>
              <button 
                onClick={() => {
                  setFilters({ brand: '', model: '', search: '', serviceType: '' });
                  window.location.href = '/services';
                }}
                className="ml-auto text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Șterge filtrul
              </button>
            </p>
          </div>
        )}
        
        {/* Afișează mesajul pentru model selectat */}
        {filters.model && selectedBrand && !filters.serviceType && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              🔍 Căutare pentru: <span className="font-bold">{selectedBrand.name} {filters.model}</span>
              <button 
                onClick={() => {
                  setFilters({ brand: '', model: '', search: '', serviceType: '' });
                  window.location.href = '/services';
                }}
                className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Șterge filtrele
              </button>
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mt-2">
          Servicii profesionale pentru toate mărcile și modelele
        </p>
      </div>

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
            placeholder="Nume serviciu..."
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
          <p className="text-gray-600 mt-2 mb-6">
            {filters.serviceType 
              ? `Nu există servicii pentru tipul: ${selectedServiceType?.name || ''}`
              : filters.model 
                ? `Nu există servicii pentru ${selectedBrand?.name || ''} ${filters.model}`
                : 'Încearcă alte filtre'}
          </p>
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
              {filters.serviceType && ` pentru ${selectedServiceType?.name}`}
              {filters.model && !filters.serviceType && ` pentru ${selectedBrand?.name || ''} ${filters.model}`}
            </p>
            <button
              onClick={() => {
                setFilters({ brand: '', serviceType: '', search: '', model: '' });
                window.location.href = '/services';
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Resetează filtrele
            </button>
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