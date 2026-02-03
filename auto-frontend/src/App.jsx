import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ServiceCatalog from './pages/ServiceCatalog';
import ServiceDetail from './pages/ServiceDetail';
import ServiceRequest from './pages/ServiceRequest';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminHome from './components/admin/AdminHome';
import AdminServices from './components/admin/AdminServices';
import AdminServiceRequests from './components/admin/AdminServiceRequests';
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
          <Route path="/services" element={<ServiceCatalog />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/request-service" element={<ServiceRequest />} />

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
          </Route>

        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
