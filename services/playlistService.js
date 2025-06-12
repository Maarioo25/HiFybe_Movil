// services/playlistService.js
import api from './api';

export const playlistService = {
  // ✅ Obtener playlists públicas del usuario desde Spotify
  getUserPlaylists: userId =>
    api.get(`/spotify/playlists/${userId}`).then(r => r.data),

  // ✅ Obtener una playlist de Spotify (ya implementado en tu backend)
  getSpotifyPlaylistById: (userId, playlistId) =>
    api.get(`/public/${userId}/${playlistId}`).then(r => r.data),

  // (opcional) Obtener canciones de una playlist si tuvieras una ruta específica
  getSpotifyTracksByPlaylistId: id =>
    api.get(`/spotify/playlist/${id}/tracks`).then(r => r.data),
};