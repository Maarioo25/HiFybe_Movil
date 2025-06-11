// PlaylistsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image,
  TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { userService, playlistService } from '../services';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const usuario = await userService.getCurrentUser();
        if (!usuario?._id) throw new Error('No se pudo obtener el usuario actual');

        const lista = await playlistService.getUserPlaylists(usuario._id);
        setPlaylists(lista);
      } catch (err) {
        console.error('Error al obtener playlists:', err);
        Alert.alert('Error', 'No se pudieron cargar tus playlists');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, { backgroundColor: '#ccc' }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.count}>{item.canciones} canciones</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, padding: 16, backgroundColor: '#fff' },
  loadingContainer:{ flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:           { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  alert:           { color: 'gray', textAlign: 'center', marginTop: 20 },
  card:            { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cover:           { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  info:            { flex: 1 },
  name:            { fontSize: 18 },
  count:           { color: 'gray', marginTop: 4 },
});
