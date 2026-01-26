import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // backend-ul tău Node.js
});

// API.interceptors.request.use((config) => {
//   // Dacă e ruta admin, adaugă un token simplu
//   if (config.url.includes('/admin')) {
//     config.headers.Authorization = 'Bearer admin123';
//   }
//   return config;
// });

export default API;
