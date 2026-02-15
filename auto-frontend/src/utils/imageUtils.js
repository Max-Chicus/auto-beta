// src/utils/imageUtils.js - VITE VERSION

// ✅ PENTRU VITE: folosește import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('📡 API Base URL:', API_BASE_URL); // Pentru debugging

/**
 * Returnează URL complet pentru o imagine
 */
// src/utils/imageUtils.js
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return '';

  // Dacă e base64 (începe cu data:image)
  if (imageUrl.startsWith('data:image')) {
    return imageUrl;  // Returnează direct base64-ul
  }

  // Dacă deja are protocol
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Dacă e URL relativ
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/uploads/${imageUrl}`;
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