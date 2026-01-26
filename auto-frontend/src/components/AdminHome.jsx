import { useState, useEffect } from 'react';
import API from '../api/api';
import { Link } from 'react-router-dom';

function AdminHome() {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentProducts();
  }, []);

  const fetchRecentProducts = async () => {
    try {
      const res = await API.get('/admin/products');
      // Ia ultimele 5 produse
      setRecentProducts(res.data.slice(0, 5));
    } catch (err) {
      console.error('Eroare la produse recente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bine ai venit în Admin Panel</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ultimele produse adăugate</h2>
        {loading ? (
          <p>Se încarcă...</p>
        ) : recentProducts.length === 0 ? (
          <p className="text-gray-500">Nu există produse încă.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Produs</th>
                  <th className="p-3 text-left">Brand</th>
                  <th className="p-3 text-left">Preț</th>
                  <th className="p-3 text-left">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map(product => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded mr-3"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{product.brand?.name}</td>
                    <td className="p-3 font-bold">{product.price} MDL</td>
                    <td className="p-3">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="text-blue-600 hover:underline mr-3"
                      >
                        Editează
                      </Link>
                      <Link
                        to={`/product/${product._id}`}
                        target="_blank"
                        className="text-gray-600 hover:underline"
                      >
                        Vezi
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-center">
          <Link
            to="/admin/products"
            className="text-red-600 hover:underline font-medium"
          >
            Vezi toate produsele →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold mb-3">Ghid rapid</h3>
          <ul className="space-y-2">
            <li>1. Adaugă mărci în secțiunea <strong>Mărci</strong></li>
            <li>2. Adaugă modele pentru fiecare marcă în <strong>Modele</strong></li>
            <li>3. Adaugă motoare pentru fiecare model în <strong>Motoare</strong></li>
            <li>4. Adaugă produse cu toate detaliile în <strong>Produse</strong></li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-bold mb-3">Statistici</h3>
          <p className="text-gray-600">
            Acest admin panel este în versiunea beta. Toate funcțiile de bază sunt disponibile.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Pentru suport sau întrebări, verifică documentația sau contactează echipa de dezvoltare.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;