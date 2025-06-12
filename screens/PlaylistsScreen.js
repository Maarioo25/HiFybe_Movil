// PlaylistsScreen.js
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
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const usuario = await userService.getCurrentUser();
        if (!usuario?._id) throw new Error('No se pudo obtener el usuario actual');
        setUserId(usuario._id);
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
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, { backgroundColor: '#ccc' }]} />
        )}
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.count}>{item.canciones} canciones</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECCA3" />
      </View>
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
  innerWrapper:     { flex: 1, paddingHorizontal: 16 },
  headerSpacer:     { height: Platform.OS === 'android' ? StatusBar.currentHeight + 32 : 48 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:            { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
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
