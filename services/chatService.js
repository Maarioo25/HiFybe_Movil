import api from './api';

// Servicio de conversaciones
export const conversationService = {
  // Obtiene los mensajes de una conversación
  getMessages: convoId =>
    api.get(`/conversaciones/${convoId}/mensajes`).then(r => r.data),

  // Envía un mensaje a una conversación
  sendMessage: (convoId, body) =>
    api.post(`/conversaciones/${convoId}/mensajes`, body).then(r => r.data),
};
