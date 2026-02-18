import { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ImageUpload({ images = [], onImagesChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
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

        if (file.size > 5 * 1024 * 1024) { // 5MB max
          alert(`Imaginea ${file.name} este prea mare (max 5MB)`);
          continue;
        }

        // 🔥 NOU: Trimitem fișierul la backend
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

        // Adăugăm imaginea primită de la server
        onImagesChange([...images, {
          url: data.url,  // URL de la Vercel Blob
          name: data.name,
          size: data.size
        }]);
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
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
                  src={img.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
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