// src/screens/ChatsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { conversationService, userService } from '../services';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const user = await userService.getCurrentUser();
        console.log('👤 Usuario actual:', user);

        if (!user?._id) {
          throw new Error('No se pudo obtener el usuario actual');
        }

        setMeId(user._id);
        const list = await conversationService.getConversations(user._id);
        // Añadimos el id del usuario actual para distinguir roles
        const enriched = list.map(c => ({ ...c, usuarioActualId: user._id }));
        setChats(enriched);
      } catch (err) {
        console.error('Error al cargar chats:', err.message);
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }) => {
    // Determinar el usuario "otro" en la conversación
    const other = item.usuario1_id._id === item.usuarioActualId
      ? item.usuario2_id
      : item.usuario1_id;

    if (!other) {
      // Si por alguna razón no hay usuario, no renderizamos nada
      return null;
    }

    // Construir URI de avatar con fallback
    const avatarUri = other?.foto_perfil
      ? (other.foto_perfil.startsWith('http')
          ? other.foto_perfil
          : `https://api.mariobueno.info${other.foto_perfil}`)
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('ChatDetail', { conversacionId: item._id })
        }
      >
        {avatarUri
          ? <Image source={{ uri: avatarUri }} style={styles.avatar} />
          : <View style={[styles.avatar, styles.avatarPlaceholder]} />
        }
        <View style={styles.info}>
          <Text style={styles.name}>{other?.nombre || 'Usuario'}</Text>
          <Text style={styles.subtext} numberOfLines={1}>
            Pulsa para abrir la conversación
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus chats</Text>
      <FlatList
        data={chats}
        keyExtractor={c => c._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, padding: 16, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:            { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  card:             { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar:           { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  avatarPlaceholder:{ backgroundColor: '#ccc' },
  info:             { flex: 1 },
  name:             { fontSize: 18 },
  subtext:          { color: 'gray', marginTop: 4 },
});
