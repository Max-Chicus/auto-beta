import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/cartSlice";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl text-gray-700">
        Se încarcă detaliile produsului...
      </div>
    );
  }

  if (!product) return <div className="text-center mt-10 text-xl">Produsul nu există.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 h-auto object-contain"
        />
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-red-600 font-bold text-2xl">{product.price} MDL</p>
          <p className="mb-2"><strong>Categorie:</strong> {product.category?.name}</p>
          <p className="mb-2"><strong>Brand:</strong> {product.brand?.name}</p>
          <p className="mb-2"><strong>Model:</strong> {product.model?.name}</p>
          <p className="mb-2"><strong>Motor:</strong> {product.engine?.name}</p>
          <p className="mb-4"><strong>An:</strong> {product.year}</p>

          <button
            onClick={() => dispatch(addToCart(product))}
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Adaugă în coș
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;