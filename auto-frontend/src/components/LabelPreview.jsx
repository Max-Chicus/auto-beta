import React from 'react';

const LabelPreview = ({ data, onDownload, onPrint }) => {
  const {
    customer = {},
    trackingNumber = 'DER-12345678-001',
    serviceName = 'Reparație electronică auto'
  } = data;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <h3 className="text-lg font-bold">DERSTRONIK ELECTRONIC</h3>
        <p className="text-sm opacity-90">Service reparații electronice auto</p>
      </div>

      {/* Preview etichetă */}
      <div className="p-6 bg-gray-50">
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4 max-w-md mx-auto shadow-inner">
          {/* Destinatar */}
          <div className="mb-4">
            <div className="text-xs font-bold text-gray-500 mb-1">DESTINATAR:</div>
            <div className="bg-gray-100 p-3 rounded border border-gray-200">
              <p className="font-bold">Derstronik Electronic</p>
              <p className="text-sm">Șoseaua Balcani 53, Chișinău</p>
              <p className="text-sm">+373 69 857 294</p>
            </div>
          </div>

          {/* Expeditor */}
          <div className="mb-4">
            <div className="text-xs font-bold text-gray-500 mb-1">EXPEDITOR:</div>
            <div className="bg-gray-100 p-3 rounded border border-gray-200">
              <p className="font-bold">{customer.name || 'Nume client'}</p>
              <p className="text-sm">{customer.address || 'Adresă client'}</p>
              <p className="text-sm">Tel: {customer.phone || 'Telefon client'}</p>
              {customer.email && <p className="text-sm">Email: {customer.email}</p>}
            </div>
          </div>

          {/* Detalii expediere */}
          <div className="mb-4">
            <div className="text-xs font-bold text-gray-500 mb-1">DETALII EXPEDIERE:</div>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Serviciu:</span> {serviceName}</p>
              <p><span className="font-medium">Data:</span> {new Date().toLocaleDateString('ro-RO')}</p>
            </div>
          </div>

          {/* Număr urmărire */}
          <div className="bg-blue-600 text-white p-3 rounded text-center mb-4">
            <div className="text-xs opacity-90">NR. URMĂRIRE</div>
            <div className="font-bold text-lg tracking-wider">{trackingNumber}</div>
          </div>

          {/* Instrucțiuni */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>✓ Printează această etichetă și lipește-o pe colet</p>
            <p>✓ Asigură-te că piesa este bine protejată</p>
            <p>✓ Expediază coletul la adresa atelierului</p>
            <p>✓ Păstrează numărul de urmărire</p>
          </div>

          {/* Cod de bare simulat */}
          <div className="mt-4 flex justify-center">
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-${i % 2 === 0 ? '1.5' : '1'} h-8 bg-black`}
                  style={{ width: i % 2 === 0 ? '6px' : '4px' }}
                ></div>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">
            {trackingNumber}
          </div>
        </div>
      </div>

      {/* Butoane acțiune */}
      <div className="p-4 bg-gray-100 border-t flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onDownload}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
        >
          <span>📥</span>
          Descarcă PDF
        </button>
        <button
          onClick={onPrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
        >
          <span>🖨️</span>
          Printează
        </button>
      </div>
    </div>
  );
};

export default LabelPreview;