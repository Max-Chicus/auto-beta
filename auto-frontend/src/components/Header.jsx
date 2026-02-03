import { Link } from 'react-router-dom';
import { useState } from 'react';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminLoggedIn = () => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-red-600">DERS</span>
              <span className="text-2xl font-bold text-gray-900">TRONIK</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium">
              Acasă
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-red-600 font-medium">
              Servicii
            </Link>
            <Link to="/request-service" className="text-gray-700 hover:text-red-600 font-medium">
              Solicită serviciu
            </Link>
            
            {/* Admin Link (dacă e logat) */}
            {isAdminLoggedIn() && (
              <Link 
                to="/admin" 
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-red-600"
            >
              {mobileMenuOpen ? (
                <span className="text-2xl">✕</span>
              ) : (
                <span className="text-2xl">☰</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Acasă
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicii
              </Link>
              <Link 
                to="/request-service" 
                className="text-gray-700 hover:text-red-600 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solicită serviciu
              </Link>
              
              {isAdminLoggedIn() && (
                <Link 
                  to="/admin" 
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;