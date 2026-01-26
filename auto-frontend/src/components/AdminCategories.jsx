import { useState, useEffect } from 'react';
import API from '../api/api';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('❌ Eroare la încărcarea categoriilor:', err);
      setError('Eroare la încărcarea categoriilor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Numele categoriei este obligatoriu');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        await API.put(`/admin/categories/${editingCategory._id}`, formData);
        setSuccess('Categorie actualizată cu succes!');
      } else {
        // Create new category
        await API.post('/admin/categories', formData);
        setSuccess('Categorie creată cu succes!');
      }

      // Reset form and refresh data
      resetForm();
      fetchCategories();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('❌ Eroare la salvare:', err);
      setError(err.response?.data?.error || err.message || 'Eroare la salvare');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, categoryName) => {
    if (!window.confirm(`Sigur vrei să ștergi categoria "${categoryName}"?`)) {
      return;
    }

    try {
      await API.delete(`/admin/categories/${id}`);
      setSuccess(`Categorie "${categoryName}" ștearsă cu succes!`);
      fetchCategories();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Eroare la ștergere:', err);
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg || 'Eroare la ștergere');
      
      // If deletion failed because category has associated products
      if (errorMsg.includes('produse asociate')) {
        alert(`⚠️ ${errorMsg}\n\nȘterge mai întâi produsele asociate acestei categorii.`);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingCategory(null);
    setShowForm(false);
    setError('');
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Icons for different categories
  const getCategoryIcon = (categoryName) => {
    const icons = {
      'motor': '⚙️',
      'suspensie': '🔄',
      'frâne': '🛑',
      'caroserie': '🚗',
      'electric': '🔌',
      'ulei': '🛢️',
      'filtre': '🧹',
      'baterie': '🔋',
      'faruri': '💡',
      'distribuție': '⛓️'
    };
    
    const lowerName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    
    return '📦';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă categoriile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestionare Categorii</h1>
          <p className="text-gray-600">
            Total: {categories.length} categorii • Afișate: {filteredCategories.length}
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Caută categorii..."
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
            {showForm ? 'Anulează' : '+ Categorie Nouă'}
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

      {/* Category Form */}
      {showForm && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">
            {editingCategory ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nume categorie *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ex: Motor, Frâne, Caroserie, Electric"
                required
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                Numele categoriei va fi afișat în filtrele magazinului.
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
                {editingCategory ? 'Actualizează Categorie' : 'Salvează Categorie'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Nu s-au găsit categorii pentru căutarea ta.' : 'Nu există categorii.'}
            </p>
            <p className="text-gray-400 mt-2">
              {!searchTerm && 'Adaugă prima categorie folosind butonul "+ Categorie Nouă"!'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map(category => (
                <div key={category._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                        <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          ID: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {category._id.substring(0, 8)}...
                          </code>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200"
                        title="Editează"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(category._id, category.name)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                        title="Șterge"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {/* Category Stats (could be enhanced with actual product counts) */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Produse asociate:</span>
                      <span className="font-medium">
                        {/* {category.productCount || 0} produse */}
                        -
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Sugestii pentru categorii:</strong>
          <br />
          • Motor (piese pentru motor)
          <br />
          • Frâne (plăcuțe frâne, discuri)
          <br />
          • Suspensie (amortizoare, arcuri)
          <br />
          • Caroserie (faruri, oglinzi, parbrize)
          <br />
          • Electric (baterii, alternatoare)
          <br />
          • Filtre (filtre de ulei, aer, combustibil)
        </p>
      </div>
    </div>
  );
}

export default AdminCategories;