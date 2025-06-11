// services/playlistService.js
import api from './api';
export const playlistService = {
  getUserPlaylists: userId => api.get(`/spotify/playlists/${userId}`).then(r => r.data),
  getAllPlaylists: () => api.get('/playlists').then(r => r.data),
  getPlaylistById: id => api.get(`/playlists/${id}`).then(r => r.data),
  createPlaylist: data => api.post('/playlists', data).then(r => r.data),
  updatePlaylist: (id, data) => api.put(`/playlists/${id}`, data).then(r => r.data),
  deletePlaylist: id => api.delete(`/playlists/${id}`).then(r => r.data),
  addSongToPlaylist: (playlistId, songId) => api.post(`/playlists/${playlistId}/canciones`, { cancionId: songId }).then(r => r.data),
  removeSongFromPlaylist: (playlistId, songId) => api.delete(`/playlists/${playlistId}/canciones/${songId}`).then(r => r.data),
};

