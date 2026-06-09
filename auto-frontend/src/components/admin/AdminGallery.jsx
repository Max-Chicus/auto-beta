import { useState, useEffect } from 'react';
import API from '../../api/api';
import ImageUpload from './ImageUpload';
import { getFullImageUrl } from '../../utils/imageUtils';

function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/gallery');
      setImages(res.data);
    } catch (err) {
      console.error('❌ Eroare la încărcarea galeriei:', err);
      alert('Eroare la încărcarea imaginilor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (newImages) => {
    if (newImages.length === 0) return;

    setUploading(true);
    try {
      // Convertește URL-urile complete în căi relative
      const imagesToSave = newImages.map(img => {
        let cleanUrl = img.url;
        
        // Extrage doar calea /uploads/... din orice URL complet
        const match = cleanUrl.match(/\/uploads\/(.+)$/);
        if (match) {
          cleanUrl = `/uploads/${match[1]}`;
        }
        
        return {
          url: cleanUrl,
          alt: img.alt || 'Galerie imagine',
          order: 0
        };
      });

      const res = await API.post('/admin/gallery', { images: imagesToSave });
      
      // Păstrăm imaginile existente și adăugăm pe cele noi la început
      setImages(prevImages => [...res.data, ...prevImages]);
      
      setShowUploader(false);
      alert('✅ Imagini încărcate cu succes!');
    } catch (err) {
      console.error('❌ Eroare upload:', err);
      alert('Eroare la încărcarea imaginilor: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await API.put(`/admin/gallery/${id}`, updates);
      setImages(prev => prev.map(img => 
        img._id === id ? res.data.image : img
      ));
      setEditingImage(null);
      alert('✅ Imagine actualizată!');
    } catch (err) {
      console.error('❌ Eroare actualizare:', err);
      alert('Eroare la actualizare: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această imagine?')) return;
    
    try {
      await API.delete(`/admin/gallery/${id}`);
      setImages(prev => prev.filter(img => img._id !== id));
      alert('✅ Imagine ștearsă!');
    } catch (err) {
      console.error('❌ Eroare ștergere:', err);
      alert('Eroare la ștergere: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDragStart = (e, image) => {
    setDraggedItem(image);
    e.dataTransfer.setData('text/plain', image._id);
    e.target.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetImage) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem._id === targetImage._id) return;

    // Reordonare în UI
    const newImages = [...images];
    const draggedIndex = newImages.findIndex(img => img._id === draggedItem._id);
    const targetIndex = newImages.findIndex(img => img._id === targetImage._id);
    
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, removed);
    
    // Actualizăm ordinea în UI
    setImages(newImages);
    
    // Pregătim datele pentru backend
    const reorderData = newImages.map((img, index) => ({
      id: img._id,
      order: index
    }));
    
    try {
      await API.post('/admin/gallery/reorder', { images: reorderData });
      setDraggedItem(null);
    } catch (err) {
      console.error('❌ Eroare reordonare:', err);
      // Revenim la ordinea originală în caz de eroare
      fetchGallery();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Se încarcă galeria...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Galerie Imagini</h1>
          <p className="text-gray-600">
            {images.length} imagini în galerie
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className={`px-4 py-2 rounded-lg font-medium ${
              showUploader
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {showUploader ? 'Anulează' : '+ Adaugă imagini'}
          </button>
        </div>
      </div>

      {/* Uploader */}
      {showUploader && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Încarcă imagini noi</h2>
          <p className="text-sm text-gray-600 mb-4">
            Poți încărca mai multe imagini simultan.
          </p>
          <ImageUpload
            images={[]}
            onImagesChange={handleUpload}
            maxImages={20}
            multiple={true}
          />
          {uploading && (
            <div className="mt-4 text-center text-gray-600">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600 mr-2"></div>
              Se încarcă imaginile...
            </div>
          )}
        </div>
      )}

      {/* Grid imagini */}
      {images.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-gray-500 text-lg mb-4">Nu există imagini în galerie</p>
          <button
            onClick={() => setShowUploader(true)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            + Adaugă primele imagini
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            💡 Poți reordona imaginile prin drag & drop
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image._id}
                className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image)}
              >
                {/* Imagine */}
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={getFullImageUrl(image.url)}
                    alt={image.alt}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300?text=Error';
                    }}
                  />
                </div>

                {/* Badge pentru ordine */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  #{image.order}
                </div>

                {/* Overlay acțiuni */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingImage(image)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      title="Editează"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(image._id, image.url)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      title="Șterge"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Informații */}
                <div className="p-3 border-t">
                  <p className="text-sm font-medium truncate" title={image.alt}>
                    {image.alt}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(image.createdAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal editare */}
      {editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Editează imaginea</h3>
            
            <div className="mb-4">
              <img
                src={getFullImageUrl(editingImage.url)}
                alt={editingImage.alt}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text alternativ (alt)
              </label>
              <input
                type="text"
                value={editingImage.alt}
                onChange={(e) => setEditingImage({
                  ...editingImage,
                  alt: e.target.value
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                placeholder="Descriere imagine"
              />
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordine
              </label>
              <input
                type="number"
                value={editingImage.order}
                onChange={(e) => setEditingImage({
                  ...editingImage,
                  order: parseInt(e.target.value) || 0
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
                min="0"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                onClick={() => {
                  handleUpdate(editingImage._id, {
                    alt: editingImage.alt,
                    order: editingImage.order
                  });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGallery;