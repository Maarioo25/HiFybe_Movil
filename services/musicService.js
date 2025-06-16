import api from './api';

// Servicio de música
export const musicService = {
  // Obtiene las canciones
  getSongs: filters =>
    api.get('/canciones', { params: filters }).then(r => r.data),

  // Obtiene las playlists
  getPlaylists: () =>
    api.get('/playlists').then(r => r.data),

  // Crea una playlist
  createPlaylist: data =>
    api.post('/playlists', data).then(r => r.data),

  // Agrega una canción a una playlist
  addSongToPlaylist: (playlistId, songId) =>
    api.post(`/playlists/${playlistId}/canciones`, { songId }).then(r => r.data),

  // Obtiene las recomendaciones de Spotify
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
