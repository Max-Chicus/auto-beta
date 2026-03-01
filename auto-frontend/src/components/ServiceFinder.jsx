import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { getFirstImageUrl, getFullImageUrl } from '../utils/imageUtils'; // IMPORTĂ ȘI getFullImageUrl

function ServiceFinder({ onSearch, dbServiceTypes }) {
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

      const res = await API.get(`/filters/models?brand=${selectedBrand}`);

      if (res.data.success) {
        setModels(res.data.models || []);
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
    findServices(modelName);
  };

  const findServices = async (modelName = selectedModel) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedBrand) params.append('brand', selectedBrand);
      if (modelName) params.append('model', modelName);

      const res = await API.get(`/services?${params.toString()}`);

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

  // Funcție pentru a obține imaginea serviciului - EXACT CA ÎN ServiceCard
  const getServiceImage = (service) => {
    // Folosește aceeași logică ca în ServiceCard
    return getFirstImageUrl(service.images);
  };

  // Modele filtrate după căutare
  const filteredModels = models.filter(model =>
    model.modelName.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900 drop-shadow-sm">Găsește serviciul potrivit</h2>
        <p className="text-blue-700 mt-1">Selectează marca și modelul mașinii tale</p>
      </div>

      {/* STEPS INDICATOR */}
      <div className="flex justify-between mb-8 relative max-w-md mx-auto">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex flex-col items-center z-10">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
              ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-500'}
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
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-gradient-to-r from-red-500 via-blue-400 to-blue-500 -z-10"></div>
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
                className="border border-blue-300 rounded-lg p-4 transition-all text-center hover:bg-gradient-to-r hover:from-blue-400 hover:to-red-500 hover:text-white hover:shadow-lg"
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

          <div className="mb-4">
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Caută model..."
              className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* STEP 3: REZULTATE CU IMAGINI - PĂSTRĂM DESIGNUL TĂU */}
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
                  className="border border-blue-200 rounded-lg overflow-hidden hover:shadow-2xl transition cursor-pointer hover:bg-blue-50"
                  onClick={() => navigate(`/service/${service._id}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* IMAGINEA SERVICIULUI - ACUM FOLOSEȘTE getFirstImageUrl() */}
                    <div className="sm:w-48 h-32 sm:h-auto bg-gray-100 overflow-hidden">
                      {getServiceImage(service) ? (
                        <img
                          src={getServiceImage(service)}
                          alt={service.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random&size=256`;
                            e.target.className = 'w-full h-full object-contain p-4';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl text-gray-400">
                            {service.serviceType?.icon || '🔧'}
                          </span>
                        </div>
                      )}
                      
                      {/* BADGE PREȚ - ca în ServiceCard */}
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-red-600 font-bold px-3 py-1 rounded-lg shadow">
                        {service.repairPrice} {service.currency || 'LEI'}
                      </div>
                    </div>
                    
                    {/* DETALII SERVICIU */}
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {/* NUME SERVICIU */}
                          <h4 className="font-bold text-lg text-gray-900 mb-1">
                            {service.name}
                          </h4>
                          
                          {/* TIP SERVICIU */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                              <span className="text-base">{service.serviceType?.icon || '🔧'}</span>
                              <span>{service.serviceType?.name || 'Serviciu'}</span>
                            </span>
                          </div>
                          
                          {/* DESCRIERE SCURTĂ */}
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          
                          {/* DETALII SERVICIU - durată și garanție */}
                          <div className="border-t border-gray-100 pt-3 flex justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">⏱️</span>
                              <span>{service.duration || '2-3 zile'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">🛡️ Garanție</span>
                              <span>{service.warranty || '12 luni'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* BUTON DETALII */}
                        <div className="ml-4 flex-shrink-0">
                          <button className="bg-gray-50 hover:bg-red-50 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-200 hover:border-red-200 text-sm whitespace-nowrap">
                            Vezi detalii →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t text-center">
                <button
                  onClick={() => navigate('/services')}
                  className="border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition"
                >
                  Vezi toate serviciile disponibile →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg bg-blue-50/70">
              <div className="text-4xl mb-4 text-blue-600">🔧</div>
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

      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default ServiceFinder;