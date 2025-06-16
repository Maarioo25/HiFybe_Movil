import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { playlistService, userService } from '../services';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FriendPlaylistDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId } = route.params;
  const { setTrack } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [snapshotId, setSnapshotId] = useState('');
  const [noSpotifyAccess, setNoSpotifyAccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('spotifyToken');
        if (!token) {
          setNoSpotifyAccess(true);
          setLoading(false);
          return;
        }
        const p = await playlistService.getPlaylistById(playlistId);
        const t = await playlistService.getPlaylistTracks(playlistId);
        setPlaylist(p);
        setTracks(t || []);
        setNewName(p.nombre);
        setSnapshotId(p.snapshot_id || '');
      } catch (err) {
        console.error('❌ Error al cargar la playlist del amigo:', err);
        setPlaylist(null);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [playlistId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.trackCard}>
      <Image source={{ uri: item.album?.images?.[0]?.url }} style={styles.trackImage} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.trackSubtitle} numberOfLines={1}>{item.artists?.map(a => a.name).join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4ECCA3" />
      </View>
    );
  }

  if (noSpotifyAccess) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centeredMessage}>
          <Ionicons name="lock-closed" size={48} color="#FF6B6B" style={{ marginBottom: 12 }} />
          <Text style={styles.noAccessTitle}>Acceso restringido</Text>
          <Text style={styles.noAccessText}>Debes iniciar sesión con Spotify para ver esta playlist.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: 'white', textAlign: 'center' }}>
          No se pudo cargar la playlist.
        </Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#4ECCA3', textAlign: 'center' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri: playlist.imagen }} style={styles.cover} />
      <Text style={styles.playlistName}>{playlist.nombre}</Text>
      <Text style={styles.playlistDesc}>{playlist.descripcion}</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4E4E', paddingHorizontal: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { marginTop: Platform.OS === 'android' ? 40 : 10 },
  cover: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    borderRadius: 12,
    marginVertical: 16,
  },
  playlistName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  playlistDesc: {
    fontSize: 14,
    color: '#B2F5EA',
    textAlign: 'center',
    marginBottom: 16,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A6B6B',
    borderRadius: 12,
    marginVertical: 6,
    padding: 10
  },
  trackImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  trackInfo: { flex: 1 },
  trackTitle: { color: '#fff', fontWeight: 'bold' },
  trackSubtitle: { color: '#B2F5EA', fontSize: 12 },
  centeredMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noAccessTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  noAccessText: {
    color: '#B2F5EA',
    fontSize: 14,
    textAlign: 'center',
  },
});