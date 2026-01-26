import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/api";
import FilterCollapse from "../components/FilterCollapse";
import FilterChip from "../components/FilterChip";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";

function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [engines, setEngines] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    brand: [],
    model: [],
    engine: [],
    year: [],
    category: [],
  });

  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  // ================= INITIAL FILTERS DIN QUERY =================
  useEffect(() => {
    const newFilters = { brand: [], model: [], engine: [], year: [], category: [] };
    for (let key of ["brand", "model", "engine", "year", "category"]) {
      const values = searchParams.getAll(key);
      if (values.length) newFilters[key] = values;
    }
    console.log("Filtre inițiale din URL:", newFilters);
    setFilters(newFilters);
  }, [searchParams]);

  // ================= FETCH FILTER DATA =================
  useEffect(() => {
    API.get("/filters")
      .then(res => {
        console.log("Date filtre:", res.data);
        setCategories(res.data.categories || []);
        setBrands(res.data.brands || []);
        setModels(res.data.models || []);
        setEngines(res.data.engines || []);
        setYears(res.data.years.map(y => y.value) || []);
      })
      .catch(err => console.error("Eroare la filtre:", err));
  }, []);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, values]) => {
          values.forEach(v => params.append(key, v));
        });
        
        console.log("Parametri pentru API:", params.toString());
        const res = await API.get(`/products?${params.toString()}`);
        console.log("Produse primite:", res.data);
        setProducts(res.data);
      } catch (err) {
        console.error("Eroare la produse:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (brands.length > 0 || categories.length > 0) {
      fetchProducts();
    }
  }, [filters, brands, categories]);

  // ================= FILTER HANDLERS =================
  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value],
    }));
  };

  const removeFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: [] }));
  };

  const resetFilters = () => {
    setFilters({ brand: [], model: [], engine: [], year: [], category: [] });
  };

  // ================= UI =================
  return (
    <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* ================= FILTRE ================= */}
      <aside>
        <FilterCollapse title="Categorie">
          {categories.map(cat => (
            <label key={cat._id} className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={filters.category.includes(cat._id)}
                onChange={() => toggleFilter("category", cat._id)}
              />
              {cat.name}
            </label>
          ))}
        </FilterCollapse>

        <FilterCollapse title="Marcă">
          {brands.map(b => (
            <label key={b._id} className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={filters.brand.includes(b.name)}
                onChange={() => toggleFilter("brand", b.name)}
              />
              {b.name}
            </label>
          ))}
        </FilterCollapse>

        <FilterCollapse title="Model">
          {models.map(m => (
            <label key={m._id} className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={filters.model.includes(m.name)}
                onChange={() => toggleFilter("model", m.name)}
              />
              {m.name}
            </label>
          ))}
        </FilterCollapse>

        <FilterCollapse title="Motor">
          {engines.map(e => (
            <label key={e._id} className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={filters.engine.includes(e.name)}
                onChange={() => toggleFilter("engine", e.name)}
              />
              {e.name}
            </label>
          ))}
        </FilterCollapse>

        <FilterCollapse title="An">
          {years.map(y => (
            <label key={y} className="flex gap-2 mb-2">
              <input
                type="checkbox"
                checked={filters.year.includes(y.toString())}
                onChange={() => toggleFilter("year", y.toString())}
              />
              {y}
            </label>
          ))}
        </FilterCollapse>

        <button
          onClick={resetFilters}
          className="w-full mt-4 border border-red-500 text-red-600 py-2 rounded-lg hover:bg-red-50"
        >
          Resetează filtrele
        </button>
      </aside>

      {/* ================= PRODUSE ================= */}
      <main className="md:col-span-3">
        {/* ACTIVE FILTER CHIPS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.category.length > 0 && (
            <FilterChip 
              label={`Categorie (${filters.category.length})`} 
              onRemove={() => removeFilter("category")} 
            />
          )}
          {filters.brand.length > 0 && (
            <FilterChip 
              label={`Marcă (${filters.brand.length})`} 
              onRemove={() => removeFilter("brand")} 
            />
          )}
          {filters.model.length > 0 && (
            <FilterChip 
              label={`Model (${filters.model.length})`} 
              onRemove={() => removeFilter("model")} 
            />
          )}
          {filters.engine.length > 0 && (
            <FilterChip 
              label={`Motor (${filters.engine.length})`} 
              onRemove={() => removeFilter("engine")} 
            />
          )}
          {filters.year.length > 0 && (
            <FilterChip 
              label={`An (${filters.year.length})`} 
              onRemove={() => removeFilter("year")} 
            />
          )}
        </div>

        {loading ? (
          <p className="text-center">Se încarcă...</p>
        ) : products.length === 0 ? (
          <div className="text-center">
            <p className="text-xl mb-4">Nu există produse pentru filtrele selectate</p>
            <button
              onClick={resetFilters}
              className="border border-red-500 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
            >
              Resetează filtrele
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p._id} className="border rounded-xl shadow hover:shadow-lg transition bg-white">
                <Link to={`/product/${p._id}`}>
                  <img src={p.image || "/placeholder.jpg"} alt={p.name} className="w-full h-48 object-cover rounded-t-xl" />
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-sm text-gray-600">
                      {p.brand?.name || p.brand} • {p.model?.name || p.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      {p.engine?.name || p.engine} • {p.year}
                    </p>
                    <p className="text-red-600 font-bold text-xl">{p.price} MDL</p>
                  </div>
                </Link>
                <button
                  onClick={() => dispatch(addToCart(p))}
                  className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Adaugă în coș
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Catalog;