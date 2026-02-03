import { useState } from 'react';
import { createBrand } from '../../api/api';

function BrandInline({ onBrandAdded, existingBrands = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

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
      const res = await createBrand(newBrand);
      
      if (onBrandAdded) {
        onBrandAdded(res.data.brand);
      }
      
      setNewBrand({ name: '' });
      setShowForm(false); // Închide formularul după salvare
      alert('✅ Brand adăugat cu succes! Acum poți selecta din lista de mai sus.');
      
    } catch (err) {
      console.error('Eroare:', err);
      alert(err.response?.data?.error || 'Eroare la adăugare');
    } finally {
      setLoading(false);
    }
  };

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
            setNewBrand({ name: '' });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕ Închide
        </button>
      </div>

      {/* Înlocuiește <form> cu <div> și buton cu type="button" */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Nume brand *</label>
          <input
            type="text"
            value={newBrand.name}
            onChange={(e) => setNewBrand({ name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
            placeholder="Ex: ALFA ROMEO, AUDI, BMW"
            required
            autoFocus
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button" // Schimbă din type="submit" în type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Se salvează...' : 'Salvează brand'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewBrand({ name: '' });
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Închide
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          💡 După salvare, brandul va apărea în lista de mai sus. Poți selecta-l și continua completarea serviciului.
        </div>
      </div>
    </div>
  );
}

export default BrandInline;