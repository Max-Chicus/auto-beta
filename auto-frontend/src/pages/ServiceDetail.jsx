import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import { getFirstImageUrl, getAllImageUrls, getFullImageUrl } from '../utils/imageUtils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Helmet } from 'react-helmet-async';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

function ServiceDetail() {
  const { brandSlug, serviceSlug } = useParams(); const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    if (brandSlug && serviceSlug) {
      fetchServiceBySlug();
    }
  }, [brandSlug, serviceSlug]);

  const fetchServiceBySlug = async () => {
    try {
      const res = await API.get(`/services/slug/${brandSlug}/${serviceSlug}`);
      setService(res.data);

      // Încarcă servicii similare
      const relatedRes = await API.get('/services?limit=4');
      const filteredRelated = relatedRes.data.services
        ? relatedRes.data.services.filter(s => s._id !== res.data._id).slice(0, 3)
        : relatedRes.data.filter(s => s._id !== res.data._id).slice(0, 3);
      setRelatedServices(filteredRelated);
    } catch (err) {
      console.error('Eroare serviciu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru formatarea prețului reparației
  const formatRepairPrice = () => {
    if (!service) return '';
    if (service.repairPriceType === 'from') {
      return `de la ${service.repairPriceFrom} ${service.currency}`;
    } else {
      return `${service.repairPrice} ${service.currency}`;
    }
  };

  // Funcție pentru formatarea prețului reparației în cardurile de servicii similare
  const formatRelatedRepairPrice = (relatedService) => {
    if (relatedService.repairPriceType === 'from') {
      return `de la ${relatedService.repairPriceFrom} ${relatedService.currency}`;
    } else {
      return `${relatedService.repairPrice} ${relatedService.currency}`;
    }
  };

  const handleRequestService = () => {
    navigate('/request-service', {
      state: {
        serviceId: service._id,
        serviceName: service?.name
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă detaliile serviciului...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Serviciul nu a fost găsit</h2>
        <Link to="/services" className="mt-4 inline-block text-red-600 hover:text-red-800">
          ← Înapoi la servicii
        </Link>
      </div>
    );
  }

  const imageUrls = getAllImageUrls(service.images);
  const firstImageUrl = getFirstImageUrl(service.images);

  const brandName = service.brand?.name || 'Necunoscut';
  const brandLogo = service.brand?.logo;
  const serviceTypeName = service.serviceType?.name || 'Serviciu';
  const serviceTypeIcon = service.serviceType?.icon || '⚙️';

  return (
    <>
      <Helmet>
        <title>{service.name} | Derstronik - Service Auto {service.brand?.name}</title>
        <meta name="description" content={`Reparație ${service.name} pentru ${service.brand?.name}. Preț: ${formatRepairPrice()}. Diagnosticare gratuită, garanție 12 luni. Sună acum: +37369857294.`} />
        <link rel="canonical" href={`https://www.derstronik.md/servicii/${service.brandSlug}/${service.slug?.split('/').pop()}`} />
        {/* Breadcrumbs JSON-LD */}
        <script type="application/ld+json">
          {`{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Acasă",
              "item": "https://www.derstronik.md/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Servicii",
              "item": "https://www.derstronik.md/services"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "${service.name.replace(/"/g, '\\"')}",
              "item": "https://www.derstronik.md/servicii/${service.brandSlug}/${service.slug?.split('/').pop()}"
            }
          ]
          }`}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* BREADCRUMB */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-red-600">Acasă</Link>
          <span className="mx-2">›</span>
          <Link to="/services" className="hover:text-red-600">Servicii</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{service.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            {/* SERVICE HEADER CU IMAGINI - SWIPER */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-2xl">{serviceTypeIcon}</span>
                    <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                    {service.featured && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Recomandat
                      </span>
                    )}
                  </div>

                  {/* BRAND INFO CU LOGO */}
                  <div className="flex items-center gap-4 text-gray-600 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {brandLogo ? (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={getFullImageUrl(brandLogo)}
                            alt={brandName}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML =
                                `<span className="text-xs font-bold text-gray-600">${brandName.charAt(0)}</span>`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {brandName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span>{brandName}</span>
                    </div>

                    <span className="flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      {serviceTypeName}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      {service.duration}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-6">{service.description}</p>
                </div>
              </div>

              {/* SECȚIUNE IMAGINI CU SWIPER - ca la Hero */}
              {imageUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-xl font-bold mb-4">Imagini serviciu</h3>

                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl shadow-lg overflow-hidden">
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-red-100 rounded-full opacity-50 blur-sm"></div>
                    <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-blue-100 rounded-full opacity-50 blur-sm"></div>

                    <div className="relative">
                      <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{
                          delay: 4000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true,
                        }}
                        pagination={{
                          clickable: true,
                          dynamicBullets: true,
                        }}
                        navigation
                        loop={false}  // ← SCHIMBĂ DIN true ÎN false
                        className="service-detail-swiper rounded-xl overflow-hidden"
                      >
                        {imageUrls.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h3 className="text-xl font-bold mb-4">Imagini serviciu</h3>

                            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl shadow-lg overflow-hidden">
                              <div className="absolute -top-3 -left-3 w-12 h-12 bg-red-100 rounded-full opacity-50 blur-sm"></div>
                              <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-blue-100 rounded-full opacity-50 blur-sm"></div>

                              <div className="relative">
                                <Swiper
                                  modules={[Autoplay, Pagination, Navigation]}
                                  spaceBetween={0}
                                  slidesPerView={1}
                                  autoplay={{
                                    delay: 4000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                  }}
                                  pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                  }}
                                  navigation
                                  loop={false}
                                  key={imageUrls.join(',')}
                                  className="service-detail-swiper rounded-xl overflow-hidden"
                                >
                                  {imageUrls.map((url, index) => (
                                    <SwiperSlide key={index}>
                                      <div className="relative w-full">
                                        <div className="relative pt-[75%] bg-gray-100">
                                          <img
                                            key={`img-${index}-${url}`}
                                            src={url}
                                            alt={`${service.name} - Imagine ${index + 1}`}
                                            className="absolute top-0 left-0 w-full h-full object-contain bg-white"
                                            crossOrigin="anonymous"
                                            loading="eager"
                                            onError={(e) => {
                                              if (!e.target.dataset.retried) {
                                                e.target.dataset.retried = 'true';
                                                setTimeout(() => {
                                                  e.target.src = url;
                                                }, 100);
                                              } else {
                                                e.target.style.display = 'none';
                                                const placeholder = e.target.nextElementSibling;
                                                if (placeholder) placeholder.classList.remove('hidden');
                                              }
                                            }}
                                            onLoad={(e) => {
                                              const placeholder = e.target.nextElementSibling;
                                              if (placeholder) placeholder.classList.add('hidden');
                                            }}
                                          />
                                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 hidden">
                                            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm text-center px-4">Imagine indisponibilă</span>
                                          </div>
                                        </div>
                                        {imageUrls.length > 1 && (
                                          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
                                            {index + 1} / {imageUrls.length}
                                          </div>
                                        )}
                                      </div>
                                    </SwiperSlide>
                                  ))}
                                </Swiper>

                                {/* Thumbnail-uri sub slider */}
                                {imageUrls.length > 1 && (
                                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                                    {imageUrls.map((url, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          const swiper = document.querySelector('.service-detail-swiper')?.swiper;
                                          if (swiper) swiper.slideTo(index);
                                        }}
                                        className="relative pt-[100%] rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 border-transparent hover:border-red-400 bg-gray-100"
                                      >
                                        <img
                                          src={url}
                                          alt={`Thumbnail ${index + 1}`}
                                          className="absolute top-0 left-0 w-full h-full object-cover"
                                          crossOrigin="anonymous"
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            if (parent) {
                                              const placeholder = document.createElement('div');
                                              placeholder.className = 'absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100';
                                              placeholder.innerHTML = `
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      `;
                                              parent.appendChild(placeholder);
                                            }
                                          }}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Swiper>

                      {/* Thumbnail-uri sub slider */}
                      {imageUrls.length > 1 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                          {imageUrls.map((url, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                const swiper = document.querySelector('.service-detail-swiper')?.swiper;
                                if (swiper) swiper.slideTo(index);
                              }}
                              className="relative pt-[100%] rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 border-transparent hover:border-red-400 bg-gray-100"
                            >
                              <img
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  if (parent) {
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100';
                                    placeholder.innerHTML = `
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    `;
                                    parent.appendChild(placeholder);
                                  }
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stiluri personalizate pentru Swiper */}
            <style>{`
            .service-detail-swiper {
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
            }
            .service-detail-swiper .swiper-button-prev,
            .service-detail-swiper .swiper-button-next {
              background-color: rgba(0, 0, 0, 0.5);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              color: white;
              transition: all 0.3s ease;
            }
            .service-detail-swiper .swiper-button-prev:hover,
            .service-detail-swiper .swiper-button-next:hover {
              background-color: rgba(220, 38, 38, 0.8);
              transform: scale(1.1);
            }
            .service-detail-swiper .swiper-button-prev:after,
            .service-detail-swiper .swiper-button-next:after {
              font-size: 18px;
              font-weight: bold;
            }
            .service-detail-swiper .swiper-pagination-bullet {
              background: white;
              opacity: 0.7;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            .service-detail-swiper .swiper-pagination-bullet-active {
              background: #ef4444;
              opacity: 1;
              transform: scale(1.2);
            }
            .service-detail-swiper .swiper-pagination {
              bottom: 15px;
            }
          `}</style>

            {/* COMPATIBLE MODELS */}
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Modele compatibile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.compatibleModels?.map((model, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{model.modelName}</h3>
                        {model.modelCode && (
                          <p className="text-sm text-gray-600">Cod: {model.modelCode}</p>
                        )}
                        {model.generation && (
                          <p className="text-sm text-gray-600">Generație: {model.generation}</p>
                        )}
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {model.yearFrom}-{model.yearTo}
                      </span>
                    </div>

                    {model.engineCodes?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Motoare:</p>
                        <div className="flex flex-wrap gap-2">
                          {model.engineCodes.map((engine, eIdx) => (
                            <span key={eIdx} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {engine}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {model.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">Note: {model.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* COMMON FAULTS SI PRICE BOX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Defecțiuni frecvente */}
              {service.commonFaults && service.commonFaults.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                  <h2 className="text-xl font-bold mb-4">Defecțiuni frecvente</h2>
                  <ul className="space-y-3">
                    {service.commonFaults.map((fault, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{fault}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PRICE BOX */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border rounded-xl p-6 shadow-md">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-red-600">{formatRepairPrice()}</div>
                  <p className="text-sm text-gray-600">preț reparație</p>
                  <div className="mt-3 text-2xl font-bold text-blue-600">{service.testPrice} {service.currency}</div>
                  <p className="text-sm text-gray-600">preț testare</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Garanție:</span>
                    <span className="font-medium">{service.warranty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Durată:</span>
                    <span className="font-medium">{service.duration}</span>
                  </div>
                </div>

                <button
                  onClick={handleRequestService}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium transition"
                >
                  Solicită acest serviciu
                </button>
              </div>
            </div>

            {/* DIAGRAM IMAGE */}
            {service.diagramImage && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-4">Diagramă / Schematică</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <img
                    src={getFirstImageUrl([service.diagramImage])}
                    alt="Diagramă serviciu"
                    className="max-w-full h-auto mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg p-8 min-h-[200px]';
                        placeholder.innerHTML = `
                          <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span class="text-sm">Diagramă indisponibilă</span>
                        `;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR - rămâne la fel */}
          <div className="space-y-6">
            {/* RELATED SERVICES */}
            {relatedServices.length > 0 && (
              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-bold text-lg mb-4">Servicii similare</h3>
                <div className="space-y-4">
                  {relatedServices.map(related => {
                    const relatedBrandName = related.brand?.name || 'Necunoscut';
                    const relatedBrandLogo = related.brand?.logo;

                    return (
                      <Link
                        key={related._id}
                        to={`/servicii/${related.brandSlug}/${related.slug?.split('/').pop()}`}
                        className="block border rounded-lg p-4 hover:border-red-300 hover:bg-red-50 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {related.images && related.images.length > 0 ? (
                              <img
                                src={getFirstImageUrl(related.images)}
                                alt={related.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(related.name)}&background=random&size=64`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-lg">{related.serviceType?.icon || '⚙️'}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 line-clamp-2">{related.name}</h4>

                            <div className="flex items-center gap-2 mt-1">
                              {relatedBrandLogo ? (
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={getFullImageUrl(relatedBrandLogo)}
                                    alt={relatedBrandName}
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">
                                    {relatedBrandName.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm text-gray-600">{relatedBrandName}</span>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {related.serviceType?.name}
                              </span>
                              <span className="text-red-600 font-bold text-sm">
                                {formatRelatedRepairPrice(related)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SERVICE TIPS */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>💡</span> Informații utile
              </h3>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Diagnostic profesional cuplat la prețul reparației</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Transport în regim propriu (contra cost)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Piese originale sau echivalente de calitate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Asistență telefonică pentru diagnostic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Garanție inclusă în preț</span>
                </li>
              </ul>
            </div>

            {/* Buton EXPEDIERE PIESA */}
            <div className="mt-3">
              <button
                onClick={() => navigate('/shipping-label', {
                  state: {
                    serviceId: service._id,
                    serviceName: service.name
                  }
                })}
                className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-medium flex items-center justify-center gap-2"
              >
                <span>📦</span>
                Expediază piesa prin curier
              </button>
            </div>

            {/* CONTACT CTA */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Ai nevoie de ajutor?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Nu ești sigur dacă acest serviciu se potrivește pentru mașina ta?
              </p>
              <Link
                to="/request-service"
                className="block w-full bg-red-600 text-white text-center py-3 rounded-lg hover:bg-red-700 font-medium"
              >
                Contactează-ne
              </Link>
            </div>

            {/* SHARE BUTTONS */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3">Distribuie</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copiat în clipboard!');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium"
                >
                  📋 Copiază link
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent(`Vezi serviciul: ${service.name}`);
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  }}
                  className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 py-2 rounded-lg text-sm font-medium"
                >
                  📱 WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default ServiceDetail;