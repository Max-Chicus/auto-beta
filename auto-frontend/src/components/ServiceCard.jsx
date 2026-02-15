import { Link } from 'react-router-dom';
import { getFirstImageUrl, getFullImageUrl } from '../utils/imageUtils'; // <- ADĂUGĂ getFullImageUrl

function ServiceCard({ service }) {
  // Obține URL-ul primei imagini
  const imageUrl = getFirstImageUrl(service.images);
  
  // Extrage datele
  const brandName = service.brand?.name || 'Necunoscut';
  const brandLogo = service.brand?.logo;
  const serviceTypeName = service.serviceType?.name || 'Serviciu';
  const serviceTypeIcon = service.serviceType?.icon || '⚙️';
  
  return (
    <Link
      to={`/service/${service._id}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-300 transition-all duration-300"
    >
      {/* IMAGINE SERVICIU */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random&size=256`;
              e.target.className = 'w-full h-full object-contain p-4';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{serviceTypeIcon}</span>
          </div>
        )}
        
        {/* BADGE RECOMANDAT */}
        {service.featured && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            🔥 Recomandat
          </div>
        )}
        
        {/* BADGE PREȚ */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-red-600 font-bold px-3 py-2 rounded-lg shadow">
          {service.repairPrice} {service.currency}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* LOGO BRAND + NUME SERVICIU */}
            <div className="flex items-center gap-3 mb-3">
              {/* LOGO BRAND - FOLOSEȘTE getFullImageUrl() */}
              {brandLogo ? (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={getFullImageUrl(brandLogo)}
                    alt={brandName}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      console.error('❌ Eroare logo:', brandLogo);
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = 
                        `<span class="text-sm font-bold text-gray-600">${brandName.charAt(0)}</span>`;
                    }}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">
                    {brandName.charAt(0)}
                  </span>
                </div>
              )}
              
              {/* NUME SERVICIU */}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {brandName}
                </p>
              </div>
            </div>

            {/* TIP SERVICIU */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full flex items-center gap-2">
                <span className="text-base">{serviceTypeIcon}</span>
                <span>{serviceTypeName}</span>
              </span>
            </div>
          </div>
          
          {/* ICON TIP SERVICIU (dreapta) */}
          <div className="flex-shrink-0 ml-2">
            <span className="text-3xl text-gray-300">{serviceTypeIcon}</span>
          </div>
        </div>

        {/* COMPATIBILITATE */}
        {service.compatibleModels && service.compatibleModels.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2 font-medium">Compatibil cu:</p>
            <div className="flex flex-wrap gap-2">
              {service.compatibleModels.slice(0, 3).map((model, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1.5 rounded"
                >
                  {model.modelName} ({model.yearFrom}-{model.yearTo})
                </span>
              ))}
              {service.compatibleModels.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{service.compatibleModels.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* DESCRIERE SCURTĂ */}
        {service.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {service.description}
          </p>
        )}

        {/* DETALII SERVICIU */}
        <div className="border-t border-gray-100 pt-3 flex justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">⏱️</span>
            <span>{service.duration || '2-3 zile'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🛡️</span>
            <span>{service.warranty || '12 luni'}</span>
          </div>
        </div>

        {/* BUTON DETALII */}
        <div className="mt-4">
          <button className="w-full bg-gray-50 hover:bg-red-50 text-red-600 font-medium py-2.5 rounded-lg transition-colors border border-gray-200 hover:border-red-200 hover:shadow-sm">
            Vezi detalii complete →
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ServiceCard;