import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView,
  StatusBar, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userService, playlistService } from '../services';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [hasSpotify, setHasSpotify] = useState(true);
  const navigation = useNavigation();

  // useEffect para cargar las playlists
  useEffect(() => {
    (async () => {
      try {
        const usuario = await userService.getCurrentUser();
        if (!usuario?._id) throw new Error('No se pudo obtener el usuario actual');

        setUserId(usuario._id);

        if (!usuario.spotifyAccessToken) {
          setHasSpotify(false);
          return;
        }

        const lista = await playlistService.getUserPlaylists(usuario._id);

        // Normaliza las playlists
        const normalizadas = lista.map(p => ({
          id: p.id,
          nombre: p.nombre ?? 'Sin título',
          imagen: (p.imagen && typeof p.imagen === 'string') ? p.imagen : 'https://via.placeholder.com/180',
          canciones: p.canciones ?? 0
        }));

        setPlaylists(normalizadas);
      } catch (err) {
        console.error('Error al obtener playlists:', err);
        Alert.alert('Error', 'No se pudieron cargar tus playlists');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Renderizado de cada playlist
  const renderItem = ({ item }) => {
    const imageUrl = item.imagen ?? 'https://via.placeholder.com/180';
    const title = item.nombre ?? 'Sin título';
    const count = item.canciones ?? 'Desconocido';
  
    return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('PlaylistDetail', {
          playlistId: item.id,
          userId,
          isOwnPlaylist: true,
        })
      }
    >
      <LinearGradient
        colors={['#2A6B6B', '#0D2B2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.imageWrapper}
      >
        <Image source={{ uri: imageUrl }} style={styles.cover} />
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{title}</Text>
        <Text style={styles.count}>{count} canciones</Text>
      </View>
    </TouchableOpacity>
  );
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECCA3" />
      </View>
    );
  }

  if (!hasSpotify) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.innerWrapper}>
          <Text style={styles.title}>Conecta tu cuenta de Spotify</Text>
          <Text style={styles.alert}>
            Para ver y reproducir playlists, primero inicia sesión con Spotify desde los ajustes.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
      <View style={styles.innerWrapper}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>Tus playlists públicas</Text>
        {playlists.length === 0 ? (
          <Text style={styles.alert}>No tienes playlists públicas</Text>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={p => p.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#1E4E4E' },
  innerWrapper:     { flex: 1, paddingHorizontal: 16, justifyContent: 'center' },
  headerSpacer:     { height: Platform.OS === 'android' ? StatusBar.currentHeight + 32 : 48 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:            { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12, textAlign: 'center' },
  alert:            { color: '#B2F5EA', textAlign: 'center', marginTop: 20 },
  card:             {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#2A6B6B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    margin: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cover: { width: 60, height: 60, borderRadius: 8 },
  info:  { flex: 1, paddingRight: 8 },
  name:  { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  count: { color: '#B2F5EA', fontSize: 13, marginTop: 4 },
});
