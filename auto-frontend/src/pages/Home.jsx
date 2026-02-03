import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import ServiceFinder from '../components/ServiceFinder';

function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [popularBrands, setPopularBrands] = useState([]);
  const [stats, setStats] = useState({ services: 0, requests: 0, brands: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [servicesRes, filtersRes, statsRes] = await Promise.all([
        API.get('/services?featured=true&limit=6'),
        API.get('/filters'),
        API.get('/public/stats') // Adaugă acest endpoint
      ]);

      setFeaturedServices(servicesRes.data || []);
      setPopularBrands((filtersRes.data?.brands || []).slice(0, 8));

      // Folosește statisticile din endpoint
      setStats({
        services: statsRes.data?.totalServices || 0,
        requests: statsRes.data?.totalRequests || 0,
        brands: statsRes.data?.totalBrands || filtersRes.data?.brands?.length || 0
      });
    } catch (err) {
      console.error('Eroare date home:', err);

      // Fallback: calculează manual dacă endpoint-ul public/stats nu există
      setStats({
        services: servicesRes?.data?.length || 0,
        requests: 0,
        brands: filtersRes?.data?.brands?.length || 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-gray-900 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Auto service background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="lg:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Reparație profesională de unități auto electronice
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Specializați în reparația unităților de control (ECU), ABS, ESP, airbag,
              panouri de bord și alte sisteme electronice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/services"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold text-center"
              >
                Vezi toate serviciile
              </Link>
              <Link
                to="/request-service"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold text-center transition"
              >
                Solicită consultanță
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE FINDER */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <ServiceFinder onSearch={(data) => {
          const params = new URLSearchParams();
          if (data.brandId) params.append('brand', data.brandId);
          if (data.model) params.append('search', data.model);
          // Anul eliminat

          window.location.href = `/services?${params.toString()}`;
        }} />
      </div>

      {/* STATS SECTION */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{stats.services}</div>
              <div className="text-gray-600">Servicii specializate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{stats.requests}+</div>
              <div className="text-gray-600">Cereri procesate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600">{stats.brands}</div>
              <div className="text-gray-600">Mărci compatibile</div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED SERVICES */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicii recomandate</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cele mai solicitate servicii de reparație pentru sisteme electronice auto
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Se încarcă serviciile...</p>
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map(service => (
              <div key={service._id} className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-4">{service.serviceType?.icon || '⚙️'}</span>
                  <div>
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    <p className="text-gray-600 text-sm">{service.brand?.name}</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {service.description || 'Serviciu profesionist de reparație'}
                </p>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-red-600">
                      {service.repairPrice} {service.currency}
                    </span>
                    <p className="text-sm text-gray-500">Preț reparație</p>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-800">{service.duration}</div>
                    <p className="text-sm text-gray-500">Durată</p>
                  </div>
                </div>

                <Link
                  to={`/service/${service._id}`}
                  className="block w-full bg-red-600 text-white text-center py-3 rounded-lg hover:bg-red-700"
                >
                  Vezi detalii
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">Nu sunt servicii recomandate disponibile</p>
            <Link
              to="/services"
              className="inline-block mt-4 text-red-600 hover:text-red-800 font-medium"
            >
              Vezi toate serviciile →
            </Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-block border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Vezi toate serviciile →
          </Link>
        </div>
      </div>

      {/* POPULAR BRANDS */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mărci cu care lucrăm</h2>
            <p className="text-gray-600">
              Reparăm unități pentru toate mărcile auto populare
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularBrands.map(brand => (
              <div
                key={brand._id}
                className="bg-white border border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-red-400 hover:shadow-md transition"
              >
                <span className="font-medium text-gray-800">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ai nevoie de o reparație specializată?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Trimite-ne cererea ta și te vom contacta în cel mult 30 de minute
          </p>
          <Link
            to="/request-service"
            className="inline-block bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold"
          >
            Solicită serviciu
          </Link>
          <p className="mt-4 text-red-200">
            sau sună la <a href="tel:+37312345678" className="font-bold underline">+373 123 456 78</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;