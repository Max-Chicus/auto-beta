import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/api';
import ServiceCard from '../components/ServiceCard';
import { Helmet } from 'react-helmet-async';

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

  // Stări pentru paginăție
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(21); // 20 servicii pe pagină

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

    // Resetează pagina la 1 când se schimbă parametrii URL
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [filters, currentPage]); // Reîncarcă la schimbarea paginii sau filtrelor

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

      // Adaugă parametrii de paginăție
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      console.log('🔍 Cerere către API:', `/services?${params.toString()}`);

      const res = await API.get(`/services?${params.toString()}`);

      console.log('📦 Răspuns primit:', res.data);

      // ✅ FORMATUL NOU (CU PAGINAȚIE)
      if (res.data && res.data.services && Array.isArray(res.data.services)) {
        console.log('✅ Format cu paginăție - servicii:', res.data.services.length);
        setServices(res.data.services);

        if (res.data.pagination) {
          setCurrentPage(res.data.pagination.currentPage);
          setTotalPages(res.data.pagination.totalPages);
          setTotalItems(res.data.pagination.totalItems);
        }
      }
      // ✅ FALLBACK pentru format vechi (array direct) - compatibilitate
      else if (Array.isArray(res.data)) {
        console.log('⚠️ Format vechi (array) - servicii:', res.data.length);
        setServices(res.data);
        setTotalItems(res.data.length);
        setTotalPages(1);
      }
      else {
        console.error('❌ Format necunoscut:', res.data);
        setServices([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('❌ Eroare servicii:', err);
      setServices([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Resetează la prima pagină când se schimbă filtrul
  };

  const resetAllFilters = () => {
    setFilters({ brand: '', model: '', search: '', serviceType: '', serviceTypeName: '' });
    setCurrentPage(1);
    window.location.href = '/services';
  };

  const selectedBrand = brands.find(b => b._id === filters.brand);
  const selectedServiceType = serviceTypes.find(st => st._id === filters.serviceType);

  // Generează numerele paginilor pentru afișare
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Arată maxim 5 numere de pagină
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <>
      <Helmet>
        <title>Servicii | Derstronik - Reparații ECU, ABS, Airbag, Panou Bord</title>
        <meta name="description" content="Catalog complet al serviciilor noastre: reparații unități motor (ECU), ABS, ESP, Airbag, panouri de bord, programare chei auto și camioane." />
        <link rel="canonical" href="https://www.derstronik.md/services" />
        {/* Breadcrumbs JSON-LD */}
        <script type="application/ld+json">
          {`{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Acasă",
              "item": "https://www.derstronik.md/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Servicii",
              "item": "https://www.derstronik.md/services"
            }
          ]
          }`}
        </script>
      </Helmet>
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
                  onClick={resetAllFilters}
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
                  onClick={resetAllFilters}
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
            <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
              <p className="text-gray-600">
                <strong>{totalItems}</strong> servicii găsite
                {filters.serviceType && ` pentru ${selectedServiceType?.name}`}
                {filters.model && !filters.serviceType && ` pentru ${selectedBrand?.name || ''} ${filters.model}`}
                <span className="text-sm text-gray-500 ml-2">
                  (Pagina {currentPage} din {totalPages})
                </span>
              </p>
              <button
                onClick={resetAllFilters}
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

            {/* PAGINAȚIE */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2 flex-wrap">
                {/* Buton Previous */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  ← Anterior
                </button>

                {/* Prima pagină dacă nu e în range */}
                {getPageNumbers()[0] > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      1
                    </button>
                    {getPageNumbers()[0] > 2 && <span className="px-2">...</span>}
                  </>
                )}

                {/* Numerele paginilor */}
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === pageNum
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Ultima pagină dacă nu e în range */}
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* Buton Next */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Următoarea →
                </button>
              </div>
            )}

            {/* Informație suplimentară */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Afișate {services.length} din {totalItems} servicii
            </div>
          </>
        )}
      </div>

    </>
  );
}

export default ServiceCatalog;