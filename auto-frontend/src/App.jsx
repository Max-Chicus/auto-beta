import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from "./pages/ProductDetail";
import Cart from './components/Cart';
import Checkout from './pages/Checkout';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminHome from './components/AdminHome';
import AdminProducts from './components/AdminProducts';
import AdminBrands from './components/AdminBrands';
import AdminCategories from './components/AdminCategories';
import "./App.css"

function App() {
  const isAdminLoggedIn = () => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  };
  return (
    <Router>
      <Header />
      <main className="min-h-screen p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              isAdminLoggedIn() ? <AdminDashboard /> : <Navigate to="/admin/login" />
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            {/* Adaugă și celelalte rute aici când creezi componentele */}
            <Route path="/admin/brands" element={<AdminBrands />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="models" element={<div>Models - Coming soon</div>} />
            <Route path="engines" element={<div>Engines - Coming soon</div>} />
            <Route path="categories" element={<div>Categories - Coming soon</div>} />
            <Route path="years" element={<div>Years - Coming soon</div>} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
