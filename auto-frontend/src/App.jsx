import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import ServiceCatalog from './pages/ServiceCatalog';
import ServiceDetail from './pages/ServiceDetail';
import ServiceRequest from './pages/ServiceRequest';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminHome from './components/admin/AdminHome';
import AdminServices from './components/admin/AdminServices';
import AdminServiceRequests from './components/admin/AdminServiceRequests';
import AdminGallery from './components/admin/AdminGallery';
import ShippingLabel from './pages/ShippingLabel';
import AdminShippingRequests from './components/admin/AdminShippingRequests';
import NotFound from './pages/NotFound';
import { HelmetProvider } from 'react-helmet-async';
import "./App.css"

function App() {
  const isAdminLoggedIn = () => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  };
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Header />
        <main className="min-h-screen p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<ServiceCatalog />} />
            <Route path="/servicii/:brandSlug/:serviceSlug" element={<ServiceDetail />} />
            <Route path="/service/:id" element={<Navigate to="/services" />} />
            <Route path="/request-service" element={<ServiceRequest />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/shipping-label" element={<ShippingLabel />} />
            <Route path="/shipping-label/:serviceId" element={<ShippingLabel />} />

            {/* RUTE ADMIN */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={isAdminLoggedIn() ? <AdminDashboard /> : <Navigate to="/admin/login" />
              }
            >
              <Route index element={<AdminHome />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="service-requests" element={<AdminServiceRequests />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="shipping-requests" element={<AdminShippingRequests />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </main>
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
