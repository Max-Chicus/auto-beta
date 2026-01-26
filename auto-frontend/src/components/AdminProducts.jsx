import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api/api';

function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [engines, setEngines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [years, setYears] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState('');

    const [searchParams] = useSearchParams();
    const action = searchParams.get('action');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        brand: '',
        model: '',
        engine: '',
        year: '',
        category: ''
    });

    // Fetch all data on component mount
    useEffect(() => {
        fetchAllData();

        // Check if we should show form for new product
        if (action === 'create') {
            setShowForm(true);
        }
    }, [action]);

    const fetchAllData = async () => {
        setLoading(true);
        setApiError('');
        try {
            console.log('🔍 Fetching admin data...');

            const [productsRes, filtersRes] = await Promise.all([
                API.get('/admin/products'),
                API.get('/filters')
            ]);

            console.log('📦 RAW Products response:', productsRes.data);
            console.log('📦 Type of response:', typeof productsRes.data);
            console.log('📦 Is array?', Array.isArray(productsRes.data));

            // VARIANTĂ 1: Dacă este obiect cu proprietatea "products"
            let productsData = [];

            if (productsRes.data && productsRes.data.products) {
                // Dacă are proprietatea "products"
                productsData = productsRes.data.products;
                console.log('✅ Found products in .products property');
            }
            // VARIANTĂ 2: Dacă este obiect cu proprietatea "data"  
            else if (productsRes.data && productsRes.data.data) {
                productsData = productsRes.data.data;
                console.log('✅ Found products in .data property');
            }
            // VARIANTĂ 3: Dacă este direct array
            else if (Array.isArray(productsRes.data)) {
                productsData = productsRes.data;
                console.log('✅ Response is direct array');
            }
            // VARIANTĂ 4: Dacă este altceva, încercăm să extragem primul array
            else if (productsRes.data && typeof productsRes.data === 'object') {
                // Caută orice array în interiorul obiectului
                for (const key in productsRes.data) {
                    if (Array.isArray(productsRes.data[key])) {
                        productsData = productsRes.data[key];
                        console.log(`✅ Found array in property "${key}"`);
                        break;
                    }
                }
            }

            console.log('🎯 Final products data:', productsData);
            console.log('🎯 Products count:', productsData.length);

            // Setează datele
            setProducts(productsData);

            // Setează filtrele
            const filters = filtersRes.data || {};
            setBrands(filters.brands || []);
            setModels(filters.models || []);
            setEngines(filters.engines || []);
            setCategories(filters.categories || []);

            // Ani
            if (filters.years && Array.isArray(filters.years)) {
                const yearsValues = filters.years.map(y => y.value || y);
                setYears(yearsValues);
            } else {
                setYears([2024, 2023, 2022, 2021, 2020]);
            }

        } catch (err) {
            console.error('❌ Eroare la încărcare:', err);
            console.error('❌ Eroare detalii:', err.response?.data);

            setApiError(err.message || 'Eroare de conexiune la server');

            // Setează valori default pentru a evita crash
            setProducts([]);
            setBrands([]);
            setModels([]);
            setEngines([]);
            setCategories([]);
            setYears([2024, 2023, 2022, 2021, 2020]);

        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Reset model when brand changes
        if (name === 'brand') {
            setFormData(prev => ({ ...prev, model: '', engine: '' }));
        }

        // Reset engine when model changes
        if (name === 'model') {
            setFormData(prev => ({ ...prev, engine: '' }));
        }
    };

    // Handle form submission (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validare
        if (!formData.name || !formData.price || !formData.brand || !formData.model || !formData.engine || !formData.year || !formData.category) {
            alert('Toate câmpurile sunt obligatorii!');
            return;
        }

        try {
            const productData = {
                ...formData,
                price: Number(formData.price),
                year: Number(formData.year)
            };

            console.log('📤 Sending product data:', productData);

            if (editingProduct) {
                // Update existing product
                await API.put(`/admin/products/${editingProduct._id}`, productData);
                alert('Produs actualizat cu succes!');
            } else {
                // Create new product
                await API.post('/admin/products', productData);
                alert('Produs creat cu succes!');
            }

            // Reset form and refresh data
            resetForm();
            fetchAllData();

        } catch (err) {
            console.error('❌ Eroare la salvare:', err);
            alert('Eroare: ' + (err.response?.data?.error || err.message));
        }
    };

    // Edit product
    const handleEdit = (product) => {
        console.log('✏️ Editing product:', product);
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            price: product.price || '',
            image: product.image || '',
            brand: product.brand?._id || product.brand || '',
            model: product.model?._id || product.model || '',
            engine: product.engine?._id || product.engine || '',
            year: product.year || '',
            category: product.category?._id || product.category || ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete product
    const handleDelete = async (id, productName) => {
        if (!window.confirm(`Sigur vrei să ștergi produsul "${productName}"?`)) {
            return;
        }

        try {
            await API.delete(`/admin/products/${id}`);
            alert('Produs șters cu succes!');
            fetchAllData();
        } catch (err) {
            console.error('❌ Eroare la ștergere:', err);
            alert('Eroare la ștergere: ' + (err.response?.data?.error || err.message));
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            image: '',
            brand: '',
            model: '',
            engine: '',
            year: '',
            category: ''
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    // Filter products based on search term
    const filteredProducts = Array.isArray(products)
        ? products.filter(product => {
            if (!product) return false;
            const name = product.name || '';
            const brandName = (product.brand?.name || product.brand) || '';
            const modelName = (product.model?.name || product.model) || '';

            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                modelName.toLowerCase().includes(searchTerm.toLowerCase());
        })
        : [];

    // Get filtered models based on selected brand
    const filteredModels = Array.isArray(models)
        ? models.filter(model => {
            if (!formData.brand) return true;
            return model.brandId === formData.brand || model.brand === formData.brand;
        })
        : [];

    // Get filtered engines based on selected model
    const filteredEngines = Array.isArray(engines)
        ? engines.filter(engine => {
            if (!formData.model) return true;
            return engine.modelId === formData.model || engine.model === formData.model;
        })
        : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">Se încarcă produsele...</p>
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-bold text-red-800 mb-2">Eroare la încărcare</h2>
                <p className="text-red-600 mb-4">{apiError}</p>
                <div className="space-y-2">
                    <p className="text-gray-700">Verifică:</p>
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>Backend-ul rulează (port 5000)</li>
                        <li>Ruta <code>/api/admin/products</code> este accesibilă</li>
                        <li>Console pentru detalii eroare</li>
                    </ul>
                </div>
                <button
                    onClick={fetchAllData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Încearcă din nou
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Gestionare Produse</h1>
                    <p className="text-gray-600">
                        Total: {products.length} produse • Afișate: {filteredProducts.length}
                    </p>
                </div>

                <div className="flex space-x-3 mt-4 md:mt-0">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Caută produse..."
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
                        className={`px-4 py-2 rounded-lg font-medium ${showForm
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        {showForm ? 'Anulează' : '+ Produs Nou'}
                    </button>
                </div>
            </div>

            {/* Product Form */}
            {showForm && (
                <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow">
                    <h2 className="text-xl font-bold mb-4">
                        {editingProduct ? 'Editează Produs' : 'Adaugă Produs Nou'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nume produs *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Ex: Filtru de ulei Audi A4"
                                    required
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preț (MDL) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Ex: 450"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {/* Image URL */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Imagine (opțional)
                                </label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                        <div className="h-32 border rounded flex items-center justify-center bg-gray-50">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="max-h-full max-w-full object-contain"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `
                                                    <div class="text-center p-4">
                                                    <div class="text-gray-400 mb-2">🖼️</div>
                                                    <p class="text-sm text-gray-500">Imagine invalidă sau URL greșit</p>
                                                    </div>
                                                `;
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
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
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Selectează marcă</option>
                                    {brands.map(b => (
                                        <option key={b._id} value={b._id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Model */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Model *
                                </label>
                                <select
                                    name="model"
                                    value={formData.model}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                    disabled={!formData.brand}
                                >
                                    <option value="">{formData.brand ? 'Selectează model' : 'Selectează mai întâi marca'}</option>
                                    {filteredModels.map(m => (
                                        <option key={m._id} value={m._id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Engine */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Motor *
                                </label>
                                <select
                                    name="engine"
                                    value={formData.engine}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                    disabled={!formData.model}
                                >
                                    <option value="">{formData.model ? 'Selectează motor' : 'Selectează mai întâi modelul'}</option>
                                    {filteredEngines.map(e => (
                                        <option key={e._id} value={e._id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    An *
                                </label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Selectează an</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categorie *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                >
                                    <option value="">Selectează categorie</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                {editingProduct ? 'Actualizează Produs' : 'Salvează Produs'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
                {filteredProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'Nu s-au găsit produse pentru căutarea ta.' : 'Nu există produse.'}
                        </p>
                        <p className="text-gray-400 mt-2">
                            {!searchTerm && 'Adaugă primul produs folosind butonul "+ Produs Nou"!'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-gray-700">Produs</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Brand / Model</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Motor / An</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Preț</th>
                                    <th className="p-4 text-left font-semibold text-gray-700">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map(product => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        {/* Product Info */}
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={product.image || '/placeholder.jpg'}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded mr-4 border bg-gray-100"
                                                    onError={(e) => {
                                                        // Folosește un placeholder local sau SVG inline
                                                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23f3f4f6"/><text x="12" y="12" text-anchor="middle" dy=".3em" font-size="8" fill="%239ca3af">No Image</text></svg>';
                                                        e.target.className = 'w-16 h-16 rounded mr-4 border bg-gray-100';
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {product.category?.name || 'Fără categorie'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Brand & Model */}
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{product.brand?.name || product.brand || '-'}</p>
                                                <p className="text-sm text-gray-500">{product.model?.name || product.model || '-'}</p>
                                            </div>
                                        </td>

                                        {/* Engine & Year */}
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{product.engine?.name || product.engine || '-'}</p>
                                                <p className="text-sm text-gray-500">{product.year || '-'}</p>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="p-4">
                                            <span className="font-bold text-red-600">{product.price} MDL</span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                >
                                                    Editează
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id, product.name)}
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

            {/* Debug Info (doar în development) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
                    <p className="font-medium">Debug Info:</p>
                    <p>Products count: {products.length}</p>
                    <p>Brands count: {brands.length}</p>
                    <p>Models count: {models.length}</p>
                    <p>Engines count: {engines.length}</p>
                </div>
            )}
        </div>
    );
}

export default AdminProducts;