import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de axios
const api = axios.create({
  baseURL: 'https://api.mariobueno.info',
  withCredentials: true,
});

// Interceptor de peticiones
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  console.log('[API] Token cargado:', token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API] Config request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
  });
  return config;
});

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const mensaje = error.response?.data?.mensaje;
    const url = error.config?.url;
    const esDelBackend = url?.startsWith('https://api.mariobueno.info');

    console.error('[API] Error en request:', {
      url,
      status,
      mensaje,
      method: error.config?.method,
      data: error.config?.data,
    });

    if (status === 401 && esDelBackend) {
      console.warn('[API] Sesión expirada. Borrando token.');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('spotifyToken');
      await AsyncStorage.removeItem('expirationDate');
      return Promise.reject({
        response: { data: { mensaje: 'Sesión expirada. Por favor, inicia sesión nuevamente.' } },
      });
    }

    return Promise.reject({
      response: {
        data: {
          mensaje: mensaje || 'Error inesperado. Verifica tu conexión e inténtalo de nuevo.',
        },
      },
    });
  }
);

export default api;
