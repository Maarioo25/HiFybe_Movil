import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { userService, playlistService } from '../services';

export default function PlaylistDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId, userId, isOwnPlaylist } = route.params || {};
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [snapshotId, setSnapshotId] = useState('');
  const [tokenSpotify, setTokenSpotify] = useState(null);

  useEffect(() => {
    (async () => {
      console.log('[DEBUG] Cargando PlaylistDetailScreen con:');
      console.log('playlistId:', playlistId);
      console.log('userId:', userId);
      console.log('isOwnPlaylist:', isOwnPlaylist);

      if (!playlistId || (!userId && !isOwnPlaylist)) {
        Alert.alert('Error', 'Faltan parámetros necesarios');
        return setLoading(false);
      }

      try {
        const user = await userService.getCurrentUser();
        const token = user.spotifyAccessToken;
        setTokenSpotify(token);

        if (isOwnPlaylist) {
          if (!token) throw new Error('No hay token de Spotify');

          const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) {
            const msg = await res.text();
            throw new Error(`[${res.status}] ${msg}`);
          }

          const data = await res.json();
          setPlaylist(data);
          setNewName(data.name);
          setSnapshotId(data.snapshot_id);
          const canciones = data.tracks?.items.map(i => i.track).filter(Boolean);
          setTracks(canciones || []);
        } else {
          const data = await playlistService.getSpotifyPlaylistById(userId, playlistId);
          setPlaylist({
            nombre: data.nombre,
            descripcion: data.descripcion,
            owner: { display_name: data.owner?.nombre || 'Desconocido' },
            images: [{ url: data.imagen }],
          });
          setNewName(data.nombre);
          setTracks(data.canciones || []);
        }
      } catch (err) {
        console.error('[ERROR] al cargar la playlist:', err);
        Alert.alert('Error', 'No se pudo cargar la playlist');
      } finally {
        setLoading(false);
      }
    })();
  }, [playlistId, userId]);

  const handleSaveName = async () => {
    try {
      if (!tokenSpotify) throw new Error('Token de Spotify no disponible');
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokenSpotify}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`[${res.status}] ${msg}`);
      }

      setPlaylist(prev => ({ ...prev, name: newName }));
      setEditMode(false);
      Alert.alert('Éxito', 'Nombre actualizado');
    } catch (err) {
      console.error('[ERROR] al cambiar nombre:', err);
      Alert.alert('Error', 'No se pudo cambiar el nombre');
    }
  };

  const handleRemoveTrack = async (trackUri) => {
    try {
      if (!tokenSpotify) throw new Error('Token de Spotify no disponible');
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokenSpotify}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tracks: [{ uri: trackUri }],
          snapshot_id: snapshotId
        })
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`[${res.status}] ${msg}`);
      }

      const result = await res.json();
      setSnapshotId(result.snapshot_id);
      setTracks(prev => prev.filter(t => t.uri !== trackUri));
    } catch (err) {
      console.error('[ERROR] al eliminar canción:', err);
      Alert.alert('Error', 'No se pudo eliminar la canción');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.trackCard}>
      <Image source={{ uri: item.cover || item.album?.images?.[0]?.url }} style={styles.trackImage} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title || item.name}</Text>
        <Text style={styles.trackSubtitle} numberOfLines={1}>
          {item.artist || item.artists?.map(a => a.name).join(', ')}
        </Text>
      </View>
      {isOwnPlaylist && item.uri && (
        <TouchableOpacity onPress={() => handleRemoveTrack(item.uri)}>
          <Feather name="trash" size={20} color="red" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ECCA3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
      <View style={styles.headerSpacer} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={{ uri: playlist.images?.[0]?.url }} style={styles.cover} />
      <View style={styles.infoContainer}>
        {isOwnPlaylist && editMode ? (
          <View style={styles.nameRow}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={styles.editNameInput}
              placeholder="Nuevo nombre"
              placeholderTextColor="#ccc"
            />
            <TouchableOpacity onPress={handleSaveName}>
              <Feather name="check" size={24} color="#4ECCA3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setEditMode(false);
              setNewName(playlist.name || playlist.nombre);
            }}>
              <Feather name="x" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.playlistName}>
              {playlist.name || playlist.nombre}
            </Text>
            {isOwnPlaylist && (
              <TouchableOpacity onPress={() => setEditMode(true)}>
                <Feather name="edit" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>
        )}
        <Text style={styles.owner}>
          Creado por {playlist.owner?.display_name || 'Desconocido'}
        </Text>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item.uri || item.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4E4E' },
  headerSpacer: { height: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40, left: 10, zIndex: 10 },
  cover: { width: 180, height: 180, alignSelf: 'center', borderRadius: 12, marginVertical: 16 },
  infoContainer: { paddingHorizontal: 20, alignItems: 'center' },
  playlistName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  owner: { color: '#B2F5EA', marginTop: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  editNameInput: {
    flex: 1,
    color: '#fff',
    borderBottomWidth: 1,
    borderColor: '#4ECCA3',
    marginRight: 8,
    paddingBottom: 2
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 10,
    backgroundColor: '#2A6B6B',
    borderRadius: 12
  },
  trackImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#fff', fontWeight: 'bold' },
  trackSubtitle: { color: '#B2F5EA', fontSize: 12 }
});
