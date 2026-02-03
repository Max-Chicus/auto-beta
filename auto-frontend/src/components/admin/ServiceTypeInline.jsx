import { useState } from 'react';
import { createServiceTypeInline } from '../../api/api';

function ServiceTypeInline({ onServiceTypeAdded, existingTypes = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [newType, setNewType] = useState({
    name: '',
    icon: '⚙️',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const iconOptions = [
    '⚙️', '🔄', '📊', '🛡️', '🔧', '❄️', '🚗', '📱', '🔋', '💡',
    '⚡', '🔩', '🛠️', '🚨', '🔍', '💎', '🎯', '⭐', '🏆', '✅'
  ];

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    
    if (!newType.name.trim()) {
      alert('Numele tipului de serviciu este obligatoriu');
      return;
    }

    setLoading(true);
    try {
      const res = await createServiceTypeInline(newType);
      
      // Notifică parent component
      if (onServiceTypeAdded) {
        onServiceTypeAdded(res.data.serviceType);
      }
      
      // Reset form și închide
      setNewType({ name: '', icon: '⚙️', description: '' });
      setShowForm(false);
      
      alert('✅ Tip serviciu adăugat cu succes! Acum poți selecta din lista de mai sus.');
      
    } catch (err) {
      console.error('Eroare:', err);
      alert(err.response?.data?.error || 'Eroare la adăugare');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
      >
        <span className="mr-1">+</span> Adaugă tip nou de serviciu
      </button>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 mt-2 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Adaugă tip serviciu nou</h4>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setNewType({ name: '', icon: '⚙️', description: '' });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕ Închide
        </button>
      </div>

      {/* Înlocuiește <form> cu <div> */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Iconiță</label>
            <select
              value={newType.icon}
              onChange={(e) => setNewType({...newType, icon: e.target.value})}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {iconOptions.map((icon, idx) => (
                <option key={idx} value={icon}>
                  {icon} Icon {idx + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Nume *</label>
            <input
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({...newType, name: e.target.value})}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Ex: Reparație ABS/ESP"
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Descriere (opțional)</label>
          <textarea
            value={newType.description}
            onChange={(e) => setNewType({...newType, description: e.target.value})}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            rows="2"
            placeholder="Descriere scurtă..."
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setNewType({ name: '', icon: '⚙️', description: '' });
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Șterge formular
          </button>
          
          <div className="flex space-x-2">
            <button
              type="button" // Schimbă din type="submit" în type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Se salvează...' : 'Salvează tip'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewType({ name: '', icon: '⚙️', description: '' });
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Închide
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          💡 După salvare, tipul va apărea în lista de mai sus. Poți selecta-l și continua completarea serviciului.
        </div>
      </div>
    </div>
  );
}

export default ServiceTypeInline;