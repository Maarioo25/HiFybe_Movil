import api from './api';

// Servicio de usuarios
export const userService = {
  // Obtiene todos los usuarios
  getAllUsers: async () => {
    const res = await api.get('/usuarios');
    return res.data;
  },

  // Obtiene un usuario por su ID
  getUserById: id =>
    api.get(`/usuarios/${id}`)
      .then(r => r.data.usuario ?? r.data),

  // Actualiza el perfil de un usuario
  updateProfile: (id, data) =>
    api.put(`/usuarios/${id}`, {
      nombre: data.nombre,
      apellidos: data.apellidos,
      biografia: data.biografia,
      foto_perfil: data.foto_perfil
    }).then(r => r.data.usuario ?? r.data),

  // Elimina un usuario
  deleteUser: id =>
    api.delete(`/usuarios/${id}`)
      .then(r => r.data),

  // Inicia sesión
  login: (email, password) =>
    api.post('/usuarios/login', { email, password })
      .then(r => r.data.usuario ?? r.data),

  // Registra un nuevo usuario
  register: data =>
    api.post('/usuarios/register', data)
      .then(r => r.data.usuario ?? r.data),

  // Obtiene el usuario actual
  getCurrentUser: () =>
    api.get('/usuarios/me')
      .then(r => r.data.usuario ?? r.data),

  // Cierra sesión
  logout: () =>
    api.post('/usuarios/logout')
      .then(r => r.data),

  // Establece la canción del usuario
  setCancionUsuario: (userId, trackId) =>
    api.put(`/usuarios/${userId}/cancion`, { trackId })
      .then(r => r.data.usuario ?? r.data)
      .catch(() => null),

  // Obtiene la canción del usuario
  getCancionUsuario: async (userId) => {
    try {
      const res = await api.get(`/usuarios/${userId}/cancion`);
      return res.data;
    } catch (err) {
      console.error("Error en getCancionUsuario:", err);
      return null;
    }
  },
      

  // Oculta la ubicación del usuario
  ocultarUbicacion: () =>
    api.post('/usuarios/ocultar-ubicacion')
      .then(r => r.data.usuario ?? r.data),

  // Actualiza la ubicación del usuario
  actualizarUbicacion: (lat, lng) =>
    api.post('/usuarios/ubicacion', { latitude: lat, longitude: lng })
      .then(r => r.data.usuario ?? r.data),

  // Actualiza las redes sociales del usuario
  updateRedesSociales: (id, redes) =>
    api.put(`/usuarios/${id}/redes`, redes)
      .then(r => r.data.usuario ?? r.data),

  // Actualiza la foto del perfil del usuario
  updateFotoPerfil: (id, file) => {
    const form = new FormData();
    form.append('foto', file);
    return api.post(`/usuarios/${id}/foto`, form)
      .then(r => r.data.usuario ?? r.data);
  },

  // Actualiza las preferencias del usuario
  updatePreferencias: (id, prefs) =>
    api.put(`/usuarios/${id}/preferencias`, prefs)
      .then(r => r.data.usuario ?? r.data),
  
  // Obtiene los usuarios cercanos
  getUsuariosCercanos: (lat, lng) =>
        api.get(`/usuarios/cerca?latitude=${lat}&longitude=${lng}&radio=5000`)
          .then(r => r.data)
          .catch(() => []),
      
};
