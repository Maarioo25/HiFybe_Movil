// FriendsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { userService, friendService } from '../services';

export default function FriendsScreen() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarAmigos = async () => {
      try {
        console.log('[FriendsScreen] Obteniendo usuario actual...');
        const usuario = await userService.getCurrentUser();
        console.log('[FriendsScreen] Usuario actual:', usuario);

        const lista = await friendService.getFriends(usuario._id);
        console.log('[FriendsScreen] Amigos:', lista);

        setFriends(lista);
      } catch (err) {
        console.error('[FriendsScreen] Error:', err.response?.data || err.message);
        Alert.alert('Error', err.response?.data?.mensaje || 'No se pudieron cargar tus amigos');
      } finally {
        setLoading(false);
      }
    };
    cargarAmigos();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      {item.foto_perfil ? (
        <Image
          source={{
            uri: item.foto_perfil.startsWith('http')
              ? item.foto_perfil
              : `https://api.mariobueno.info${item.foto_perfil}`,
          }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.name}>{item.nombre || 'Usuario'}</Text>
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
      <Text style={styles.title}>Tus amigos</Text>
      {friends.length === 0 ? (
        <Text style={styles.alert}>No tienes amigos aún 😢</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(f, index) => f._id || `amigo-${index}`}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, padding: 16, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  alert:      { color: 'gray', textAlign: 'center', marginTop: 20 },
  card:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar:     { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  name:       { fontSize: 18 },
});
