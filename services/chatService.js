// services/conversationService.js
import api from './api';

export const conversationService = {
  getMessages: convoId =>
    api.get(`/conversaciones/${convoId}/mensajes`).then(r => r.data),

  sendMessage: (convoId, body) =>
    api.post(`/conversaciones/${convoId}/mensajes`, body).then(r => r.data),
};
