import { useState, useRef } from 'react';
import { getFullImageUrl } from '../../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ImageUpload({ images = [], onImagesChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [localPreviews, setLocalPreviews] = useState([]); // 🔥 NOU: stochează preview-urile locale
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > maxImages) {
      alert(`Poți încărca maxim ${maxImages} imagini`);
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          alert(`Fișierul ${file.name} nu este o imagine`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`Imaginea ${file.name} este prea mare (max 5MB)`);
          continue;
        }

        // 🔥 CREEZĂ PREVIEW LOCAL IMEDIAT
        const localPreviewUrl = URL.createObjectURL(file);

        // Trimitem fișierul la backend
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_URL}/api/upload-image`, {
          method: 'POST',
          body: formData
        });

        if (!res.ok) {
          throw new Error('Upload eșuat');
        }

        const data = await res.json();

        // Adăugăm imaginea cu URL-ul real de la server
        const newImage = {
          url: data.url,
          name: data.name,
          size: data.size,
          localPreview: localPreviewUrl // 🔥 PĂSTRĂM PREVIEW-UL LOCAL
        };

        onImagesChange([...images, newImage]);

        // Adaugă și în localPreviews pentru a menține referința
        setLocalPreviews(prev => [...prev, localPreviewUrl]);
      }

    } catch (err) {
      console.error('Eroare upload:', err);
      alert('Eroare la încărcarea imaginilor: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    // Curăță URL-ul local pentru a evita memory leak
    if (images[index]?.localPreview) {
      URL.revokeObjectURL(images[index].localPreview);
    }
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Obține URL-ul pentru preview (folosește localPreview dacă există, altfel URL-ul complet)
  const getPreviewUrl = (img) => {
    // Dacă există localPreview (imagine proaspăt încărcată), folosește-l
    if (img.localPreview) {
      return img.localPreview;
    }
    // Altfel, folosește URL-ul complet din backend (pentru imaginile salvate)
    return getFullImageUrl(img.url);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*"
        className="hidden"
      />

      <div
        onClick={triggerFileInput}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition"
      >
        {uploading ? (
          <div>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Se încarcă...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📷</div>
            <p className="font-medium text-gray-700">Click pentru a încărca imagini</p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF (max 5MB) • Max {maxImages} imagini
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {images.length} / {maxImages} imagini încărcate
            </p>
          </>
        )}
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Imagini încărcate:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={getPreviewUrl(img)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default ImageUpload;