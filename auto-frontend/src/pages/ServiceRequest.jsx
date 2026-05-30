import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/api';

function ServiceRequest() {
  const location = useLocation();
  const navigate = useNavigate();

  // Date din navigare (dacă vine de la un serviciu specific)
  const { serviceId, serviceName } = location.state || {};

  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: '',
      city: ''
    },
    vehicle: {
      brand: '',
      model: '',
      year: '',
      vin: '',
      registration: '',
      notes: ''
    },
    serviceId: serviceId || '',
    issueDescription: '',
    symptoms: [''],
    errorCodes: [''],
    preferredContactTime: ''
  });

  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchData();

    // Dacă avem serviceId, preia informațiile serviciului pentru a pre-popula brandul și modelul
    if (serviceId) {
      fetchServiceDetails(serviceId);
    }
  }, [serviceId]);

  const fetchData = async () => {
    try {
      const [brandsRes, servicesRes] = await Promise.all([
        API.get('/filters'),
        API.get('/services?limit=50')
      ]);

      setBrands(brandsRes.data.brands || []);
      setServices(servicesRes.data.services || servicesRes.data.data || []);
    } catch (err) {
      console.error('Eroare date:', err);
    }
  };

  const fetchServiceDetails = async (id) => {
    try {
      const res = await API.get(`/services/${id}`);
      const service = res.data;
      setSelectedService(service);

      // Pre-populează brandul din serviciu
      if (service.brand?._id) {
        handleChange('vehicle.brand', service.brand._id);
      }

      // Pre-populează descrierea problemei cu un text generic bazat pe numele serviciului
      const defaultDescription = `Solicit serviciul "${service.name}" pentru mașina mea.`;
      handleChange('issueDescription', defaultDescription);

      // Dacă serviciul are modele compatibile, sugerează primul model
      if (service.compatibleModels && service.compatibleModels.length > 0) {
        const firstModel = service.compatibleModels[0];
        if (firstModel.modelName) {
          handleChange('vehicle.model', firstModel.modelName);

          // Sugerează și anul dacă este disponibil
          if (firstModel.yearFrom) {
            handleChange('vehicle.year', firstModel.yearFrom);
          }
        }
      }
    } catch (err) {
      console.error('Eroare la preluarea detaliilor serviciului:', err);
    }
  };

  const handleChange = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

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

  // ============================
  // MODIFICARE IMPORTANTĂ AICI:
  // Înlocuiește funcția handleSubmit existentă cu asta:
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validare de bază în frontend
      if (!formData.customer.name || !formData.customer.phone) {
        alert('Numele și telefonul sunt obligatorii');
        setLoading(false);
        return;
      }

      if (!formData.vehicle.brand || !formData.vehicle.model || !formData.vehicle.year) {
        alert('Brand, model și anul mașinii sunt obligatorii');
        setLoading(false);
        return;
      }

      // Găsește numele brandului pentru email
      const brandObj = brands.find(b => b._id === formData.vehicle.brand);
      const brandName = brandObj?.name || formData.vehicle.brand;

      // Curăță array-urile goale
      const cleanData = {
        ...formData,
        symptoms: formData.symptoms.filter(s => s.trim() !== ''),
        errorCodes: formData.errorCodes.filter(c => c.trim() !== ''),
        // Adaugă numele brandului pentru backend
        vehicle: {
          ...formData.vehicle,
          brandName: brandName
        }
      };

      // DEBUG: Vezi ce date se trimit
      console.log('📤 Date trimise către backend:', cleanData);

      // ============================================
      // PAS 1: SALVEAZĂ ÎN BAZA DE DATE (API-ul tău)
      // ============================================
      const res = await API.post('/service-requests', cleanData);

      const savedRequestId = res.data.requestNumber || res.data._id;
      console.log('✅ Cerere salvată în DB cu ID:', savedRequestId);

      // ============================================
      // PAS 2: TRIMITE EMAIL CU WEB3FORMS
      // ============================================

      // ============================================
      // 🚨 ATENȚIE: ÎNLOCUIEȘTE URMĂTOAREA CHEIE CU ACCESS KEY-UL TĂU REAL DE LA WEB3FORMS.COM
      // Obține cheia de la: https://web3forms.com > Dashboard > Access Keys
      // ============================================
      const WEB3FORMS_ACCESS_KEY = 'ecbd0ae9-c840-4c34-a062-9be43ec689f5'; // <-- ÎNLOCUIEȚTE ACEASTĂ CHEIE!
      // Exemplu: '12345678-1234-1234-1234-123456789012'
      // ============================================

      const emailData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `🔔 CERERE SERVICIU NOUĂ: ${cleanData.customer.name} - ${brandName} ${cleanData.vehicle.model}`,
        from_name: 'Derstronik Electronic',
        botcheck: '', // Lăsat gol pentru protecție anti-spam

        // Conținut HTML pentru email
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 25px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
    .section { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #555; min-width: 150px; display: inline-block; }
    .status-new { 
      background: #fef3c7; 
      color: #92400e; 
      padding: 8px 15px; 
      border-radius: 20px; 
      font-weight: bold; 
      display: inline-block; 
      margin: 10px 0; 
      font-size: 14px;
    }
    .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
    h2 { color: #dc2626; margin-top: 0; font-size: 18px; }
    .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 10px 15px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🚨 CERERE SERVICIU NOUĂ</h1>
    </div>
    
    <div class="content">
      <div class="highlight">
        <div class="status-new">📋 STATUS: NOUĂ - NECESITĂ ACȚIUNE</div>
        <p><strong>🔢 Nr. cerere:</strong> ${savedRequestId}</p>
        <p><strong>📅 Data primirii:</strong> ${new Date().toLocaleString('ro-RO')}</p>
      </div>
      
      <div class="section">
        <h2>👤 DATE CLIENT</h2>
        <p><span class="label">Nume:</span> ${cleanData.customer.name}</p>
        <p><span class="label">Telefon:</span> <a href="tel:${cleanData.customer.phone}" style="color: #dc2626; text-decoration: none;">${cleanData.customer.phone}</a></p>
        ${cleanData.customer.email ? `<p><span class="label">Email:</span> <a href="mailto:${cleanData.customer.email}" style="color: #2563eb;">${cleanData.customer.email}</a></p>` : ''}
        ${cleanData.customer.city ? `<p><span class="label">Oraș:</span> ${cleanData.customer.city}</p>` : ''}
      </div>
      
      <div class="section">
        <h2>🚗 DATE VEHICUL</h2>
        <p><span class="label">Marcă:</span> ${brandName}</p>
        <p><span class="label">Model:</span> ${cleanData.vehicle.model}</p>
        <p><span class="label">An fabricație:</span> ${cleanData.vehicle.year}</p>
        ${cleanData.vehicle.vin ? `<p><span class="label">Serie șasiu (VIN):</span> ${cleanData.vehicle.vin}</p>` : ''}
        ${cleanData.vehicle.registration ? `<p><span class="label">Înmatriculare:</span> ${cleanData.vehicle.registration}</p>` : ''}
        ${cleanData.vehicle.notes ? `<div class="info-box"><strong>Observații client:</strong><br>${cleanData.vehicle.notes}</div>` : ''}
      </div>
      
      ${serviceName || cleanData.serviceId ? `
      <div class="section">
        <h2>🔧 SERVICIU SOLICITAT</h2>
        <p><span class="label">Serviciu:</span> ${serviceName || 'Serviciu selectat din listă'}</p>
        ${selectedService ? `<p><span class="label">Preț estimativ:</span> ${selectedService.repairPrice} ${selectedService.currency}</p>` : ''}
        ${selectedService?.duration ? `<p><span class="label">Durată estimată:</span> ${selectedService.duration}</p>` : ''}
      </div>
      ` : ''}
      
      ${cleanData.issueDescription ? `
      <div class="section">
        <h2>📝 DESCRIEREA PROBLEMEI</h2>
        <div class="info-box">${cleanData.issueDescription}</div>
      </div>
      ` : ''}
      
      ${cleanData.symptoms && cleanData.symptoms.length > 0 ? `
      <div class="section">
        <h2>⚠️ SIMPTOME MENȚIONATE</h2>
        <ul style="margin-left: 20px;">
          ${cleanData.symptoms.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      
      ${cleanData.errorCodes && cleanData.errorCodes.length > 0 ? `
      <div class="section">
        <h2>🔢 CODURI EROARE</h2>
        <p><strong>Coduri:</strong> ${cleanData.errorCodes.join(', ')}</p>
      </div>
      ` : ''}
      
      <div class="section">
        <h2>⏰ PREFERINȚE CONTACT</h2>
        <p><span class="label">Interval orar preferat:</span> ${cleanData.preferredContactTime || 'Orice oră'}</p>
      </div>
      
      <div class="info-box">
        <p><strong>💡 ACȚIUNE NECESARĂ:</strong> Contactează clientul în cel mult 30 de minute!</p>
        <p><strong>📞 Sună la:</strong> <a href="tel:${cleanData.customer.phone}" style="color: #dc2626; font-weight: bold; text-decoration: none;">${cleanData.customer.phone}</a></p>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Atelier Auto - Acest email a fost generat automat de pe website</p>
      <p><small>ID cerere: ${savedRequestId} • Sursă: Website • Timestamp: ${new Date().toISOString()}</small></p>
    </div>
  </div>
</body>
</html>
        `,

        // Date suplimentare pentru dashboard-ul Web3Forms
        customer_name: cleanData.customer.name,
        customer_phone: cleanData.customer.phone,
        customer_email: cleanData.customer.email || 'Nespecificat',
        vehicle_info: `${brandName} ${cleanData.vehicle.model} (${cleanData.vehicle.year})`,
        request_id: savedRequestId,
        request_status: 'new'
      };

      console.log('📧 Se trimite email via Web3Forms...');

      // Trimite cererea către Web3Forms
      const emailResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        console.log('✅ Email trimis cu succes via Web3Forms!');
      } else {
        console.warn('⚠️ Email-ul nu a putut fi trimis, dar cererea este salvată în DB:', emailResult.message);
        // Nu aruncăm eroare, continuăm pentru că cererea e salvată în DB
      }

      // ============================================
      // PAS 3: SETEAZĂ SUCCESUL ȘI REDIRECȚIONEAZĂ
      // ============================================
      setSuccess(true);
      setRequestId(savedRequestId);

      // Reset form după 5 secunde
      setTimeout(() => {
        navigate('/');
      }, 5000);

    } catch (err) {
      console.error('❌ Eroare la trimiterea cererii:', err);

      // Afișează mesajul de eroare din backend dacă există
      if (err.response?.data?.message) {
        alert(`Eroare: ${err.response.data.message}`);
      } else {
        alert('Eroare la trimiterea cererii. Te rugăm să încerci din nou sau să ne suni direct.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-800 mb-4">
            Cererea a fost trimisă cu succes!
          </h1>
          <p className="text-green-700 mb-6">
            Vă vom contacta în cel mai scurt timp la numărul de telefon furnizat.
          </p>
          <div className="bg-white border border-green-300 rounded-lg p-4 mb-6">
            <p className="font-medium text-gray-800">Număr cerere:</p>
            <p className="text-xl font-bold text-green-700">{requestId}</p>
          </div>
          <p className="text-sm text-gray-600">
            Vei fi redirecționat automat la pagina principală...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Solicită serviciu de reparație</h1>
        <p className="text-gray-600 mt-2">
          Completează formularul și te vom contacta pentru programare
        </p>
      </div>

      {/* BREADCRUMB pentru serviciu selectat */}
      {serviceName && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Soliciți serviciul:</p>
              <p className="text-lg font-bold text-gray-900">{serviceName}</p>
              {selectedService && (
                <p className="text-sm text-gray-600 mt-1">
                  Marcă: {selectedService.brand?.name} • Preț: {selectedService.repairPrice} {selectedService.currency}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Înapoi la serviciu
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* DATE CLIENT */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-6 pb-3 border-b">Date contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume *
              </label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={(e) => handleChange('customer.name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
                placeholder="Numele complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                value={formData.customer.phone}
                onChange={(e) => handleChange('customer.phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
                placeholder="07xx xxx xxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={formData.customer.email}
                onChange={(e) => handleChange('customer.email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oraș, Sat
              </label>
              <input
                type="text"
                value={formData.customer.city}
                onChange={(e) => handleChange('customer.city', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Localitatea dvs."
              />
            </div>
          </div>
        </div>

        {/* DATE VEHICUL */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-6 pb-3 border-b">Date vehicul</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marcă *
              </label>
              <select
                value={formData.vehicle.brand}
                onChange={(e) => handleChange('vehicle.brand', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              >
                <option value="">Selectează marca</option>
                {brands.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {selectedService && formData.vehicle.brand === selectedService.brand?._id && (
                <p className="text-sm text-green-600 mt-1">✓ Marcă pre-selectată din serviciu</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                value={formData.vehicle.model}
                onChange={(e) => handleChange('vehicle.model', e.target.value)}
                placeholder="Ex: A4, Seria 3, Golf"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />
              {selectedService && formData.vehicle.model && selectedService.compatibleModels?.some(m =>
                m.modelName.toLowerCase() === formData.vehicle.model.toLowerCase()
              ) && (
                  <p className="text-sm text-green-600 mt-1">✓ Model compatibil cu serviciul</p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                An fabricație *
              </label>
              <input
                type="number"
                value={formData.vehicle.year}
                onChange={(e) => handleChange('vehicle.year', e.target.value)}
                min="1990"
                max={new Date().getFullYear()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
                placeholder="Ex: 2015"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serie șasiu (VIN) (optional)
              </label>
              <input
                type="text"
                value={formData.vehicle.vin}
                onChange={(e) => handleChange('vehicle.vin', e.target.value)}
                placeholder="Ex: WAUZZZ8DZWA123456"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observații vehicul (optional)
              </label>
              <textarea
                value={formData.vehicle.notes}
                onChange={(e) => handleChange('vehicle.notes', e.target.value)}
                placeholder="Motor, cutie de viteze, dotări speciale, probleme specifice..."
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>
          </div>
        </div>

        {/* SERVICIU SOLICITAT */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-6 pb-3 border-b">Serviciu solicitat</h2>

          {serviceName ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-green-800">Ai selectat serviciul:</p>
                  <p className="text-lg font-bold text-gray-900">{serviceName}</p>
                  {selectedService && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                        {selectedService.brand?.name}
                      </span>
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                        <span className="text-red-600">Reparație: {selectedService.repairPrice} {selectedService.currency}</span>
                      </span>
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                        <span className="text-blue-600">Testare: {selectedService.testPrice} {selectedService.currency}</span>
                      </span>
                      <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                        ⏱️ {selectedService.duration}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-2xl">✅</span>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selectează serviciul (optional)
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) => handleChange('serviceId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                <option value="">Alege un serviciu</option>
                {services.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.brand?.name} - {s.name} (Rep: {s.repairPrice} {s.currency} | Test: {s.testPrice} {s.currency})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Poți să lași necompletat dacă nu ești sigur ce serviciu ai nevoie
              </p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrierea problemei (optional)
            </label>
            <textarea
              value={formData.issueDescription}
              onChange={(e) => handleChange('issueDescription', e.target.value)}
              placeholder="Descrie problema întâmpinată, când a apărut, în ce condiții..."
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
            {serviceName && formData.issueDescription && (
              <p className="text-sm text-gray-500 mt-1">
                Mesaj pre-generat bazat pe serviciul selectat. Poți modifica.
              </p>
            )}
          </div>

          {/* SIMPTOME */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Simptome (opțional)
              </label>
              <button
                type="button"
                onClick={() => addArrayField('symptoms')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Adaugă simptom
              </button>
            </div>

            {formData.symptoms.map((symptom, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={symptom}
                  onChange={(e) => handleArrayChange('symptoms', index, e.target.value)}
                  placeholder="Ex: Bate motorul, fum alb la eșapament, bec de avertizare aprins..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                />
                {formData.symptoms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('symptoms', index)}
                    className="px-3 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* CODURI EROARE */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Coduri eroare (opțional)
              </label>
              <button
                type="button"
                onClick={() => addArrayField('errorCodes')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Adaugă cod
              </button>
            </div>

            {formData.errorCodes.map((code, index) => (
              <div key={index} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleArrayChange('errorCodes', index, e.target.value)}
                  placeholder="Ex: P0300, 01130, B1234, etc."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                />
                {formData.errorCodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('errorCodes', index)}
                    className="px-3 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oră preferată pentru contact
            </label>
            <select
              value={formData.preferredContactTime}
              onChange={(e) => handleChange('preferredContactTime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            >
              <option value="">Orice oră</option>
              <option value="9-12">9:00 - 12:00</option>
              <option value="12-15">12:00 - 15:00</option>
              <option value="15-18">15:00 - 18:00</option>
              <option value="18-20">18:00 - 20:00</option>
            </select>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Se trimite...' : 'Trimite cererea'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Vei primi un apel de confirmare în cel mult 30 de minute.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            * Câmpurile marcate cu asterisc sunt obligatorii
          </p>
        </div>
      </form>
    </div>
  );
}

export default ServiceRequest;