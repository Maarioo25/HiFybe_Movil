// services/notificationService.js
import api from './api';

export const notificationService = {
  getNotifications: userId =>
    api.get(`/notificaciones/usuarios/${userId}`).then(r => r.data),

  markAsRead: notificationId =>
    api.put(`/notificaciones/${notificationId}/leido`).then(r => r.data),

  deleteNotification: notificationId =>
    api.delete(`/notificaciones/${notificationId}`).then(r => r.data),
  crear: (userId, mensaje) =>
    api.post(`/notificaciones`, {
      usuario_id: userId,
      mensaje: mensaje
    }).then(r => r.data),
  
};
