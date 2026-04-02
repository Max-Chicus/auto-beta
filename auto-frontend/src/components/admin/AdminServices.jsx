import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';
import ImageUpload from './ImageUpload';
import ServiceTypeInline from './ServiceTypeInline';
import BrandInline from './BrandInline';
import { getFullImageUrl, getFirstImageUrl } from '../../utils/imageUtils';

function AdminServices() {
  const [services, setServices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const action = searchParams.get('action');

  // Form state - DOAR REPARAȚIE POATE FI "DE LA", TESTAREA E MEREU FIXĂ
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    serviceType: '',
    compatibleModels: [{
      modelName: '',
      modelCode: '',
      yearFrom: '',
      yearTo: '',
      engineCodes: '',
      notes: ''
    }],
    commonFaults: [''],
    description: '',
    // Pentru reparație
    repairPriceType: 'fixed', // 'fixed' sau 'from'
    repairPrice: '',        // preț fix reparație
    repairPriceFrom: '',    // preț de la reparație
    // Pentru testare - mereu fix
    testPrice: '',          // preț fix testare
    currency: 'EUR',
    duration: '2-3 zile lucrătoare',
    warranty: '12 luni',
    images: [],
    diagramImage: '',
    featured: false
  });

  useEffect(() => {
    fetchAllData();

    if (action === 'create') {
      setShowForm(true);
    }
  }, [action]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [servicesRes, filtersRes] = await Promise.all([
        API.get('/admin/services'),
        API.get('/filters')
      ]);

      setServices(servicesRes.data?.services || servicesRes.data || []);
      setBrands(filtersRes.data?.brands || []);
      setServiceTypes(filtersRes.data?.serviceTypes || []);
    } catch (err) {
      console.error('❌ Eroare date:', err);
    } finally {
      setLoading(false);
    }
  };

  // Adaugă tip serviciu nou
  const handleServiceTypeAdded = (newServiceType) => {
    setServiceTypes(prev => [...prev, newServiceType]);
    setFormData(prev => ({ ...prev, serviceType: newServiceType._id }));
  };

  // Adaugă brand nou
  const handleBrandAdded = (newBrand) => {
    setBrands(prev => [...prev, newBrand]);
    setFormData(prev => ({ ...prev, brand: newBrand._id }));
  };

  // Upload imagini
  const handleImagesChange = (newImages) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle array fields
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle compatible models
  const handleModelChange = (index, field, value) => {
    setFormData(prev => {
      const newModels = [...prev.compatibleModels];
      newModels[index][field] = value;
      return { ...prev, compatibleModels: newModels };
    });
  };

  const addModel = () => {
    setFormData(prev => ({
      ...prev,
      compatibleModels: [
        ...prev.compatibleModels,
        { modelName: '', modelCode: '', yearFrom: '', yearTo: '', engineCodes: '', notes: '' }
      ]
    }));
  };

  const removeModel = (index) => {
    if (formData.compatibleModels.length > 1) {
      setFormData(prev => ({
        ...prev,
        compatibleModels: prev.compatibleModels.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validare bază
    if (!formData.name || !formData.brand || !formData.serviceType) {
      alert('Completează câmpurile obligatorii: Nume, Brand, Tip serviciu!');
      return;
    }

    // Validare preț reparație în funcție de tip
    if (formData.repairPriceType === 'fixed') {
      if (!formData.repairPrice && formData.repairPrice !== 0) {
        alert('Pentru preț fix, completează prețul reparației!');
        return;
      }
    } else {
      if (!formData.repairPriceFrom && formData.repairPriceFrom !== 0) {
        alert('Pentru preț "de la", completează prețul minim al reparației!');
        return;
      }
    }

    // Validare preț testare - mereu necesar
    if (!formData.testPrice && formData.testPrice !== 0) {
      alert('Completează prețul testării!');
      return;
    }

    if (formData.compatibleModels.some(model => !model.modelName || !model.yearFrom || !model.yearTo)) {
      alert('Completează toate modelele compatibile: Nume, An de la, An până la!');
      return;
    }

    try {
      // Pregătește datele - trimite DOAR câmpurile necesare
      const serviceData = {
        name: formData.name,
        brand: formData.brand,
        serviceType: formData.serviceType,
        repairPriceType: formData.repairPriceType,
        testPrice: Number(formData.testPrice),
        currency: formData.currency,
        compatibleModels: formData.compatibleModels.map(model => ({
          modelName: model.modelName,
          modelCode: model.modelCode || '',
          yearFrom: Number(model.yearFrom),
          yearTo: Number(model.yearTo),
          engineCodes: model.engineCodes
            ? model.engineCodes.split(',').map(code => code.trim()).filter(code => code)
            : [],
          notes: model.notes || ''
        })),
        commonFaults: formData.commonFaults.filter(f => f.trim() !== ''),
        description: formData.description || '',
        duration: formData.duration,
        warranty: formData.warranty,
        images: formData.images,
        diagramImage: formData.diagramImage || '',
        featured: Boolean(formData.featured)
      };

      // Adaugă DOAR prețul corespunzător tipului ales
      if (formData.repairPriceType === 'fixed') {
        serviceData.repairPrice = Number(formData.repairPrice);
        // NU trimite repairPriceFrom deloc
      } else {
        serviceData.repairPriceFrom = Number(formData.repairPriceFrom);
        // NU trimite repairPrice deloc
      }

      console.log('📤 Trimitem serviciu cu prețuri:', {
        repairPriceType: serviceData.repairPriceType,
        repairPrice: serviceData.repairPrice,
        repairPriceFrom: serviceData.repairPriceFrom,
        testPrice: serviceData.testPrice
      });

      if (editingService) {
        await API.put(`/admin/services/${editingService._id}`, serviceData);
        alert('✅ Serviciu actualizat!');
      } else {
        await API.post('/admin/services', serviceData);
        alert('✅ Serviciu creat!');
      }

      resetForm();
      fetchAllData();
      navigate('/admin/services');

    } catch (err) {
      console.error('❌ Eroare:', err);

      if (err.response?.data?.error) {
        const errorData = err.response.data;
        if (errorData.details) {
          let errorMsg = 'Erori de validare:\n';
          Object.keys(errorData.details).forEach(key => {
            errorMsg += `• ${errorData.details[key]}\n`;
          });
          alert(errorMsg);
        } else {
          alert('Eroare: ' + errorData.error);
        }
      } else {
        alert('Eroare necunoscută: ' + err.message);
      }
    }
  };

  // Edit service
  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      brand: service.brand?._id || service.brand || '',
      serviceType: service.serviceType?._id || service.serviceType || '',
      compatibleModels: service.compatibleModels?.length > 0
        ? service.compatibleModels.map(m => ({
          modelName: m.modelName || '',
          modelCode: m.modelCode || '',
          yearFrom: m.yearFrom || '',
          yearTo: m.yearTo || '',
          engineCodes: Array.isArray(m.engineCodes) ? m.engineCodes.join(', ') : (m.engineCodes || ''),
          notes: m.notes || ''
        }))
        : [{ modelName: '', modelCode: '', yearFrom: '', yearTo: '', engineCodes: '', notes: '' }],
      commonFaults: service.commonFaults?.length > 0 ? service.commonFaults : [''],
      description: service.description || '',
      repairPriceType: service.repairPriceType || 'fixed',
      repairPrice: service.repairPrice || '',
      repairPriceFrom: service.repairPriceFrom || '',
      testPrice: service.testPrice || '',
      currency: service.currency || 'EUR',
      duration: service.duration || '2-3 zile lucrătoare',
      warranty: service.warranty || '12 luni',
      images: service.images || [],
      diagramImage: service.diagramImage || '',
      featured: service.featured || false
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete service
  const handleDelete = async (id, serviceName) => {
    if (!window.confirm(`Ștergi "${serviceName}"?`)) return;

    try {
      await API.delete(`/admin/services/${id}`);
      alert('✅ Serviciu șters!');
      fetchAllData();
    } catch (err) {
      alert('Eroare: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      serviceType: '',
      compatibleModels: [{ modelName: '', modelCode: '', yearFrom: '', yearTo: '', engineCodes: '', notes: '' }],
      commonFaults: [''],
      description: '',
      repairPriceType: 'fixed',
      repairPrice: '',
      repairPriceFrom: '',
      testPrice: '',
      currency: 'EUR',
      duration: '2-3 zile lucrătoare',
      warranty: '12 luni',
      images: [],
      diagramImage: '',
      featured: false
    });
    setEditingService(null);
    setShowForm(false);
  };

  // Funcție pentru formatarea afișării prețului reparației
  const formatRepairPrice = (service) => {
    if (service.repairPriceType === 'from') {
      return `de la ${service.repairPriceFrom} ${service.currency}`;
    } else {
      return `${service.repairPrice} ${service.currency}`;
    }
  };

  // Filter services
  const filteredServices = services.filter(service => {
    if (!service) return false;
    const name = service.name || '';
    const brandName = service.brand?.name || '';
    const serviceTypeName = service.serviceType?.name || '';

    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceTypeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă serviciile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestionare Servicii</h1>
          <p className="text-gray-600">
            {services.length} servicii • {filteredServices.length} afișate
          </p>
        </div>

        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Caută servicii..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full md:w-64"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>

          <button
            onClick={() => showForm ? resetForm() : setShowForm(true)}
            className={`px-4 py-2 rounded-lg font-medium ${showForm
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-red-600 text-white hover:bg-red-700'
              }`}
          >
            {showForm ? 'Anulează' : '+ Serviciu Nou'}
          </button>
        </div>
      </div>

      {/* FORMULAR - DOAR REPARAȚIA POATE FI "DE LA" */}
      {showForm && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingService ? 'Editează Serviciu' : 'Adaugă Serviciu Nou'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECȚIUNE 1: INFORMATII DE BAZA */}
            <div className="border-b pb-6">
              <h3 className="font-bold mb-4">Informații de bază</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nume serviciu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nume serviciu *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: BOSCH 5.3 Reparație ABS"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marcă *
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selectează marcă</option>
                    {brands.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2">
                    <BrandInline
                      onBrandAdded={handleBrandAdded}
                      existingBrands={brands}
                    />
                  </div>
                </div>

                {/* Tip serviciu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip serviciu *
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  >
                    <option value="">Selectează tip</option>
                    {serviceTypes.map(st => (
                      <option key={st._id} value={st._id}>
                        {st.icon} {st.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2">
                    <ServiceTypeInline
                      onServiceTypeAdded={handleServiceTypeAdded}
                      existingTypes={serviceTypes}
                    />
                  </div>
                </div>

                {/* TIP PREȚ REPARAȚIE - RADIO BUTTONS */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tip preț reparație *
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="repairPriceType"
                        value="fixed"
                        checked={formData.repairPriceType === 'fixed'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>Preț fix</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="repairPriceType"
                        value="from"
                        checked={formData.repairPriceType === 'from'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>Preț de la (minim)</span>
                    </label>
                  </div>
                </div>

                {/* CÂMPURI PREȚ REPARAȚIE - în funcție de tip */}
                {formData.repairPriceType === 'fixed' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preț reparație ({formData.currency}) *
                    </label>
                    <input
                      type="number"
                      name="repairPrice"
                      value={formData.repairPrice}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Ex: 139"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preț reparație - de la ({formData.currency}) *
                    </label>
                    <input
                      type="number"
                      name="repairPriceFrom"
                      value={formData.repairPriceFrom}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Ex: 99"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Prețul minim pentru reparație</p>
                  </div>
                )}

                {/* PREȚ TESTARE - mereu fix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preț testare ({formData.currency}) *
                  </label>
                  <input
                    type="number"
                    name="testPrice"
                    value={formData.testPrice}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Ex: 49"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Monedă */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monedă
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="EUR">EUR</option>
                    <option value="MDL">MDL</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECȚIUNE 2: MODELE COMPATIBILE */}
            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Modele compatibile *</h3>
                <button
                  type="button"
                  onClick={addModel}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  + Adaugă model
                </button>
              </div>

              <div className="space-y-4">
                {formData.compatibleModels.map((model, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Model #{index + 1}</h4>
                      {formData.compatibleModels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeModel(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          ✕ Șterge
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Nume model *
                        </label>
                        <input
                          type="text"
                          value={model.modelName}
                          onChange={(e) => handleModelChange(index, 'modelName', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Ex: A4"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          An de la *
                        </label>
                        <input
                          type="number"
                          value={model.yearFrom}
                          onChange={(e) => handleModelChange(index, 'yearFrom', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="2000"
                          min="1900"
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          An până la *
                        </label>
                        <input
                          type="number"
                          value={model.yearTo}
                          onChange={(e) => handleModelChange(index, 'yearTo', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="2005"
                          min={model.yearFrom || "1900"}
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>

                      <div className="lg:col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">
                          Cod motor (separate prin virgulă)
                        </label>
                        <input
                          type="text"
                          value={model.engineCodes}
                          onChange={(e) => handleModelChange(index, 'engineCodes', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Ex: 1.9 TDI, 2.0 TDI"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECȚIUNE 3: DEFECȚIUNI FRECVENTE */}
            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Defecțiuni frecvente
                </label>
                <button
                  type="button"
                  onClick={() => addArrayField('commonFaults')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Adaugă defecțiune
                </button>
              </div>

              <div className="space-y-2">
                {formData.commonFaults.map((fault, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={fault}
                      onChange={(e) => handleArrayChange('commonFaults', index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Ex: Nu comunică cu unitatea de control"
                    />
                    {formData.commonFaults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('commonFaults', index)}
                        className="px-3 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECȚIUNE 4: DESCRIERE */}
            <div className="border-b pb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere serviciu
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Descriere detaliată a serviciului, ce reparație include, beneficii..."
              />
            </div>

            {/* SECȚIUNE 5: IMAGINI */}
            <div className="border-b pb-6">
              <h3 className="font-bold mb-2">Imagini serviciu</h3>
              <p className="text-sm text-gray-600 mb-4">
                Încarcă imagini relevante pentru serviciu (max 5)
              </p>

              <ImageUpload
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={5}
              />
            </div>

            {/* SECȚIUNE 6: DETALII SUPLIMENTARE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durată estimată
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: 2-3 zile lucrătoare"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garanție
                </label>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: 12 luni"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Serviciu recomandat</span>
                </label>
              </div>
            </div>

            {/* BUTOANE FORMULAR */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                {editingService ? 'Actualizează Serviciu' : 'Salvează Serviciu'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABEL SERVICII */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Nu s-au găsit servicii' : 'Nu există servicii'}
            </p>
            {!searchTerm && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-red-600 hover:text-red-800 font-medium"
              >
                + Adaugă primul serviciu
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[1000px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700">Serviciu</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Marcă / Tip</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Modele</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Preț reparație</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Preț testare</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map(service => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center mr-4 overflow-hidden">
                          {service.images && service.images.length > 0 ? (
                            <img
                              src={getFirstImageUrl(service.images)}
                              alt={service.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random`;
                              }}
                            />
                          ) : (
                            <span className="text-2xl">
                              {service.serviceType?.icon || '⚙️'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          {service.featured && (
                            <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Recomandat
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center">
                        {service.brand?.logo ? (
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 overflow-hidden">
                            <img
                              src={getFullImageUrl(service.brand.logo)}
                              alt={service.brand.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML =
                                  `<span class="text-lg">${service.brand.name.charAt(0)}</span>`;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-gray-600">
                              {service.brand?.name?.charAt(0) || '-'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{service.brand?.name || '-'}</p>
                          <p className="text-sm text-gray-500">
                            {service.serviceType?.name || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-medium">
                          {service.compatibleModels?.length || 0} modele
                        </p>
                        {service.compatibleModels?.slice(0, 2).map((model, idx) => (
                          <p key={idx} className="text-gray-500">
                            {model.modelName} ({model.yearFrom}-{model.yearTo})
                          </p>
                        ))}
                        {service.compatibleModels?.length > 2 && (
                          <p className="text-gray-400 text-xs">
                            +{service.compatibleModels.length - 2} modele
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-red-600">
                        {formatRepairPrice(service)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-blue-600">
                        {service.testPrice} {service.currency}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {service.duration}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Editează
                        </button>
                        <button
                          onClick={() => handleDelete(service._id, service.name)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Șterge
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminServices;