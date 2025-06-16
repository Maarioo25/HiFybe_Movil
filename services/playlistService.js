import api from './api';

// Servicio de playlists
export const playlistService = {
  // Obtiene las playlists de un usuario
  getUserPlaylists: async (userId) => {
    const res = await api.get(`/spotify/playlists/${userId}`);
    return res.data;
  },

  // Obtiene una playlist por su ID
  getPlaylistById: async (playlistId) => {
    const res = await api.get(`/spotify/playlist/${playlistId}`);
    return res.data;
  },

  // Obtiene las canciones de una playlist
  getPlaylistTracks: async (playlistId) => {
    const res = await api.get(`/spotify/playlist/${playlistId}/tracks`);
    return res.data;
  },
};
