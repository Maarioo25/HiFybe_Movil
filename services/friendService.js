// services/friendService.js
import api from './api';

export const friendService = {
  getFriends: userId =>
    api.get(`/amistades/usuarios/${userId}`).then(r => r.data),

  getFriendById: id =>
    api.get(`/usuarios/${id}`).then(r => r.data.usuario ?? r.data),

  sendRequest: async (fromId, toId) => {
    const res = await api.post('/amistades/solicitudes', {
      de_usuario_id: fromId,
      para_usuario_id: toId
    });
    return res.data;
  },

  respondFriendRequest: (requestId, estado) =>
    api.put(`/amistades/solicitudes/${requestId}`, { estado }).then(r => r.data),

  getRequests: userId =>
    api.get(`/amistades/usuarios/${userId}/solicitudes`).then(r => r.data),

  deleteFriend: amistadId =>
    api.delete(`/amistades/${amistadId}`).then(r => r.data),

  getSpotifyPlaylistsWithToken: (friendId, token) =>
    api.get(`/spotify/playlists/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  playSongFromPlaylist: (userId, playlistId, trackId) =>
    api.post(`/usuarios/${userId}/playlists/${playlistId}/play`, { trackId })
      .then(r => r.data),
};
