// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://api.mariobueno.info',
});

// Añadir token desde AsyncStorage a cada request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  console.log('[API] Token cargado:', token);  // <-- LOG AÑADIDO

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Manejo de errores
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('expirationDate');
      return Promise.reject({
        response: {
          data: {
            mensaje: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
          }
        }
      });
    }

    return Promise.reject({
      response: {
        data: {
          mensaje: error.response?.data?.mensaje || 'Error. Inténtalo de nuevo.'
        }
      }
    });
  }
);

export default api;
