import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import ServiceFinder from '../components/ServiceFinder';
import ServiceCard from '../components/ServiceCard';
import { getFullImageUrl } from '../utils/imageUtils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [newServices, setNewServices] = useState([]);
  const [popularBrands, setPopularBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [featuredRes, allServicesRes, filtersRes, statsRes] = await Promise.all([
        API.get('/services?featured=true&limit=6'),
        API.get('/services/newest?limit=6'),
        API.get('/filters'),
        API.get('/public/stats')
      ]);

      setFeaturedServices(featuredRes.data || []);  

      if (allServicesRes.data) {
        const sortedByNewest = [...allServicesRes.data]
          .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
          .slice(0, 6);
        setNewServices(sortedByNewest);
      }

      setPopularBrands((filtersRes.data?.brands || []).slice(0, 8));

    } finally {
      setLoading(false);
    }
  };

  // Slider data
  const heroSlides = [
    {
      id: 1,
      title: "Reparație profesională de unități auto electronice",
      description: "Specializați în reparația unităților de control (ECU), ABS, ESP, airbag, panouri de bord și alte sisteme electronice.",
      image: "./public/hero-1.webp"
    },
    {
      id: 2,
      title: "Garanție 100% pentru toate reparațiile",
      description: "Oferim garanție până la 24 luni pentru toate serviciile noastre. Calitatea și fiabilitatea sunt garantate!",
      image: "public/hero-2.webp"
    },
    {
      id: 3,
      title: "Diagnosticare precisă cu echipamente de ultimă generație",
      description: "Utilizăm sisteme de diagnosticare Bosch și Autel pentru identificarea precisă a problemelor electronice auto.",
      image: "public/hero-3.webp"
    }
  ];

  // Gama de servicii - Carduri pentru fiecare tip
  const serviceTypes = [
    {
      id: 1,
      title: "Panouri de bord",
      description: "Reparăm și reprogramăm toate tipurile de panouri de bord pentru afișare corectă a informațiilor vehiculului.",
      icon: "📊",
      image: "public/gama-1.webp",
      features: ["Afișare kilometraj", "Indicatori lumină", "Resetare erori", "Calibrare senzori"]
    },
    {
      id: 2,
      title: "Unități de control (ECU)",
      description: "Reparație specializată pentru toate tipurile de unități de control: motor, ABS/ESP, airbag, transmisie, pompe.",
      icon: "⚙️",
      image: "public/gama-2.webp",
      features: ["Reprogramare", "Diagnosticare erori", "Reparație componente", "Testare completă"]
    },
    {
      id: 3,
      title: "Sisteme de navigație",
      description: "Reparăm și actualizăm sisteme de navigație pentru toate mărcile și modelele de autovehicule.",
      icon: "📍",
      image: "public/gama-3.webp",
      features: ["Actualizare hărți", "Reparare ecran", "Conectivitate", "Compatibilitate"]
    },
    {
      id: 4,
      title: "Calculatoare de bord",
      description: "Servicii complete pentru calculatoare de bord: afișare, calcul, stocare date vehicul.",
      icon: "🧮",
      image: "public/gama-4.webp",
      features: ["Calcul consum", "Diagnosticare", "Reprogramare", "Testare"]
    },
    {
      id: 5,
      title: "Instrumente de afișare",
      description: "Reparăm toate instrumentele de afișare: tahometre, vitezometre, indicatoare nivel.",
      icon: "📈",
      image: "public/gama-5.webp",
      features: ["Calibrare", "Iluminare LED", "Afșare digitală", "Compatibilitate"]
    },
    {
      id: 6,
      title: "Sisteme de climatizare",
      description: "Reparație unități de control climatizare, afișaje temperatură și sisteme automate.",
      icon: "❄️",
      image: "public/gama-6.webp",
      features: ["Control temperatură", "Reprogramare", "Testare senzori", "Calibrare"]
    }
  ];

  return (
    <div>
      {/* HERO SECTION CU SWIPER */}
      <div className="relative bg-gradient-to-r from-gray-900 to-red-900 text-white overflow-hidden h-[600px] md:h-[700px]">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation
          loop={true}
          className="absolute inset-0 w-full h-full"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-30"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="lg:w-2/3 animate-fade-in-up">
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                          to="/services"
                          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold text-center transition duration-300 transform hover:scale-105"
                        >
                          Vezi toate serviciile
                        </Link>
                        <Link
                          to="/request-service"
                          className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold text-center transition duration-300"
                        >
                          Solicită consultanță
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* SERVICE FINDER */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <ServiceFinder onSearch={(data) => {
          const params = new URLSearchParams();
          if (data.brandId) params.append('brand', data.brandId);
          if (data.model) params.append('search', data.model);
          window.location.href = `/services?${params.toString()}`;
        }} />
      </div>

      {/* GAMA DE SERVICII - NOUA SECȚIUNE */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Gama largă de servicii</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              Specializăm în reparația tuturor sistemelor electronice auto. Gama noastră completă de servicii include:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceTypes.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                {/* Imagine serviciu */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-red-600 text-white p-3 rounded-full">
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                    {service.title}
                  </h3>
                </div>

                {/* Conținut card */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>

                  {/* Caracteristici */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-red-600 mr-2">✓</span>
                      Servicii incluse:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Buton detalii */}
                  <Link
                    to={`/services?search=${encodeURIComponent(service.title)}`}
                    className="block w-full text-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-3 rounded-lg font-medium transition-colors duration-300"
                  >
                    Vezi servicii specifice →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Text suplimentar */}
          <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Și multe altele...</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reparăm și alte instrumente electronice auto: sisteme de audio, camere de marsalier,
              unități de control pentru geamuri electrice, sisteme de imobilizare și multe altele.
            </p>
          </div>
        </div>
      </div>

      {/* SERVICII RECOMANDATE */}
      {/* <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
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
              <ServiceCard key={service._id} service={service} />
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
            className="inline-block border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
          >
            Vezi toate serviciile →
          </Link>
        </div>
      </div> */}

      {/* SERVICII NOI ADAUGATE */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicii noi adăugate</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cele mai recente servicii adăugate în catalogul nostru
            </p>
          </div>

          {newServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newServices.map(service => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">Momentan nu sunt servicii noi</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-block bg-red-600 text-white hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Descoperă toate serviciile →
            </Link>
          </div>
        </div>
      </div>

      {/* POPULAR BRANDS */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mărci cu care lucrăm</h2>
            <p className="text-gray-600">
              Reparăm unități pentru toate mărcile auto populare
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {popularBrands.map(brand => (
              <div
                key={brand._id}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center hover:border-red-400 hover:shadow-xl transition-all duration-300 hover:scale-105 min-h-[120px]"
              >
                {brand.logo ? (
                  <div className="h-16 w-full flex items-center justify-center mb-2">
                    <img
                      src={getFullImageUrl(brand.logo)}
                      alt={brand.name}
                      className="h-12 object-contain"
                      onError={(e) => {
                        console.error('❌ Eroare la încărcarea logo-ului:', brand.logo);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML =
                          `<span class="font-semibold text-gray-800 text-lg">${brand.name}</span>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-full flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-gray-600 text-xl">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                <span className="font-semibold text-gray-800 text-sm text-center">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ai nevoie de o reparație specializată?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Trimite-ne cererea ta și te vom contacta în cel mult 30 de minute
          </p>
          <Link
            to="/request-service"
            className="inline-block bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition duration-300 transform hover:scale-105"
          >
            Solicită serviciu
          </Link>
          <p className="mt-4 text-red-200">
            sau sună la <a href="tel:+37369857294" className="font-bold underline">+373 69 857 294</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;