import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../context/PlayerContext';
import CustomPopUp from '../components/CustomPopUp';

export default function PlaylistDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId } = route.params || {};
  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [snapshotId, setSnapshotId] = useState('');
  const [tokenSpotify, setTokenSpotify] = useState(null);
  const { setTrack } = usePlayer();
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState(null);

  const mostrarPopup = (contenido) => {
    setPopupContent(contenido);
    setPopupVisible(true);
    setTimeout(() => setPopupVisible(false), 2000);
  };

  // Función para reproducir una canción
  const reproducirCancion = async (trackUri) => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      if (!token) throw new Error('Token de Spotify no disponible');

      const res = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri] })
      });

      if (res.status === 204) {
        console.log('▶️ Reproducción iniciada');
      } else {
        const msg = await res.text();
        console.error('[Spotify Error]', res.status, msg);
        Alert.alert('Error', 'No se pudo iniciar la reproducción');
      }
    } catch (err) {
      console.error('Error al reproducir:', err);
      Alert.alert('Error', 'No se pudo reproducir la canción');
    }
  };

  // useEffect para cargar la playlist
  useEffect(() => {
    (async () => {
      if (!playlistId) {
        Alert.alert('Error', 'Falta el ID de la playlist');
        setLoading(false);
        return;
      }

      try {
        const spToken = await AsyncStorage.getItem('spotifyToken');
        if (!spToken) throw new Error('Token de Spotify no disponible');
        console.log('Token de Spotify:', spToken);

        setTokenSpotify(spToken);

        const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: { Authorization: `Bearer ${spToken}` }
        });
        console.log('Respuesta de Spotify:', res);

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(`[${res.status}] ${msg}`);
        }

        const data = await res.json();
        console.log('Datos de la playlist:', data);
        setPlaylist(data);
        setNewName(data.name);
        setSnapshotId(data.snapshot_id);
        const canciones = data.tracks?.items.map(i => i.track).filter(Boolean);
        setTracks(canciones || []);
      } catch (err) {
        console.error('[ERROR] al cargar la playlist:', err);
        Alert.alert('Error', 'No se pudo cargar la playlist');
      } finally {
        setLoading(false);
      }
    })();
  }, [playlistId]);

  // Función para guardar el nombre de la playlist
  const handleSaveName = async () => {
    try {
      if (!tokenSpotify) throw new Error('Token no disponible');
      const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokenSpotify}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
      });

      if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`);

      setPlaylist(prev => ({ ...prev, name: newName }));
      setEditMode(false);
      mostrarPopup(<Text style={{ color: '#fff' }}>✅ Nombre actualizado</Text>);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo cambiar el nombre');
    }
  };

  // Función para eliminar una canción de la playlist
  const handleRemoveTrack = async (trackUri) => {
    try {
      if (!tokenSpotify) throw new Error('Token no disponible');
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

      if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`);

      const result = await res.json();
      setSnapshotId(result.snapshot_id);
      setTracks(prev => prev.filter(t => t.uri !== trackUri));
      mostrarPopup(<Text style={{ color: '#fff' }}>🎵 Canción eliminada</Text>);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo eliminar la canción');
    }
  };

  // Renderizado de cada canción
  const renderItem = ({ item }) => {
    const imageUrl = item.album?.images?.[0]?.url ?? 'https://via.placeholder.com/50';
    const title = item.name ?? 'Sin título';
    const artists = item.artists?.map(a => a.name).join(', ') ?? 'Desconocido';

    return (
      <TouchableOpacity style={styles.trackCard} onPress={() => {
        setTrack(item);
        reproducirCancion(item.uri);
      }}>
        <Image source={{ uri: imageUrl }} style={styles.trackImage} />
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.trackSubtitle} numberOfLines={1}>{artists}</Text>
        </View>
        {item.uri && (
          <TouchableOpacity onPress={() => handleRemoveTrack(item.uri)}>
            <Feather name="trash" size={20} color="red" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ECCA3" />
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff' }}>No se pudo cargar la playlist</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { marginTop: 16 }]}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8 }}>Volver</Text>
        </TouchableOpacity>
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

      <Image
        source={{ uri: playlist.images?.[0]?.url || 'https://via.placeholder.com/180' }}
        style={styles.cover}
      />
      <View style={styles.infoContainer}>
        {editMode ? (
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
              setNewName(playlist.name);
            }}>
              <Feather name="x" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.playlistName}>{playlist.name}</Text>
            <TouchableOpacity onPress={() => setEditMode(true)}>
              <Feather name="edit" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.owner}>
          Creado por {playlist.owner?.display_name || 'Desconocido'}
        </Text>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item, index) => `${item.uri || item.id}-${index}`}
        renderItem={renderItem}
      />

      <View style={{ position: 'absolute', top: 50, alignSelf: 'center', zIndex: 99 }}>
        <CustomPopUp visible={popupVisible} onClose={() => setPopupVisible(false)}>
          {popupContent}
        </CustomPopUp>
      </View>
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
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  editNameInput: {
    flex: 1, color: '#fff', borderBottomWidth: 1,
    borderColor: '#4ECCA3', marginRight: 8, paddingBottom: 2
  },
  trackCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginVertical: 6,
    padding: 10, backgroundColor: '#2A6B6B', borderRadius: 12
  },
  trackImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#fff', fontWeight: 'bold' },
  trackSubtitle: { color: '#B2F5EA', fontSize: 12 }
});
