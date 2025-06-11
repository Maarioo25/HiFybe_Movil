// services/conversationService.js
import api from './api';

export const conversationService = {
  getConversations: userId =>
    api.get(`/conversaciones/usuarios/${userId}`).then(r => r.data),

  createConversation: payload =>
    api.post('/conversaciones', payload).then(r => r.data),

  getMessages: convoId =>
    api.get(`/conversaciones/${convoId}/mensajes`).then(r => r.data),

  sendMessage: (convoId, body) =>
    api.post(`/conversaciones/${convoId}/mensajes`, body).then(r => r.data),
};
