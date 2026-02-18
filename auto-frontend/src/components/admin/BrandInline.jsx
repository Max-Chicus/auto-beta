import { useState } from 'react';
import { createBrand } from '../../api/api';

function BrandInline({ onBrandAdded, existingBrands = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    logo: null,
    logoPreview: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Handle logo upload - ACUM TRIMITE LA VERCEl BLOB
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verifică tipul fișierului
    if (!file.type.startsWith('image/')) {
      alert('Vă rugăm să încărcați doar imagini!');
      return;
    }

    // Verifică dimensiunea
    if (file.size > 2 * 1024 * 1024) { // 2MB max
      alert('Imaginea este prea mare! Dimensiunea maximă este 2MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      // 🔥 FIX: Folosește URL-ul complet ca în ImageUpload.jsx
      const res = await fetch('http://localhost:5000/api/upload-image/brand-logo', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload eșuat');
      }

      const data = await res.json();

      setNewBrand(prev => ({
        ...prev,
        logo: data.url,
        logoPreview: data.url
      }));

    } catch (err) {
      console.error('Eroare la încărcarea logo-ului:', err);
      alert('Eroare la încărcarea logo-ului. Vă rugăm să încercați din nou.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setNewBrand(prev => ({
      ...prev,
      logo: null,
      logoPreview: null
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();

    if (!newBrand.name.trim()) {
      alert('Numele brandului este obligatoriu');
      return;
    }

    const exists = existingBrands.some(b =>
      b.name.toLowerCase() === newBrand.name.toLowerCase().trim()
    );

    if (exists) {
      alert('Acest brand există deja!');
      return;
    }

    setLoading(true);
    try {
      // Pregătește datele pentru trimitere
      const brandData = {
        name: newBrand.name.trim(),
        logo: newBrand.logo  // Acesta e URL-ul de la Vercel Blob
      };

      const res = await createBrand(brandData);

      if (onBrandAdded) {
        onBrandAdded(res.data.brand);
      }

      setNewBrand({ name: '', logo: null, logoPreview: null });
      setShowForm(false);
      alert('✅ Brand adăugat cu succes! Acum poți selecta din lista de mai sus.');

    } catch (err) {
      console.error('Eroare:', err);
      alert(err.response?.data?.error || 'Eroare la adăugare');
    } finally {
      setLoading(false);
    }
  };

  // ... restul codului rămâne la fel (JSX-ul)

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
      >
        <span className="mr-1">+</span> Adaugă brand nou
      </button>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 mt-2 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Adaugă brand nou</h4>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setNewBrand({ name: '', logo: null, logoPreview: null });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕ Închide
        </button>
      </div>

      <div className="space-y-3">
        {/* Nume brand */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Nume brand *</label>
          <input
            type="text"
            value={newBrand.name}
            onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Ex: ALFA ROMEO, AUDI, BMW"
            required
            autoFocus
          />
        </div>

        {/* Logo upload */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Logo brand (opțional, recomandat)
          </label>

          {newBrand.logoPreview ? (
            <div className="relative">
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-white">
                <img
                  src={newBrand.logoPreview}
                  alt="Preview logo"
                  className="w-16 h-16 object-contain border border-gray-200 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">Logo încărcat</p>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Șterge logo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors cursor-pointer">
              <input
                type="file"
                id="brandLogoUpload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                disabled={uploadingLogo}
              />
              <label
                htmlFor="brandLogoUpload"
                className="cursor-pointer flex flex-col items-center"
              >
                {uploadingLogo ? (
                  <>
                    <div className="w-10 h-10 border-t-2 border-b-2 border-red-600 rounded-full animate-spin mb-2"></div>
                    <span className="text-sm text-gray-600">Se încarcă...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">📷</span>
                    </div>
                    <span className="text-sm text-gray-700">Click pentru a încărca logo</span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, max 2MB
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || uploadingLogo}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Se salvează...
                </>
              ) : (
                'Salvează brand'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewBrand({ name: '', logo: null, logoPreview: null });
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anulează
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          💡 Logo-ul va apărea în catalogul de servicii și pe site. Recomandat pentru branding profesionist.
        </div>
      </div>
    </div>
  );
}

export default BrandInline;