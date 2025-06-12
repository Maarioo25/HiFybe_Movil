// services/conversationService.js
import api from './api';

export const conversationService = {
  getConversations: userId =>
    api.get(`/conversaciones/usuarios/${userId}`).then(r => r.data),

  createConversation: payload =>
    api.post('/conversaciones', payload).then(r => r.data),

  getMessages: convoId =>
    api.get(`/conversaciones/${convoId}/mensajes`).then(r => r.data),

  sendMessage: async (convoId, body) => {
    console.log('[DEBUG] Enviando a:', `/conversaciones/${convoId}/mensajes`);
    console.log('[DEBUG] Body:', body);
    try {
      const r = await api.post(`/conversaciones/${convoId}/mensajes`, body);
      console.log('[DEBUG] Respuesta:', r.data);
      return r.data;
    } catch (err) {
      console.error('[ERROR] Error backend:', err?.response?.data || err);
      throw err;
    }
  }
  
};
