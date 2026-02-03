import { Link } from 'react-router-dom';
import { getFirstImageUrl } from '../utils/imageUtils';

function ServiceCard({ service }) {
  // Obține URL-ul primei imagini
  const imageUrl = getFirstImageUrl(service.images);
  
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
            <span className="text-6xl">{service.serviceType?.icon || '⚙️'}</span>
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
          <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 h-14">
              {service.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {service.brand?.name}
              </span>
              <span className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                {service.serviceType?.name}
              </span>
            </div>
          </div>
          <span className="text-2xl">{service.serviceType?.icon}</span>
        </div>

        {/* COMPATIBILITATE */}
        {service.compatibleModels && service.compatibleModels.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Compatibil cu:</p>
            <div className="flex flex-wrap gap-2">
              {service.compatibleModels.slice(0, 3).map((model, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
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
        <div className="border-t pt-3 flex justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{service.duration || '2-3 zile'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🛡️</span>
            <span>{service.warranty || '12 luni'}</span>
          </div>
        </div>

        {/* BUTON DETALII */}
        <div className="mt-4">
          <button className="w-full bg-gray-100 hover:bg-red-50 text-red-600 font-medium py-2 rounded-lg transition-colors border border-transparent hover:border-red-200">
            Vezi detalii complete →
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ServiceCard;