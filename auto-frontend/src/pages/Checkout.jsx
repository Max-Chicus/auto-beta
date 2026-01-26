import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const { cartItems, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.phone || cartItems.length === 0) {
      setMessage('Completați toate câmpurile și adăugați produse în coș.');
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        name: form.name,
        phone: form.phone,
        address: form.address || '',
        total: total,
        products: cartItems.map(item => ({
          productId: item._id,
          quantity: item.quantity || 1,
          price: item.price
        }))
      };

      const res = await API.post('/orders', orderData);
      if (res.data) {
        dispatch(clearCart());
        setMessage('Comanda a fost plasată cu succes!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage('Eroare la plasarea comenzii.');
      }
    } catch (err) {
      console.error('Eroare checkout:', err);
      setMessage('Eroare la conectarea cu serverul.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-4 text-center">Checkout</h2>
      {message && <p className={`mb-4 ${message.includes('succes') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nume complet"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <input
          name="phone"
          placeholder="Telefon"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <input
          name="address"
          placeholder="Adresă (opțional)"
          value={form.address}
          onChange={handleChange}
          className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          className="bg-green-600 text-white w-full py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Se trimite...' : 'Trimite comanda'}
        </button>
      </form>
      <div className="mt-6 border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">Produse în coș</h3>
        {cartItems.map(item => (
          <div key={item._id} className="flex justify-between py-2 border-b">
            <span>{item.name} x {item.quantity || 1}</span>
            <span>{item.price * (item.quantity || 1)} MDL</span>
          </div>
        ))}
        <p className="font-bold text-lg mt-2">Total: {total} MDL</p>
      </div>
    </div>
  );
}

export default Checkout;