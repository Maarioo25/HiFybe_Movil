// services/friendService.js
import api from './api';

export const friendService = {
  getFriends: userId =>
    api.get(`/amistades/usuarios/${userId}`).then(r => r.data),

  sendFriendRequest: payload =>
    api.post('/amistades/solicitudes', payload).then(r => r.data),

  respondFriendRequest: (requestId, accept) =>
    api.put(`/amistades/solicitudes/${requestId}`, { aceptada: accept }).then(r => r.data),
};
