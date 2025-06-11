// services/publicPlaylistsService.js
import api from './api';

export const publicPlaylistsService = {
  getPublicPlaylist: (userId, playlistId) =>
    api.get(`/public/${userId}/${playlistId}`).then(r => r.data),
};
