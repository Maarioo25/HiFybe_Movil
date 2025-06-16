// services/conversationService.js
import api from './api';

export const conversationService = {
  getConversations: async (usuarioId) => {
    const res = await api.get(`/conversaciones/usuarios/${usuarioId}`);
    if (!Array.isArray(res.data)) {
      console.error('[getConversations] La respuesta no es un array:', res.data);
      return [];
    }
    return res.data;
  },
  createConversation: payload =>
    api.post('/conversaciones', payload).then(r => r.data),

  getMessages: convoId =>
    api.get(`/conversaciones/${convoId}/mensajes`).then(r => r.data),

  sendMessage: async (convoId, body) => {
    try {
      const r = await api.post(`/conversaciones/${convoId}/mensajes`, body);
      return r.data;
    } catch (err) {
      console.error('[ERROR] Error al enviar mensaje:', err?.response?.data || err);
      throw err;
    }
  }
};
