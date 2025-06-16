import api from './api';

export const userService = {
  getAllUsers: async () => {
    const res = await api.get('/usuarios');
    return res.data;
  },

  getUserById: id =>
    api.get(`/usuarios/${id}`)
      .then(r => r.data.usuario ?? r.data),

  updateProfile: (id, data) =>
    api.put(`/usuarios/${id}`, {
      nombre: data.nombre,
      apellidos: data.apellidos,
      biografia: data.biografia,
      foto_perfil: data.foto_perfil
    }).then(r => r.data.usuario ?? r.data),

  deleteUser: id =>
    api.delete(`/usuarios/${id}`)
      .then(r => r.data),

  login: (email, password) =>
    api.post('/usuarios/login', { email, password })
      .then(r => r.data.usuario ?? r.data),

  register: data =>
    api.post('/usuarios/register', data)
      .then(r => r.data.usuario ?? r.data),

  getCurrentUser: () =>
    api.get('/usuarios/me')
      .then(r => r.data.usuario ?? r.data),

  logout: () =>
    api.post('/usuarios/logout')
      .then(r => r.data),

  setCancionUsuario: (userId, trackId) =>
    api.put(`/usuarios/${userId}/cancion`, { trackId })
      .then(r => r.data.usuario ?? r.data)
      .catch(() => null),

  getCancionUsuario: async (userId) => {
    try {
      const res = await api.get(`/usuarios/${userId}/cancion`);
      return res.data;
    } catch (err) {
      console.error("Error en getCancionUsuario:", err);
      return null;
    }
  },
      

  ocultarUbicacion: () =>
    api.post('/usuarios/ocultar-ubicacion')
      .then(r => r.data.usuario ?? r.data),

  actualizarUbicacion: (lat, lng) =>
    api.post('/usuarios/ubicacion', { latitude: lat, longitude: lng })
      .then(r => r.data.usuario ?? r.data),

  updateRedesSociales: (id, redes) =>
    api.put(`/usuarios/${id}/redes`, redes)
      .then(r => r.data.usuario ?? r.data),

  updateFotoPerfil: (id, file) => {
    const form = new FormData();
    form.append('foto', file);
    return api.post(`/usuarios/${id}/foto`, form)
      .then(r => r.data.usuario ?? r.data);
  },

  updatePreferencias: (id, prefs) =>
    api.put(`/usuarios/${id}/preferencias`, prefs)
      .then(r => r.data.usuario ?? r.data),
  
  getUsuariosCercanos: (lat, lng) =>
        api.get(`/usuarios/cerca?latitude=${lat}&longitude=${lng}&radio=5000`)
          .then(r => r.data)
          .catch(() => []),
      
};
