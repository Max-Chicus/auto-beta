import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../store/cartSlice';
import { Link } from 'react-router-dom';

function Cart() {
  const { cartItems, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  if (cartItems.length === 0) {
    return <p>Coșul este gol. <Link to="/catalog" className="text-blue-500">Adaugă produse</Link></p>;
  }

  return (
    <div className="space-y-4">
      {cartItems.map(item => (
        <div key={item._id} className="flex justify-between items-center border p-2 rounded">
          <div>
            {item.name} x {item.quantity} - <span className="font-bold">{item.price * item.quantity} MDL</span>
          </div>
          <button onClick={() => dispatch(removeFromCart(item._id))} className="text-red-600 hover:underline">Șterge</button>
        </div>
      ))}
      <p className="font-bold">Total: {total} MDL</p>
      <div className="space-x-2">
        <Link to="/checkout" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Finalizează comanda</Link>
        <button onClick={() => dispatch(clearCart())} className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">Golește coș</button>
      </div>
    </div>
  );
}

export default Cart;
