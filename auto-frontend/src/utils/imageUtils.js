// src/utils/imageUtils.js - VITE VERSION

// ✅ PENTRU VITE: folosește import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('📡 API Base URL:', API_BASE_URL); // Pentru debugging

/**
 * Returnează URL complet pentru o imagine
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // Dacă deja are protocol (http/https) sau e data URL
  if (imageUrl.startsWith('http://') || 
      imageUrl.startsWith('https://') || 
      imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Dacă e URL relativ (începe cu /)
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Altfel presupunem că e doar nume de fișier
  return `${API_BASE_URL}/uploads/${imageUrl}`;
};

/**
 * Returnează URL pentru prima imagine dintr-un array
 */
export const getFirstImageUrl = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }
  
  const firstImage = images[0];
  const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage.url;
  
  return getFullImageUrl(imageUrl);
};

/**
 * Returnează toate URL-urile complete dintr-un array de imagini
 */
export const getAllImageUrls = (images) => {
  if (!images || !Array.isArray(images)) {
    return [];
  }
  
  return images.map(img => {
    const imageUrl = typeof img === 'string' ? img : img.url;
    return getFullImageUrl(imageUrl);
  });
};

/**
 * Returnează URL pentru imaginea diagramă (dacă există)
 */
export const getDiagramImageUrl = (diagramImage) => {
  return getFullImageUrl(diagramImage);
};