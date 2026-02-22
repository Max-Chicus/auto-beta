import { Link } from 'react-router-dom';
import { useState } from 'react';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminLoggedIn = () => {
    return localStorage.getItem('adminLoggedIn') === 'true';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              {/* Icon container */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/10 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm">
                  <img
                    src="/header-logo.svg"
                    alt="Derstronik Logo"
                    className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Text */}
              <div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    DERSTRONIK
                  </span>
                  <span className="text-xs font-medium text-gray-500 -mt-1">
                    Professional Auto Electronics
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className="px-5 py-2.5 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
            >
              <span>Acasă</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-3/4 transition-all duration-300"></span>
            </Link>

            <Link
              to="/about"
              className="px-5 py-2.5 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
            >
              <span>Despre noi</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-3/4 transition-all duration-300"></span>
            </Link>

            <Link
              to="/services"
              className="px-5 py-2.5 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
            >
              <span>Servicii</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-3/4 transition-all duration-300"></span>
            </Link>

            <a
              href="#footer"
              className="px-5 py-2.5 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 relative group"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Contact</span>
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-red-600 group-hover:w-3/4 transition-all duration-300"></span>
            </a>

            <Link
              to="/request-service"
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Solicită serviciu
            </Link>

            {/* Numar de telefon */}
            <a
              href="tel:+37369857294"
              className="ml-4 px-4 py-2 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 flex items-center gap-2"
            >
              📞 +373 69 857 294
            </a>

            {/* Admin Link (dacă e logat) */}
            {isAdminLoggedIn() && (
              <Link
                to="/admin"
                className="ml-2 px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 shadow hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <span>⚙️</span>
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2">
              <Link
                to="/"
                className="px-4 py-3 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Acasă
              </Link>
              <Link
                to="/about"
                className="px-4 py-3 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Despre noi
              </Link>
              <Link
                to="/services"
                className="px-4 py-3 text-gray-700 hover:text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Servicii
              </Link>
              <Link
                to="/request-service"
                className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solicită serviciu
              </Link>

              {isAdminLoggedIn() && (
                <Link
                  to="/admin"
                  className="px-4 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors mt-2 flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>⚙️</span>
                  <span>Admin Panel</span>
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