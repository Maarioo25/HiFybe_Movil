import api from './api';

// Servicio de amigos
export const friendService = {

  // Obtiene los amigos de un usuario
  getFriends: userId =>
    api.get(`/amistades/usuarios/${userId}`).then(r => r.data),

  // Obtiene un amigo por su ID
  getFriendById: id =>
    api.get(`/usuarios/${id}`).then(r => r.data.usuario ?? r.data),

  // Envía una solicitud de amistad
  sendRequest: async (fromId, toId) => {
    const res = await api.post('/amistades/solicitudes', {
      de_usuario_id: fromId,
      para_usuario_id: toId
    });
    return res.data;
  },

  // Responde a una solicitud de amistad
  respondFriendRequest: (requestId, estado) =>
    api.put(`/amistades/solicitudes/${requestId}`, { estado }).then(r => r.data),

  // Obtiene las solicitudes de amistad de un usuario
  getRequests: userId =>
    api.get(`/amistades/usuarios/${userId}/solicitudes`).then(r => r.data),

  // Elimina una amistad
  deleteFriend: amistadId =>
    api.delete(`/amistades/${amistadId}`).then(r => r.data),

  // Obtiene las playlists de un amigo con un token
  getSpotifyPlaylistsWithToken: (friendId, token) =>
    api.get(`/spotify/playlists/${friendId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data),

  // Reproduce una canción de una playlist
  playSongFromPlaylist: (userId, playlistId, trackId) =>
    api.post(`/usuarios/${userId}/playlists/${playlistId}/play`, { trackId })
      .then(r => r.data),
};
