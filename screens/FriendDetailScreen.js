import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, TouchableOpacity,
  ActivityIndicator, SafeAreaView, Platform, StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { friendService, userService, playlistService, conversationService } from '../services';

export default function FriendDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { friendId } = route.params || {};

  const [friend, setFriend] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [amistadId, setAmistadId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const userData = await friendService.getFriendById(friendId);
        setFriend(userData);

        const currentUser = await userService.getCurrentUser();
        const friendships = await friendService.getFriends(currentUser._id);
        const amistad = friendships.find(f => f.id === friendId);
        setAmistadId(amistad ? amistad.amistadId : null);

        if (userData.auth_proveedor === 'spotify' || userData.spotifyId) {
          try {
            const spotifyPlaylists = await playlistService.getUserPlaylists(friendId);
            setPlaylists(spotifyPlaylists);
          } catch (err) {
            console.error('Error cargando playlists Spotify:', err);
            setPlaylists([]);
          }
        } else {
          setPlaylists([]);
        }

      } catch (err) {
        console.error('Error en fetchData FriendDetail:', err);
        setError('No se pudo cargar la información del amigo');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [friendId]);

  const handleStartConversation = async () => {
    try {
      const currentUser = await userService.getCurrentUser();
  
      const conversaciones = await conversationService.getConversations(currentUser._id);
      const existente = conversaciones.find(c => {
        const id1 = c.usuario1_id?._id || c.usuario1_id;
        const id2 = c.usuario2_id?._id || c.usuario2_id;
        return id1 === friendId || id2 === friendId;
      });
  
      const conversacionId = existente?._id
        ? existente._id
        : (await conversationService.createConversation({
          participantes: [currentUser._id, friendId],
        }))._id;
  
      navigation.navigate('Chats', {
        screen: 'ChatDetail',
        params: { conversacionId },
      });
    } catch (err) {
      console.error('❌ Error iniciando conversación:', err?.response?.data || err);
    }
  };

  const handleDeleteFriend = async () => {
    if (!amistadId) return;
  
    try {
      await friendService.deleteFriend(amistadId);
      navigation.goBack(); // Vuelve atrás tras eliminar
    } catch (err) {
      console.error('❌ Error eliminando amistad:', err?.response?.data || err);
      alert('No se pudo eliminar la amistad. Inténtalo de nuevo.');
    }
  };
  
  
  
  
  

  const goToPlaylistDetail = (playlistId) => {
    navigation.navigate('FriendPlaylistDetail', {
      playlistId,
      userId: friendId
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#4ECCA3" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonRow}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const filteredPlaylists = playlists.filter(pl => pl.canciones > 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image source={{ uri: friend.foto_perfil }} style={styles.avatar} />
          <Text style={styles.name}>{friend.nombre}</Text>
          <Text style={styles.bio}>
            {friend.biografia || 'Este usuario no ha añadido biografía.'}
          </Text>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.btnMessage} onPress={handleStartConversation}>
            <Text style={styles.btnText}>Enviar mensaje</Text>
          </TouchableOpacity>
          {amistadId && (
            <TouchableOpacity style={styles.btnDelete} onPress={handleDeleteFriend}>
              <Text style={styles.btnText}>Eliminar amistad</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.playlistsSection}>
          <Text style={styles.sectionTitle}>Playlists públicas</Text>
          {filteredPlaylists.length === 0 ? (
            <Text style={styles.noPlaylistsText}>No tiene playlists públicas</Text>
          ) : (
            filteredPlaylists.map(pl => (
              <TouchableOpacity
                key={pl.id}
                style={styles.playlistCard}
                onPress={() => goToPlaylistDetail(pl.id)}
              >
                <Image source={{ uri: pl.imagen }} style={styles.playlistImage} />
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{pl.nombre}</Text>
                  <Text style={styles.playlistDetails}>
                    {pl.canciones} canciones • {pl.duracion}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4E4E' },
  scrollContent: { padding: 16, paddingTop: 60 },
  centered: {
    flex: 1,
    backgroundColor: '#1E4E4E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: { color: '#4ECCA3', marginTop: 8, fontSize: 16 },
  errorText: { color: '#FF6B6B', fontSize: 18, marginBottom: 16 },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    left: 10,
    zIndex: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#B2F5EA',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  btnMessage: {
    backgroundColor: '#4ECCA3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  btnDelete: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  btnText: {
    color: '#1E4E4E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  playlistsSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ECCA3',
    marginBottom: 12,
  },
  noPlaylistsText: {
    color: '#B2F5EA',
    fontSize: 14,
    textAlign: 'center',
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#2A6B6B',
    padding: 12,
    borderRadius: 16,
  },
  playlistImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playlistDetails: {
    color: '#B2F5EA',
    fontSize: 12,
  },
});
