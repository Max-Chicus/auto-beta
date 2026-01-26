import { useNavigate } from "react-router-dom";

function ProductCard({ product, addToCart }) {
  const navigate = useNavigate();

  const goToDetail = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1">
      <img
        src={product.image}
        alt={product.name}
        className="h-48 w-full object-contain p-4 cursor-pointer"
        onClick={goToDetail} // click pe imagine
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg cursor-pointer" onClick={goToDetail}>
          {product.name}
        </h3>
        <p className="text-red-600 font-bold text-xl mt-2">{product.price} MDL</p>
        <button
          onClick={() => addToCart(product)}
          className="bg-red-600 text-white w-full mt-4 py-2 rounded hover:bg-red-700 transition"
        >
          Adaugă în coș
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
