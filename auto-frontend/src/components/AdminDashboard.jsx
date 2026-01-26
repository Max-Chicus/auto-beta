import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import API from '../api/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickActionLoading, setQuickActionLoading] = useState(false);
  const [quickActionForm, setQuickActionForm] = useState({
    show: false,
    type: 'brand', // 'brand' sau 'category'
    brand: { name: '', models: [{ name: '', engines: [''], years: [''] }] },
    category: { name: '' }
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Eroare la stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBrandAction = () => {
    setQuickActionForm({
      show: true,
      type: 'brand',
      brand: { 
        name: '', 
        models: [{ 
          name: '', 
          engines: [''], 
          years: [''] // acum e string gol, nu număr
        }] 
      },
      category: { name: '' }
    });
  };

  const handleQuickCategoryAction = () => {
    setQuickActionForm({
      show: true,
      type: 'category',
      brand: { name: '', models: [{ name: '', engines: [''], years: [''] }] },
      category: { name: '' }
    });
  };

  // Adaugă un model nou
  const addModel = () => {
    setQuickActionForm(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        models: [
          ...prev.brand.models,
          { name: '', engines: [''], years: [''] }
        ]
      }
    }));
  };

  // Șterge un model
  const removeModel = (index) => {
    if (quickActionForm.brand.models.length <= 1) return;
    
    setQuickActionForm(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        models: prev.brand.models.filter((_, i) => i !== index)
      }
    }));
  };

  // Adaugă un motor pentru un model
  const addEngine = (modelIndex) => {
    const updatedModels = [...quickActionForm.brand.models];
    updatedModels[modelIndex].engines.push('');
    
    setQuickActionForm(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        models: updatedModels
      }
    }));
  };

  // Șterge un motor
  const removeEngine = (modelIndex, engineIndex) => {
    const updatedModels = [...quickActionForm.brand.models];
    if (updatedModels[modelIndex].engines.length <= 1) return;
    
    updatedModels[modelIndex].engines = updatedModels[modelIndex].engines.filter(
      (_, i) => i !== engineIndex
    );
    
    setQuickActionForm(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        models: updatedModels
      }
    }));
  };

  // Adaugă un an pentru un model
  const addYear = (modelIndex) => {
    const updatedModels = [...quickActionForm.brand.models];
    updatedModels[modelIndex].years.push('');
    
    setQuickActionForm(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        models: updatedModels
      }
    }));
  };

  // Șterge un an
  const removeYear = (modelIndex, yearIndex) => {
    const updatedModels = [...quickActionForm.brand.models];
    if (updatedModels[modelIndex].years.length <= 1) return;
    
    updatedModels[modelIndex].years = updatedModels[modelIndex].years.filter(
      (_, i) => i !== yearIndex
    );
    
    setQuickActionForm(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        models: updatedModels
      }
    }));
  };

  // Validare an - verifică dacă e număr valid (între 1990 și anul curent + 1)
  const validateYear = (yearString) => {
    const year = parseInt(yearString);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(year)) return false;
    if (year < 1990) return false;
    if (year > currentYear + 1) return false; // Permite și anul viitor
    
    return true;
  };

  // Salvare Brand complet cu modele, motoare, ani
  const handleQuickBrandSubmit = async () => {
    const brandName = quickActionForm.brand.name.trim();
    
    if (!brandName) {
      alert('Te rog completează numele mărcii');
      return;
    }

    // Verifică că fiecare model are nume
    const hasEmptyModel = quickActionForm.brand.models.some(model => !model.name.trim());
    if (hasEmptyModel) {
      alert('Fiecare model trebuie să aibă un nume');
      return;
    }

    // Verifică că fiecare an este valid
    let hasInvalidYear = false;
    let invalidYearMessage = '';
    
    quickActionForm.brand.models.forEach((model, modelIndex) => {
      model.years.forEach((yearStr, yearIndex) => {
        if (yearStr.trim()) {
          if (!validateYear(yearStr.trim())) {
            hasInvalidYear = true;
            invalidYearMessage = `An invalid la modelul "${model.name || `#${modelIndex + 1}`}": "${yearStr}". Anul trebuie să fie între 1990 și ${new Date().getFullYear() + 1}.`;
          }
        }
      });
    });
    
    if (hasInvalidYear) {
      alert(invalidYearMessage);
      return;
    }

    setQuickActionLoading(true);

    try {
      // 1. Creează brandul
      const brandRes = await API.post('/admin/brands', { name: brandName });
      const brandId = brandRes.data.brand?._id || brandRes.data._id;
      
      console.log('✅ Brand creat:', brandName, brandId);

      // Array pentru a urmări ce a fost creat
      const createdItems = {
        brand: brandName,
        models: [],
        engines: [],
        years: []
      };

      // 2. Creează modelele
      for (const modelData of quickActionForm.brand.models) {
        const modelName = modelData.name.trim();
        
        if (modelName) {
          // Creează modelul
          const modelRes = await API.post('/admin/models', {
            name: modelName,
            brand: brandId
          });
          const modelId = modelRes.data.model?._id || modelRes.data._id;
          
          createdItems.models.push(modelName);
          console.log('✅ Model creat:', modelName, modelId);

          // 3. Creează motoarele pentru model
          for (const engineName of modelData.engines) {
            const trimmedEngine = engineName.trim();
            if (trimmedEngine) {
              await API.post('/admin/engines', {
                name: trimmedEngine,
                model: modelId
              });
              createdItems.engines.push(`${modelName}: ${trimmedEngine}`);
              console.log('✅ Motor creat:', trimmedEngine);
            }
          }

          // 4. Creează ani (doar cei unici și valizi)
          const uniqueYears = [...new Set(modelData.years
            .map(y => y.trim())
            .filter(y => y && validateYear(y))
            .map(y => parseInt(y))
          )];
          
          for (const year of uniqueYears) {
            try {
              await API.post('/admin/years', { value: year });
              createdItems.years.push(year);
              console.log('✅ An creat:', year);
            } catch (yearErr) {
              // Anul poate exista deja, ignoră eroarea
              if (!yearErr.response?.data?.error?.includes('există deja')) {
                console.warn('⚠️ Eroare la creare an:', yearErr.message);
              } else {
                // Adaugă anul la listă chiar dacă exista deja
                if (!createdItems.years.includes(year)) {
                  createdItems.years.push(year);
                }
              }
            }
          }
        }
      }

      // Mesaj de succes detaliat
      const successMessage = `
✅ Brand "${brandName}" creat cu succes!

📊 Rezumat:
• Brand: ${createdItems.brand}
• Modele: ${createdItems.models.length} (${createdItems.models.join(', ')})
• Motoare: ${createdItems.engines.length}
• Ani unici adăugați: ${[...new Set(createdItems.years)].length}

🎯 Acum poți adăuga produse pentru această marcă!
      `;
      
      alert(successMessage);
      
      // Reset form
      setQuickActionForm({
        show: false,
        type: 'brand',
        brand: { name: '', models: [{ name: '', engines: [''], years: [''] }] },
        category: { name: '' }
      });
      
      // Refresh stats
      fetchStats();
      
    } catch (err) {
      console.error('❌ Eroare la creare brand complet:', err);
      alert(`Eroare: ${err.response?.data?.error || err.message || 'Eroare necunoscută'}`);
    } finally {
      setQuickActionLoading(false);
    }
  };

  // Salvare Categorie rapidă
  const handleQuickCategorySubmit = async () => {
    const categoryName = quickActionForm.category.name.trim();
    
    if (!categoryName) {
      alert('Te rog completează numele categoriei');
      return;
    }

    setQuickActionLoading(true);

    try {
      await API.post('/admin/categories', { name: categoryName });
      alert(`✅ Categorie "${categoryName}" creată cu succes!`);
      
      // Reset form
      setQuickActionForm({
        show: false,
        type: 'category',
        brand: { name: '', models: [{ name: '', engines: [''], years: [''] }] },
        category: { name: '' }
      });
      
      // Refresh stats
      fetchStats();
      
    } catch (err) {
      console.error('❌ Eroare la creare categorie:', err);
      alert(`Eroare: ${err.response?.data?.error || err.message}`);
    } finally {
      setQuickActionLoading(false);
    }
  };

  // Anulare formular rapid
  const handleQuickActionCancel = () => {
    setQuickActionForm({
      show: false,
      type: 'brand',
      brand: { name: '', models: [{ name: '', engines: [''], years: [''] }] },
      category: { name: '' }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                Beta
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Magazin
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 p-3 rounded-lg">
                <span className="text-red-600 text-2xl">🛒</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produse</p>
                <p className="text-2xl font-bold">{stats?.products || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                <span className="text-blue-600 text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mărci</p>
                <p className="text-2xl font-bold">{stats?.brands || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                <span className="text-green-600 text-2xl">🚗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Modele</p>
                <p className="text-2xl font-bold">{stats?.models || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                <span className="text-purple-600 text-2xl">📂</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorii</p>
                <p className="text-2xl font-bold">{stats?.categories || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <nav className="space-y-2">
              <Link
                to="/admin"
                end="true"
                className="block py-3 px-4 bg-red-600 text-white rounded-lg font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                Produse
              </Link>
              <Link
                to="/admin/brands"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                Mărci
              </Link>
              <Link
                to="/admin/models"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                Modele
              </Link>
              <Link
                to="/admin/engines"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                Motoare
              </Link>
              <Link
                to="/admin/categories"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                Categorii
              </Link>
              <Link
                to="/admin/years"
                className="block py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border font-medium"
              >
                Ani
              </Link>
            </nav>

            {/* Quick Actions */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
              <h3 className="font-bold mb-4">Acțiuni rapide</h3>
              
              {/* Quick Add Product */}
              <button
                onClick={() => navigate('/admin/products?action=create')}
                className="w-full mb-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                + Produs nou
              </button>
              
              {/* Quick Add Brand - FORMULAR COMPLEX */}
              {quickActionForm.show && quickActionForm.type === 'brand' ? (
                <div className="mb-4">
                  <h4 className="font-bold mb-2">Adaugă marcă completă</h4>
                  
                  {/* Nume Brand */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nume marcă *
                    </label>
                    <input
                      type="text"
                      value={quickActionForm.brand.name}
                      onChange={(e) => setQuickActionForm(prev => ({
                        ...prev,
                        brand: { ...prev.brand, name: e.target.value }
                      }))}
                      placeholder="Ex: Ford, Toyota, Mercedes"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      autoFocus
                    />
                  </div>
                  
                  {/* Modele */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Modele *
                      </label>
                      <button
                        type="button"
                        onClick={addModel}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        + Adaugă model
                      </button>
                    </div>
                    
                    {quickActionForm.brand.models.map((model, modelIndex) => (
                      <div key={modelIndex} className="mb-4 p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Model #{modelIndex + 1}
                          </label>
                          {quickActionForm.brand.models.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeModel(modelIndex)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Șterge
                            </button>
                          )}
                        </div>
                        
                        {/* Nume Model */}
                        <input
                          type="text"
                          value={model.name}
                          onChange={(e) => {
                            const updatedModels = [...quickActionForm.brand.models];
                            updatedModels[modelIndex].name = e.target.value;
                            setQuickActionForm(prev => ({
                              ...prev,
                              brand: { ...prev.brand, models: updatedModels }
                            }));
                          }}
                          placeholder="Ex: Focus, Mondeo, Mustang"
                          className="w-full mb-3 border border-gray-300 rounded-lg px-3 py-2"
                        />
                        
                        {/* Motoare */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-sm text-gray-600">Motoare</label>
                            <button
                              type="button"
                              onClick={() => addEngine(modelIndex)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                            >
                              + Motor
                            </button>
                          </div>
                          {model.engines.map((engine, engineIndex) => (
                            <div key={engineIndex} className="flex items-center mb-1">
                              <input
                                type="text"
                                value={engine}
                                onChange={(e) => {
                                  const updatedModels = [...quickActionForm.brand.models];
                                  updatedModels[modelIndex].engines[engineIndex] = e.target.value;
                                  setQuickActionForm(prev => ({
                                    ...prev,
                                    brand: { ...prev.brand, models: updatedModels }
                                  }));
                                }}
                                placeholder="Ex: 1.6 TDCI, 2.0 EcoBoost"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
                              />
                              {model.engines.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeEngine(modelIndex, engineIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Ani - ACUM INPUT TEXT, NU SELECT */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-sm text-gray-600">
                              Ani (separă cu virgulă sau adaugă câte unul)
                              <br />
                              <span className="text-xs text-gray-500">
                                Ex: 2024, 2023, 2022 sau tastează fiecare an separat
                              </span>
                            </label>
                            <button
                              type="button"
                              onClick={() => addYear(modelIndex)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                            >
                              + An
                            </button>
                          </div>
                          <div className="space-y-1">
                            {model.years.map((year, yearIndex) => (
                              <div key={yearIndex} className="flex items-center">
                                <input
                                  type="text"
                                  value={year}
                                  onChange={(e) => {
                                    // Permite doar numere și virgulă
                                    const value = e.target.value.replace(/[^0-9,]/g, '');
                                    const updatedModels = [...quickActionForm.brand.models];
                                    updatedModels[modelIndex].years[yearIndex] = value;
                                    setQuickActionForm(prev => ({
                                      ...prev,
                                      brand: { ...prev.brand, models: updatedModels }
                                    }));
                                  }}
                                  onBlur={(e) => {
                                    // La focus out, separă anii dacă sunt multiple
                                    const value = e.target.value.trim();
                                    if (value.includes(',')) {
                                      const yearsArray = value.split(',')
                                        .map(y => y.trim())
                                        .filter(y => y);
                                      
                                      if (yearsArray.length > 1) {
                                        const updatedModels = [...quickActionForm.brand.models];
                                        // Înlocuiește cu array-ul de ani
                                        updatedModels[modelIndex].years = [
                                          yearsArray[0],
                                          ...yearsArray.slice(1).map(() => '')
                                        ];
                                        // Adaugă câmpuri goale pentru ani suplimentari
                                        for (let i = 1; i < yearsArray.length; i++) {
                                          if (i >= updatedModels[modelIndex].years.length) {
                                            updatedModels[modelIndex].years.push('');
                                          }
                                          updatedModels[modelIndex].years[i] = yearsArray[i];
                                        }
                                        setQuickActionForm(prev => ({
                                          ...prev,
                                          brand: { ...prev.brand, models: updatedModels }
                                        }));
                                      }
                                    }
                                  }}
                                  placeholder={`Ex: 2024${yearIndex === 0 ? ' (sau 2024,2023,2022)' : ''}`}
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
                                />
                                {model.years.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeYear(modelIndex, yearIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Poți scrie anii separați prin virgulă sau adăuga câte unul.
                            <br />
                            Anul trebuie să fie între 1990 și {new Date().getFullYear() + 1}.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Instrucțiuni */}
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="font-medium text-blue-800 mb-1">💡 Cum să folosești:</p>
                    <ul className="text-blue-700 list-disc pl-4">
                      <li>Completează numele brandului (ex: Ford)</li>
                      <li>Adaugă modele (ex: Focus, Mondeo)</li>
                      <li>Pentru fiecare model, adaugă motoare (ex: 1.6 TDCI)</li>
                      <li>Introdu anii (ex: 2024,2023,2022 sau tastează fiecare an separat)</li>
                    </ul>
                  </div>
                  
                  {/* Butoane Acțiune */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleQuickBrandSubmit}
                      disabled={quickActionLoading}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {quickActionLoading ? 'Se salvează...' : 'Salvează Brand'}
                    </button>
                    <button
                      onClick={handleQuickActionCancel}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              ) : quickActionForm.show && quickActionForm.type === 'category' ? (
                // Formular simplu pentru categorie
                <div className="mb-3">
                  <h4 className="font-bold mb-2">Adaugă categorie</h4>
                  <input
                    type="text"
                    value={quickActionForm.category.name}
                    onChange={(e) => setQuickActionForm(prev => ({
                      ...prev,
                      category: { ...prev.category, name: e.target.value }
                    }))}
                    placeholder="Nume categorie"
                    className="w-full mb-2 border border-gray-300 rounded-lg px-3 py-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleQuickCategorySubmit}
                      disabled={quickActionLoading}
                      className="flex-1 bg-purple-600 text-white py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      {quickActionLoading ? '...' : 'Salvează'}
                    </button>
                    <button
                      onClick={handleQuickActionCancel}
                      className="flex-1 border border-gray-300 text-gray-700 py-1 rounded hover:bg-gray-50"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              ) : (
                // Butoane normale
                <>
                  <button
                    onClick={handleQuickBrandAction}
                    className="w-full mb-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    + Marcă completă
                  </button>
                  <button
                    onClick={handleQuickCategoryAction}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                  >
                    + Categorie nouă
                  </button>
                </>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 min-h-[500px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;