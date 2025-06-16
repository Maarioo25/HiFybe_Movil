import api from './api';

// Servicio de conversaciones
export const conversationService = {

  // Obtiene las conversaciones de un usuario
  getConversations: async (usuarioId) => {
    const res = await api.get(`/conversaciones/usuarios/${usuarioId}`);
    if (!Array.isArray(res.data)) {
      console.error('[getConversations] La respuesta no es un array:', res.data);
      return [];
    }
    return res.data;
  },

  // Crea una nueva conversación
  createConversation: payload =>
    api.post('/conversaciones', payload).then(r => r.data),

  // Obtiene los mensajes de una conversación
  getMessages: convoId =>
    api.get(`/conversaciones/${convoId}/mensajes`).then(r => r.data),

  // Envía un mensaje a una conversación
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
