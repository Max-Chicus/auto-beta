import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

function ServiceFinder({ onSearch }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Date pentru filtre
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  // Date selectate de utilizator
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedBrandName, setSelectedBrandName] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  // Rezultate servicii
  const [services, setServices] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch date inițiale
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch modele filtrate după brand
  useEffect(() => {
    if (selectedBrand) {
      fetchModelsForBrand();
    }
  }, [selectedBrand]);

  const fetchInitialData = async () => {
    try {
      const res = await API.get('/filters');
      setBrands(res.data.brands || []);
    } catch (err) {
      console.error('Eroare date filtre:', err);
    }
  };

  const fetchModelsForBrand = async () => {
    try {
      setLoading(true);

      // Folosește noul endpoint pentru modele
      const res = await API.get(`/filters/models?brand=${selectedBrand}`);

      if (res.data.success) {
        setModels(res.data.models || []);
        // Salvează numele brandului selectat
        const brand = brands.find(b => b._id === selectedBrand);
        if (brand) {
          setSelectedBrandName(brand.name);
        }
      } else {
        console.error('Eroare la modele:', res.data.message);
        setModels([]);
      }
    } catch (err) {
      console.error('Eroare modele:', err);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = (brandId, brandName) => {
    setSelectedBrand(brandId);
    setSelectedBrandName(brandName);
    setSelectedModel('');
    setModels([]);
    setStep(2);
  };

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    // Eliminat pasul cu anul, merg direct la căutarea serviciilor
    findServices(modelName);
  };

  const findServices = async (modelName = selectedModel) => {
    try {
      setLoading(true);

      console.log('🔍 Trimit request cu:', {
        brand: selectedBrand,
        brandName: selectedBrandName,
        model: modelName
      });

      const params = new URLSearchParams();
      if (selectedBrand) params.append('brand', selectedBrand);
      if (modelName) params.append('model', modelName);

      const res = await API.get(`/services?${params.toString()}`);

      console.log('📦 Primit:', res.data.length, 'servicii');
      console.log('📦 Lista servicii:', res.data.map(s => s.name));

      setServices(res.data || []);
      setShowResults(true);
      setStep(3);

    } catch (err) {
      console.error('❌ Eroare:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedBrand('');
    setSelectedBrandName('');
    setSelectedModel('');
    setModelSearch('');
    setModels([]);
    setServices([]);
    setShowResults(false);
    setStep(1);
  };

  // Modele filtrate după căutare
  const filteredModels = models.filter(model =>
    model.modelName.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border shadow-lg p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Găsește serviciul potrivit</h2>
        <p className="text-gray-600 mt-1">Selectează marca și modelul mașinii tale</p>
      </div>

      {/* STEPS INDICATOR - modificat la 3 pași */}
      <div className="flex justify-between mb-8 relative max-w-md mx-auto">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex flex-col items-center z-10">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
              ${step >= stepNum ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {stepNum}
            </div>
            <span className="text-xs mt-2 text-gray-600 font-medium text-center w-16">
              {stepNum === 1 && 'Selectează marca'}
              {stepNum === 2 && 'Alege modelul'}
              {stepNum === 3 && 'Vezi serviciile'}
            </span>
          </div>
        ))}
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200 -z-10"></div>
      </div>

      {/* STEP 1: SELECTARE BRAND */}
      {step === 1 && (
        <div className="animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4">Selectează marca mașinii</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {brands.map(brand => (
              <button
                key={brand._id}
                onClick={() => handleBrandSelect(brand._id, brand.name)}
                className="border border-gray-300 rounded-lg p-4 hover:border-red-500 hover:bg-red-50 transition-all text-center"
              >
                <div className="font-medium text-gray-900">{brand.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SELECTARE MODEL */}
      {step === 2 && selectedBrand && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Alege modelul {selectedBrandName}
            </h3>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Schimbă marca
            </button>
          </div>

          {/* SEARCH BAR pentru modele */}
          <div className="mb-4">
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Caută model..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Se încarcă modelele...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
              {filteredModels.length > 0 ? (
                filteredModels.map((model, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleModelSelect(model.modelName)}
                    className="border border-gray-300 rounded-lg p-3 hover:border-red-500 hover:bg-red-50 transition text-center"
                  >
                    <div className="font-medium">{model.modelName}</div>
                    {model.modelCode && (
                      <div className="text-xs text-gray-500 mt-1">{model.modelCode}</div>
                    )}
                  </button>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-gray-500">
                  Nu s-au găsit modele pentru această marcă
                </div>
              )}
            </div>
          )}

          {/* MANUAL MODEL INPUT (fallback) */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3">Nu găsești modelul?</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Introdu modelul manual"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                onChange={(e) => setSelectedModel(e.target.value)}
                value={selectedModel}
              />
              <button
                onClick={() => selectedModel && findServices(selectedModel)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                disabled={!selectedModel}
              >
                Caută servicii
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REZULTATE */}
      {step === 3 && showResults && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">
                Servicii disponibile pentru:
              </h3>
              <p className="text-gray-600">
                {selectedBrandName} {selectedModel}
              </p>
            </div>
            <button
              onClick={resetSearch}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Nouă căutare
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Se caută serviciile...</p>
            </div>
          ) : services.length > 0 ? (
            <div className="space-y-4">
              {services.map(service => (
                <div
                  key={service._id}
                  className="border border-gray-300 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/service/${service._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{service.name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <span>{service.serviceType?.icon}</span>
                          {service.serviceType?.name}
                        </span>
                        <span className="text-sm text-gray-600">⏱️ {service.duration}</span>
                        <span className="text-sm text-gray-600">🛡️ {service.warranty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {service.repairPrice} {service.currency}
                      </div>
                      <button className="mt-2 text-sm text-red-600 hover:text-red-800">
                        Vezi detalii →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <button
                  onClick={() => navigate('/services')}
                  className="w-full border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50"
                >
                  Vezi toate serviciile disponibile
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <div className="text-4xl mb-4">🔧</div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                Nu s-au găsit servicii specifice
              </h4>
              <p className="text-gray-600 mb-6">
                Pentru această combinație, îți recomandăm să ne contactezi pentru un diagnostic personalizat.
              </p>
              <button
                onClick={() => navigate('/request-service')}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                Solicită consultanță
              </button>
            </div>
          )}
        </div>
      )}

      {/* PROGRESS BUTTONS */}
      {step < 3 && !showResults && (
        <div className="mt-8 pt-6 border-t flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ← Înapoi
            </button>
          )}

          {step === 1 && (
            <div className="text-sm text-gray-500">
              Selectează o marcă pentru a continua
            </div>
          )}

          {step === 2 && selectedModel && (
            <button
              onClick={() => findServices()}
              className="ml-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Caută servicii →
            </button>
          )}
        </div>
      )}

      {/* STYLE PENTRU ANIMAȚIE */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ServiceFinder;