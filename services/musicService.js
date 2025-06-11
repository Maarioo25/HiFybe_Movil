// services/musicService.js
import api from './api';

export const musicService = {
  getSongs: filters =>
    api.get('/canciones', { params: filters }).then(r => r.data),

  getPlaylists: () =>
    api.get('/playlists').then(r => r.data),

  createPlaylist: data =>
    api.post('/playlists', data).then(r => r.data),

  addSongToPlaylist: (playlistId, songId) =>
    api.post(`/playlists/${playlistId}/canciones`, { songId }).then(r => r.data),

  getSpotifyRecommendations: async () => {
    try {
      const res = await api.get('/data/recommendations.json');
      const recs = res.data;
      const detalles = await Promise.all(
        recs.map(async rec => {
          const r2 = await api.get(`/canciones/spotify/${rec.id}`);
          return {
            id: rec.id,
            title: r2.data.nombre,
            artist: r2.data.artista,
            img: r2.data.imagen,
            spotifyUri: r2.data.uri,
          };
        })
      );
      return detalles;
    } catch {
      return [];
    }
  },
};
