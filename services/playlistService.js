import api from './api';

export const playlistService = {
  getUserPlaylists: async (userId) => {
    const res = await api.get(`/spotify/playlists/${userId}`);
    return res.data;
  },

  getPlaylistById: async (playlistId) => {
    const res = await api.get(`/spotify/playlist/${playlistId}`);
    return res.data;
  },

  getPlaylistTracks: async (playlistId) => {
    const res = await api.get(`/spotify/playlist/${playlistId}/tracks`);
    return res.data;
  },
};
