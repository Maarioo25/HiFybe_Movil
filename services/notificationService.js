import api from './api';

// Servicio de notificaciones
export const notificationService = {
  // Obtiene las notificaciones de un usuario
  getNotifications: userId =>
    api.get(`/notificaciones/usuarios/${userId}`).then(r => r.data),

  // Marca una notificación como leída
  markAsRead: notificationId =>
    api.put(`/notificaciones/${notificationId}/leido`).then(r => r.data),

  // Elimina una notificación
  deleteNotification: notificationId =>
    api.delete(`/notificaciones/${notificationId}`).then(r => r.data),

  // Crea una notificación
  crear: (userId, mensaje) =>
    api.post(`/notificaciones`, {
      usuario_id: userId,
      mensaje: mensaje
    }).then(r => r.data),
  
};
