import { Link, useNavigate } from 'react-router-dom';
import { getFirstImageUrl, getFullImageUrl } from '../utils/imageUtils';

function ServiceCard({ service }) {
  const navigate = useNavigate();

  // Obține URL-ul primei imagini
  const imageUrl = getFirstImageUrl(service.images);

  // Extrage datele
  const brandName = service.brand?.name || 'Necunoscut';
  const brandLogo = service.brand?.logo;
  const serviceTypeName = service.serviceType?.name || 'Serviciu';
  const serviceTypeIcon = service.serviceType?.icon || '⚙️';

  // Funcție pentru formatarea prețului reparației
  const formatRepairPrice = () => {
    if (service.repairPriceType === 'from') {
      return `de la ${service.repairPriceFrom} ${service.currency}`;
    } else {
      return `${service.repairPrice} ${service.currency}`;
    }
  };

  // Funcție pentru navigare la shipping cu datele serviciului
  const handleShippingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/shipping-label', {
      state: {
        serviceId: service._id,
        serviceName: service.name
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-300 transition-all duration-300">
      {/* IMAGINE SERVICIU - click duce la detalii */}
      <Link to={`/service/${service._id}`} className="block">
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
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg shadow p-2">
            <div className="text-right">
              <div className="text-xs text-gray-500">Reparație:</div>
              <div className="font-bold text-red-600 text-sm">
                {formatRepairPrice()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Testare:</div>
              <div className="font-bold text-blue-600 text-sm">
                {service.testPrice} {service.currency}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {/* LOGO BRAND + NUME SERVICIU */}
            <div className="flex items-center gap-3 mb-3">
              {/* LOGO BRAND */}
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
                <Link to={`/service/${service._id}`}>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1 hover:text-red-600 transition-colors">
                    {service.name}
                  </h3>
                </Link>
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
          <div className="mb-4 relative group">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span>📝 Descriere:</span>
              <span className="text-[10px] bg-gray-100 px-1.5 rounded-full">
                {service.description.length > 50 ? 'detalii' : ''}
              </span>
            </p>
            <p className="text-sm text-gray-700 truncate">
              {service.description}
            </p>
            {service.description.length > 50 && (
              <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 min-w-[250px] max-w-[300px]">
                <div className="font-medium mb-1 text-gray-300">Descriere completă:</div>
                <p className="text-gray-200 leading-relaxed">{service.description}</p>
              </div>
            )}
          </div>
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

        {/* BUTOANE ACȚIUNE - VERSIUNE CU 2 BUTOANE FRUMOASE */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link
            to={`/service/${service._id}`}
            className="bg-gray-50 hover:bg-red-50 text-red-600 font-medium py-2.5 px-3 rounded-lg transition-colors border border-gray-200 hover:border-red-200 hover:shadow-sm text-sm text-center"
          >
            Vezi detalii
          </Link>

          <button
            onClick={handleShippingClick}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2.5 px-3 rounded-lg transition-colors border border-blue-200 hover:border-blue-300 hover:shadow-sm text-sm flex items-center justify-center gap-1"
          >
            <span>📦</span>
            <span>Expediază</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;