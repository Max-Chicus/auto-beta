import { useState, useEffect } from 'react';
import API from '../api/api';

function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: ''
  });

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/brands');
      setBrands(res.data || []);
    } catch (err) {
      console.error('❌ Eroare la încărcarea brandurilor:', err);
      setError('Eroare la încărcarea brandurilor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Numele brandului este obligatoriu');
      return;
    }

    try {
      if (editingBrand) {
        // Update existing brand
        await API.put(`/admin/brands/${editingBrand._id}`, formData);
        setSuccess('Brand actualizat cu succes!');
      } else {
        // Create new brand
        await API.post('/admin/brands', formData);
        setSuccess('Brand creat cu succes!');
      }

      // Reset form and refresh data
      resetForm();
      fetchBrands();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('❌ Eroare la salvare:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la salvare');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, brandName) => {
    if (!window.confirm(`Sigur vrei să ștergi brandul "${brandName}"?`)) {
      return;
    }

    try {
      await API.delete(`/admin/brands/${id}`);
      setSuccess(`Brand "${brandName}" șters cu succes!`);
      fetchBrands();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Eroare la ștergere:', err);
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg || 'Eroare la ștergere');
      
      // If deletion failed because brand has associated products
      if (errorMsg.includes('produse asociate')) {
        alert(`⚠️ ${errorMsg}\n\nȘterge mai întâi produsele asociate acestui brand.`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingBrand(null);
    setShowForm(false);
    setError('');
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă brandurile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestionare Mărci</h1>
          <p className="text-gray-600">
            Total: {brands.length} mărci • Afișate: {filteredBrands.length}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Caută mărci..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-full md:w-64"
            />
            <span className="absolute left-3 top-3 text-gray-400">🔍</span>
          </div>
          
          {/* Add/Close Form Button */}
          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              showForm 
                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {showForm ? 'Anulează' : '+ Marcă Nouă'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✅ {success}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Brand Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingBrand ? 'Editează Marcă' : 'Adaugă Marcă Nouă'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume marcă *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Audi, BMW, Mercedes"
                required
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                Numele trebuie să fie unic.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
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
                {editingBrand ? 'Actualizează Marcă' : 'Salvează Marcă'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Brands Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        {filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Nu s-au găsit mărci pentru căutarea ta.' : 'Nu există mărci.'}
            </p>
            <p className="text-gray-400 mt-2">
              {!searchTerm && 'Adaugă prima marcă folosind butonul "+ Marcă Nouă"!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700">Nume Marcă</th>
                  <th className="p-4 text-left font-semibold text-gray-700">ID</th>
                  <th className="p-4 text-left font-semibold text-gray-700">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBrands.map(brand => (
                  <tr key={brand._id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                          <span className="text-xl">🚗</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">{brand.name}</p>
                          <p className="text-sm text-gray-500">
                            {/* Aici poți adăuga numărul de modele dacă ai această informație */}
                            {/* {brand.modelsCount || 0} modele */}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {brand._id.substring(0, 8)}...
                      </code>
                    </td>

                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Editează
                        </button>
                        <button
                          onClick={() => handleDelete(brand._id, brand.name)}
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

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Notă importantă:</strong> Nu poți șterge o marcă care are produse asociate.
          <br />
          Pentru a șterge o marcă, trebuie mai întâi să ștergi toate produsele și modelele asociate.
        </p>
      </div>
    </div>
  );
}

export default AdminBrands;