import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import ServiceFinder from '../components/ServiceFinder';
import ServiceCard from '../components/ServiceCard';
import { getFullImageUrl } from '../utils/imageUtils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, FreeMode } from 'swiper/modules';
import { Helmet } from 'react-helmet-async';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

function Home() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [newServices, setNewServices] = useState([]);
  const [popularBrands, setPopularBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbServiceTypes, setDbServiceTypes] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    fetchHomeData();
    fetchServiceTypes();
    fetchGallery();
    fetchAnnouncement();
    const dismissed = localStorage.getItem('announcement_dismissed');
    if (dismissed === 'true') {
      setAnnouncementDismissed(true);
    }
  }, []);

  const fetchServiceTypes = async () => {
    try {
      const res = await API.get('/filters');
      setDbServiceTypes(res.data.serviceTypes || []);
    } catch (err) {
      console.error('❌ Eroare la încărcarea tipurilor de servicii:', err);
    }
  };

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

      setPopularBrands((filtersRes.data?.brands || []).slice(0, 1000));

    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await API.get('/public/gallery');
      if (res.data && res.data.length > 0) {
        setGalleryImages(res.data);
      } else {
        // Fallback la imagini statice dacă nu sunt încărcate
        setGalleryImages([
          { _id: 1, url: "/gallery-1.webp", alt: "Chei auto" },
          { _id: 2, url: "/gallery-2.webp", alt: "Sistem multimedia" },
          { _id: 3, url: "/gallery-3.webp", alt: "greseli panou auto" },
          { _id: 4, url: "/gallery-4.webp", alt: "Diagnoza" },
          { _id: 5, url: "/gallery-5.webp", alt: "Derstronik" },
          { _id: 6, url: "/gallery-6.webp", alt: "ABS" },
          { _id: 7, url: "/gallery-7.webp", alt: "Reparatii electronice" },
          { _id: 8, url: "/gallery-8.webp", alt: "Reparatii electronice" },
          { _id: 9, url: "/gallery-9.webp", alt: "Placa" },
          { _id: 10, url: "/gallery-10.webp", alt: "Placa" },
          { _id: 11, url: "/gallery-11.webp", alt: "Placa" },
          { _id: 12, url: "/gallery-12.webp", alt: "Reparatii electronice" },
          { _id: 13, url: "/gallery-13.webp", alt: "Panou de bord" },
          { _id: 14, url: "/gallery-14.webp", alt: "Derstronik" },
          { _id: 15, url: "/gallery-15.webp", alt: "airbag" },
        ]);
      }
    } catch (err) {
      console.error('❌ Eroare la încărcarea galeriei:', err);
      // Fallback la imagini statice
      setGalleryImages([
        { _id: 1, url: "/gallery-1.webp", alt: "Chei auto" },
        // ... restul imaginilor statice
      ]);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const res = await API.get('/public/announcement');
      if (res.data && res.data.isActive) {
        // Verifică dacă a expirat
        if (res.data.expiresAt && new Date(res.data.expiresAt) < new Date()) {
          return; // Anunț expirat
        }
        setAnnouncement(res.data);
      }
    } catch (err) {
      console.error('Eroare la încărcarea anunțului:', err);
    }
  };

  // Slider data
  const heroSlides = [
    {
      id: 1,
      title: "Reparație profesională de unități auto electronice",
      description: "Specializați în reparația unităților de control (ECU), ABS, ESP, airbag, panouri de bord și alte sisteme electronice.",
      image: "/hero-1.jpg"
    },
    {
      id: 2,
      title: "Reparație și recondiționare panouri de bord auto",
      description: "Diagnosticare și reparare profesională a panourilor de bord (instrument cluster): afișaj defect, pixeli lipsă, indicatoare eronate, iluminare slabă sau probleme de comunicare CAN.",
      image: "/hero-2.jpg"
    },
    {
      id: 3,
      title: "Reparație unități electronice cutii de viteze",
      description: "Diagnosticare și reparație profesională a modulelor TCU. Remediem erori de schimbare trepte, mod avarie și probleme de comunicare.",
      image: "/hero-3.jpg"
    },
    {
      id: 4,
      title: "Service specializat module ABS și ESP",
      description: "Reparăm module ABS și ESP pentru toate tipurile de vehicule. Eliminăm erori de frânare, probleme hidraulice și defecțiuni electronice, garantând siguranță și fiabilitate.",
      image: "/hero-4.jpg"
    },
    {
      id: 5,
      title: "Reparație plăci electronice auto",
      description: "Diagnosticăm și reparăm plăci electronice și circuite auto: reparații componente SMD, lipituri defecte, condensatori și alte probleme care afectează funcționarea sistemelor electronice.",
      image: "/hero-5.jpg"
    },
    {
      id: 6,
      title: "Reparație unități de comandă pentru vehicule comerciale",
      description: "PTM, EDC6, EDC7, ACM, MCM, Delphi ETC3, coordonator Scania COO7, EMS, Mercedes-Benz CPC3 / CPC4, sistem de frânare EBS (Wabco) precum și alte sisteme electronice.",
      image: "/hero-6.jpg"
    }
  ];

  // Gama de servicii - Carduri pentru fiecare tip
  const serviceTypes = [
    {
      id: 1,
      title: "Ceasuri, panou de bord",
      description: "Reparăm și reprogramăm toate tipurile de panouri de bord pentru afișare corectă a informațiilor vehiculului.",
      icon: "📊",
      image: "/gama-1.webp",
      features: [
        "Defecțiunea instrumentelor analogice",
        "Defecțiunea afișajelor digitale",
        "Defecțiune la iluminarea panoului de bord",
        "Defecțiune totală a panoului de bord",
        "Acele indicatoare rămân blocate sau vibrează"
      ]
    },
    {
      id: 2,
      title: "Chei auto și imobilizatoare",
      description: "Reprogramare chei originale, clonare transpondere, reparare unități imobilizator și service chei pentru toate mărcile auto.",
      icon: "🔑",
      image: "/gama-2.webp",
      features: ["Reprogramare chei", "Clonare transponder", "Reparație imobilizator", "Chei pierdute", "Programare unitate de control Immo"]
    },
    {
      id: 3,
      title: "Reparație Sisteme multimedia",
      description: "Reparație și actualizare pentru sisteme audio, display-uri centrale, navigație și unități head-unit pentru confort și divertisment.",
      icon: "📱",
      image: "/gama-3.webp",
      features: [
        "CD / DVD nu mai funcționează",
        "Ecran alb sau negru",
        "Navigația nu pornește sau se repornește mereu",
        "Navigația nu poate găsi locația",
        "Lipsă sunet sau imagine"
      ]
    },
    {
      id: 4,
      title: "Reparație unități de control Cutii de viteze automate",
      description: "Diagnosticare și reparație unități de control pentru transmisii automate (TCU), resetare adaptări și optimizare schimbare viteze.",
      icon: "⚡",
      image: "/gama-4.webp",
      features: [
        "Probleme de comunicare",
        "Lipsă semnal de viteză a treptelor",
        "Schimbarea treptelor imposibil",
        "Lipsă afișarea treptelor",
        "Activare mod avarie"
      ]
    },
    {
      id: 5,
      title: "Reparație unități de control Airbag",
      description: "Resetare și reparare unități de control airbag după accident, dezactivare erori și testare funcționalitate sisteme de siguranță.",
      icon: "🛡️",
      image: "/gama-5.webp",
      features: [
        "Resetare airbag după accidente",
        "Eliminare erori interne",
        "Ștergere erori",
        "Testarea sistemului",
        "Programarea/Înlocuirea unităților Airbag"
      ]
    },
    {
      id: 6,
      title: "Reparație pentru ABS / ESP",
      description: "Reparație unități de control pentru sisteme de frânare antiblocare și control stabilitate, calibrare senzori și reprogramare.",
      icon: "🛞",
      image: "/gama-6.webp",
      features: [
        "Sunt afișate erori ale senzorilor de roată",
        "Probleme/erori de comunicare",
        "Funcționare ABS neplauzibilă / incorectă",
        "Eroare la motorul pompei sau motorul pompei funcționează permanent",
        "Lipsă presiune de frânare la una dintre roți"
      ]
    },
    {
      id: 7,
      title: "Reparație unități de control electronice pentru vehicule comerciale",
      description: "Efectuăm reparații expres a unităților de control electronice (Motor, Cutie de viteză, sistem de frânare, unități electronice centrale, Ceasuri panouri de bord).",
      icon: "🚛",
      image: "/gama-7.webp",
      features: [
        "Procesare rapidă – vehiculele revin pe drum rapid",
        "Reducere până la 70% comparativ cu achiziția unei unități noi",
        "Diagnosticare avansată și reparație ECU",
        "Compatibilitate cu toate tipurile de vehicule comerciale"
      ]
    },
    {
      id: 8,
      title: "Reparația unităților electronice (ECU) motor",
      description: "Diagnosticăm și reparăm unitățile de control motor pentru funcționare optimă, programare și resoftare.",
      icon: "⚙️",
      image: "/gama-8.webp",
      features: [
        "Funcționare motor incorect",
        "Lipsă semnal injectoare/bobine",
        "Programare/optimizare/resoftare",
        "Alimentare senzori incorectă",
        "Lipsă comunicare cu unitatea de control"
      ]
    },
    {
      id: 9,
      title: "Reparație contacte de cheie, unitate blocare volan EZS/ELV",
      description: "Diagnosticăm și reparăm unitățile electronice de contact și blocare volan pentru sistemele de imobilizare și pornire.",
      icon: "🔑",
      image: "/gama-9.webp",
      features: [
        "Probleme/erori de comunicare",
        "Permisiune pornire motor blocată",
        "Date corupte",
        "Probleme mecanice",
        "Lipsă sincronizare (EZS/ELV)"
      ]
    },
    {
      id: 10,
      title: "Reparație selectoare de viteză",
      description: "Diagnosticăm și reparăm selectoarele electronice de viteză pentru transmisii automate și semiautomate.",
      icon: "🕹️",
      image: "/gama-10.webp",
      features: [
        "Lipsa comunicarea cu unitatea electronică",
        "Afișare falsă a vitezelor",
        "Probleme mecanice",
        "Blocarea manetei în poziția P"
      ]
    },
    {
      id: 11,
      title: "Reparație unitate centrală electronică (BDC, BSM, FEM, BSI)",
      description: "Diagnosticăm și reparăm unitățile centrale electronice care gestionează funcțiile caroseriei, iluminatul și sistemele de confort.",
      icon: "💻",
      image: "/gama-11.webp",
      features: [
        "Lumini interioare/exterioare nefuncționale",
        "Lipsă comunicare",
        "Unitatea prezintă erori eronate",
        "Date corupte sau pierdute",
        "Alte/diferite funcții nefuncționale"
      ]
    },
    {
      id: 12,
      title: "Programare Unități Electronice Motor (ECU)",
      description: "",
      icon: "🧠",
      image: "/gama-12.webp",
      features: [
        "Optimizare software (creștere putere)",
        "Activare / dezactivare sisteme ecologice",
        "Dezactivare imobilizator (IMMO OFF)",
        "Restabilire software original (reprogramare ECU)",
      ]
    }, {
      id: 13,
      title: "Reparații baterii Lithium-Ion",
      description: "Erori în panoul de bord sau modulul BMS",
      icon: "🔋",
      image: "/gama-13.webp",
      features: [
        "Sistemul 12V indică tensiune scăzută",
        "Baterie descărcată profund sau fără funcționare",
        "Descărcare profundă după utilizare necorespunzătoare sau accident",
      ]
    }, {
      id: 14,
      title: "Programare chei pentru camioane",
      description: "Programare chei, recuperare chei pierdute, service imobilizator (IMMO)",
      icon: "🔑",
      image: "/gama-14.webp",
      features: [
        "Programare chei noi pentru camioane",
        "Recuperare chei pierdute sau deteriorate",
        "Programare/dezactivare imobilizator (IMMO)",
        "Reparație unități imobilizator",
        "Diagnoză sistem imobilizator camion",
      ]
    }
  ];

  // Funcție pentru a găsi ID-ul corect din baza de date
  const getDbServiceTypeId = (serviceTitle) => {
    const match = dbServiceTypes.find(
      db => db.name.toLowerCase().trim() === serviceTitle.toLowerCase().trim()
    );
    return match?._id || null;
  };

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    localStorage.setItem('announcement_dismissed', 'true');
    // Opțional: setează un timeout pentru re-apariție (ex: 24h)
    setTimeout(() => {
      localStorage.removeItem('announcement_dismissed');
    }, 24 * 60 * 60 * 1000);
  };

  const getAnnouncementStyle = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'danger':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-300 text-green-800';
      case 'vacation':
        return 'bg-purple-50 border-purple-300 text-purple-800';
      default:
        return 'bg-blue-50 border-blue-300 text-blue-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Derstronik | Service Electronică Auto - Reparații ECU, ABS, Airbag Chișinău</title>
        <meta name="description" content="Service specializat în reparația unităților electronice auto: ECU, ABS, ESP, Airbag, panouri de bord, programare chei auto și camioane în Chișinău. Garanție 12 luni." />
        <link rel="canonical" href="https://www.derstronik.md/" />
      </Helmet>
      <div>
        {/* ANUNȚ IMPORTANT - apare doar dacă există și nu a fost închis */}
        {announcement && announcement.isActive && !announcementDismissed && (
          <div className={`relative overflow-hidden ${getAnnouncementStyle(announcement.type)} border-l-8`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl flex-shrink-0">
                    {announcement.type === 'vacation' && '🏖️'}
                    {announcement.type === 'warning' && '⚠️'}
                    {announcement.type === 'danger' && '🔴'}
                    {announcement.type === 'success' && '✅'}
                    {announcement.type === 'info' && 'ℹ️'}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">{announcement.title}</h3>
                    <p className="text-sm opacity-90">{announcement.message}</p>
                    {announcement.expiresAt && (
                      <p className="text-xs mt-1 opacity-75">
                        Valabil până la: {new Date(announcement.expiresAt).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={dismissAnnouncement}
                  className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Închide anunțul"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bară de progres animată (opțională) */}
            <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 animate-progress"></div>
          </div>
        )}
        {/* HERO SECTION CU SWIPER */}
        <div className="relative bg-gradient-to-r from-gray-900 to-red-900 text-white overflow-hidden h-[600px] md:h-[600px]">
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
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="lg:w-2/3 animate-fade-in-up bg-black/50 p-8 rounded-lg">
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
          <ServiceFinder
            onSearch={(data) => {
              const params = new URLSearchParams();
              if (data.brandId) params.append('brand', data.brandId);
              if (data.model) params.append('model', data.model);
              window.location.href = `/services?${params.toString()}`;
            }}
            dbServiceTypes={dbServiceTypes}
          />
        </div>

        {/* GAMA DE SERVICII - NOUA SECȚIUNE */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Gama largă de servicii</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceTypes.map((service) => {
                const dbId = getDbServiceTypeId(service.title);
                // Generează slug-ul pentru link
                const slug = service.title
                  .toLowerCase()
                  .replace(/[șȘ]/g, 's')
                  .replace(/[țȚ]/g, 't')
                  .replace(/[ăĂ]/g, 'a')
                  .replace(/[îÎ]/g, 'i')
                  .replace(/[âÂ]/g, 'a')
                  .replace(/\s+/g, '-')
                  .replace(/[^\w\-]+/g, '');
                return (
                  <Link
                    key={service.id}
                    to={`/service-type/${slug}`}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group block"
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
                      {/* Overlay cu gradient albastru la hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 group-hover:to-blue-400/20 transition-all duration-500"></div>
                      <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white drop-shadow-lg">
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
                          Acțiuni cheie:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full transition-colors duration-300 group-hover:bg-blue-100"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Card decorativ CTA */}
              <Link
                to="/services"
                className="relative h-full rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex items-center justify-center group bg-cover bg-center"
                style={{ backgroundImage: "url('/gama-all.webp')" }}
              >
                {/* Overlay pentru contrast text */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-gradient-to-r group-hover:from-black/30 group-hover:to-blue-500/20 transition-all duration-300"></div>

                {/* Conținut text centrat */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
                  <h3 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg mb-2">
                    Vezi toate serviciile noastre
                  </h3>
                  <span className="inline-block mt-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-full text-sm md:text-base drop-shadow-lg transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:via-blue-400 group-hover:to-red-700 cursor-pointer">
                    Accesează catalogul →
                  </span>
                </div>
              </Link>

            </div>
          </div>
        </div>

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

        {/* GALERIE HI-TECH */}
        <div className="py-16 relative overflow-hidden">
          {/* Background hi-tech gradient + pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/10 to-blue-50/30 z-0"></div>
          <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="techGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 0L40 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#techGrid)" />
            </svg>
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Galerie service</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Imagini din activitatea noastră zilnică
              </p>
            </div>

            <div className="relative">
              <Swiper
                modules={[Autoplay, Pagination, Navigation, FreeMode]}
                spaceBetween={20}
                slidesPerView={2}
                freeMode={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={{
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                }}
                loop={true}
                breakpoints={{
                  640: { slidesPerView: 3, spaceBetween: 20 },
                  768: { slidesPerView: 4, spaceBetween: 25 },
                  1024: { slidesPerView: 5, spaceBetween: 30 },
                  1280: { slidesPerView: 6, spaceBetween: 30 },
                }}
                className="gallery-swiper"
              >
                {galleryImages.map((image) => (
                  <SwiperSlide key={image._id}>
                    <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={getFullImageUrl(image.url)}
                          alt={image.alt}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                          }}
                        />
                      </div>

                      {/* Overlay glow albastru */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Text slide cu glow */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-sm font-medium truncate drop-shadow-[0_0_10px_#3b82f6]">{image.alt}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Navigare personalizată */}
              <div className="swiper-button-prev !text-white !bg-blue-500/30 !w-10 !h-10 rounded-full shadow-lg hover:!bg-blue-500 hover:!text-white transition-all duration-300 after:!text-lg"></div>
              <div className="swiper-button-next !text-white !bg-blue-500/30 !w-10 !h-10 rounded-full shadow-lg hover:!bg-blue-500 hover:!text-white transition-all duration-300 after:!text-lg"></div>

              {/* Paginație personalizată */}
              <style>{`
        .gallery-swiper .swiper-pagination-bullet {
          background: #3b82f6 !important;
          opacity: 0.5;
        }
        .gallery-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          background: #3b82f6 !important;
        }
      `}</style>
            </div>
          </div>
        </div>

        {/* SECȚIUNE NOUĂ - EXPEDIERE PIESĂ */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Partea stângă - Text și beneficii */}
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                  📦 - SERVICE LA DISTANȚĂ
                </div>

                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Expediază piesa și o reparam la distanță
                </h2>

                <p className="text-lg text-gray-600">
                  Nu mai ești limitat la Chișinău! Acum poți trimite piesa prin curier
                  de oriunde din țară și noi o reparam profesional.
                </p>

                {/* Listă beneficii */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Completează formularul</h3>
                      <p className="text-gray-600">Spune-ne ce piesă ai și completează datele tale</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Printează eticheta</h3>
                      <p className="text-gray-600">Generezi PDF-ul cu etichetă și instrucțiuni</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Expediază coletul</h3>
                      <p className="text-gray-600">Lipești eticheta și trimiți piesa prin curier la atelier</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link
                    to="/shipping-label"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    <span className="text-2xl">📦</span>
                    <span>Generează eticheta de expediere</span>
                    <span className="text-xl">→</span>
                  </Link>
                  <p className="text-sm text-gray-500 mt-3">
                    * Funcționează cu orice serviciu de curierat (DHL, FanCurier, Cargus etc.)
                  </p>
                </div>
              </div>

              {/* Partea dreaptă - Imagine/Illustration */}
              <div className="relative">
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl overflow-hidden">
                  {/* Elemente decorative */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mt-10 -mr-10"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -mb-10 -ml-10"></div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-6">Ce primești în PDF:</h3>

                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                        <div className="font-semibold">📋 Etichetă cu adresa atelierului</div>
                        <div className="text-sm opacity-90">Șoseaua Balcani 53, Chișinău</div>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                        <div className="font-semibold">🏷️ Etichetă cu adresa ta de return</div>
                        <div className="text-sm opacity-90">completată automat din formular</div>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                        <div className="font-semibold">🔢 Număr unic de urmărire</div>
                        <div className="text-sm opacity-90">DER-12345678-001 - pentru tracking</div>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                        <div className="font-semibold">📝 Instrucțiuni clare</div>
                        <div className="text-sm opacity-90">Cum să împachetezi și să expediazi</div>
                      </div>
                    </div>

                    {/* Mockup PDF preview */}
                    <div className="mt-6 bg-white rounded-lg p-3 shadow-inner">
                      <div className="flex items-center gap-3 border-b pb-2 mb-2">
                        <span className="text-red-600 text-xl">📄</span>
                        <span className="font-mono text-sm">eticheta-expediere-DER-12345678-001.pdf</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Dimensiune: 245 KB</span>
                        <span className="text-blue-600">⬇️ Previzualizare</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badge curier parteneri */}
                <div className="absolute -bottom-7 -right-4 bg-white rounded-full shadow-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚚</span>
                    <span className="font-bold text-sm">DHL • FanCurier • Cargus • NovaPost • Poșta Moldovei</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card cu statistici */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600">Piese returnate clienților</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-2xl font-bold text-gray-900">24-48h</div>
                <div className="text-gray-600">Diagnosticare rapidă</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="text-2xl font-bold text-gray-900">12 luni</div>
                <div className="text-gray-600">Garanție la reparații</div>
              </div>
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

        {/* CTA SECTION - VERSION WITH CLEAR BACKGROUND */}
        <div className="relative py-20 overflow-hidden text-white">
          {/* Background image - full visibility */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: "url('cta-bg.webp')",
              filter: "brightness(0.7)" // doar puțin întuneric pentru lizibilitatea textului
            }}
          ></div>

          {/* Simple dark overlay - foarte subtil pentru text */}
          <div className="absolute inset-0 bg-black/30 z-10"></div>

          {/* Content */}
          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
              Ai nevoie de o reparație specializată?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-md">
              Trimite-ne cererea ta și te vom contacta
            </p>
            <Link
              to="/request-service"
              className="inline-block bg-white text-red-600 hover:bg-gray-100 px-10 py-4 rounded-xl text-lg font-semibold transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Solicită serviciu
            </Link>
            <p className="mt-4 text-white text-sm md:text-base drop-shadow">
              sau sună la <a href="tel:+37369857294" className="font-bold underline">+373 69 857 294</a>
            </p>
          </div>
        </div>
      </div>

    </>
  );
}

export default Home;