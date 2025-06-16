import api from './api';

// Servicio de playlists públicas
export const publicPlaylistsService = {
  // Obtiene una playlist pública
  getPublicPlaylist: (userId, playlistId) =>
    api.get(`/public/${userId}/${playlistId}`).then(r => r.data),
};
