import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [engines, setEngines] = useState([]);
  const [years, setYears] = useState([]);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [engine, setEngine] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");

  // ================= FETCH FILTERS FROM BACKEND =================
  useEffect(() => {
    API.get("/filters")
      .then(res => {
        setBrands(res.data.brands || []);
        setModels(res.data.models || []);
        setEngines(res.data.engines || []);
        setYears(res.data.years.map(y => y.value) || []);
        setCategories(res.data.categories || []);
      })
      .catch(err => console.error(err));
  }, []);

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
    setModel("");
    setEngine("");
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
    setEngine("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brand || !model || !engine || !year) {
      alert("Completați toate câmpurile obligatorii: Marcă, Model, Motor, An");
      return;
    }

    // Găsim brand, model și engine pentru a trimite numele (nu ID-urile)
    const selectedBrand = brands.find(b => b._id === brand);
    const selectedModel = models.find(m => m._id === model);
    const selectedEngine = engines.find(eng => eng._id === engine);

    const params = new URLSearchParams();
    params.append("brand", selectedBrand.name);
    params.append("model", selectedModel.name);
    params.append("engine", selectedEngine.name);
    params.append("year", year);

    if (category) {
      const selectedCategory = categories.find(c => c._id === category);
      if (selectedCategory) {
        params.append("category", selectedCategory._id);
      }
    }

    navigate(`/catalog?${params.toString()}`);
  };

  return (
    <div className="space-y-16">
      {/* FILTRARE */}
      <section className="hero relative min-h-[70vh] flex items-center justify-center bg-cover bg-no-repeat">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <select
            value={brand}
            onChange={handleBrandChange}
            className="border p-3 rounded focus:ring-2 focus:ring-red-400"
            required
          >
            <option value="">Marca</option>
            {brands.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>

          <select
            value={model}
            onChange={handleModelChange}
            className="border p-3 rounded"
            disabled={!brand}
            required
          >
            <option value="">Model</option>
            {models
              .filter(m => m.brandId === brand) // Folosim brandId din model
              .map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
          </select>

          <select
            value={engine}
            onChange={e => setEngine(e.target.value)}
            className="border p-3 rounded"
            disabled={!model}
            required
          >
            <option value="">Motor</option>
            {engines
              .filter(e => e.modelId === model) // Folosim modelId din engine
              .map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
          </select>

          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="border p-3 rounded"
            required
          >
            <option value="">An</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="border p-3 rounded"
          >
            <option value="">Categorie</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <button
            type="submit"
            className="md:col-span-5 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Caută piese
          </button>
        </form>
      </section>

      {/* CATEGORII PRODUSE */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Categorii produse</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link
              key={cat._id}
              to={`/catalog?category=${cat._id}`}
              className="border rounded-lg p-6 text-center font-medium hover:bg-red-600 hover:text-white transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* MARCI AUTO */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Mărci auto</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {brands.map(b => (
              <Link
                key={b._id}
                to={`/catalog?brand=${b.name}`}
                className="border rounded-lg py-4 text-center font-medium hover:bg-gray-900 hover:text-white transition"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;