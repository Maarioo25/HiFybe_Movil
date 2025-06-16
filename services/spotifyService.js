import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para hacer peticiones a la API de Spotify
export const spotifyFetch = async (url, options = {}) => {
  const token = await AsyncStorage.getItem('spotifyToken');
  if (!token) throw new Error('No se encontró el token de Spotify');

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Spotify API error: [${res.status}] ${text}`);
  }

  return res.status === 204 ? null : res.json();
};

// Canción actual
export const getCurrentlyPlaying = () =>
  spotifyFetch('https://api.spotify.com/v1/me/player/currently-playing');

// Añadir canción a playlist
export const addTrackToPlaylist = (playlistId, trackUri) =>
  spotifyFetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: [trackUri] }),
  });

// Reproducir canción en dispositivo activo
export const playTrack = (trackUri) =>
  spotifyFetch(`https://api.spotify.com/v1/me/player/play`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: [trackUri] }),
  });
