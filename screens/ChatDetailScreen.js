import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { conversationService, userService } from '../services';
import { usePlayer } from '../context/PlayerContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alert from 'react-native';

// Componente para mostrar el detalle de una conversación
export default function ChatDetailScreen() {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversacionId } = route.params;

  const { setTrack, track } = usePlayer();

  const MINI_PLAYER_HEIGHT = 60;
  const INPUT_BAR_HEIGHT = 60;

  useEffect(() => {
    (async () => {
      try {
        const usuario = await userService.getCurrentUser();
        setUsuarioActualId(usuario._id);
        const data = await conversationService.getMessages(conversacionId);
        setMensajes(data);
      } catch (err) {
        console.error('Error al cargar mensajes:', err);
      }
    })();
  }, [conversacionId]);

  // Función para reproducir una canción
  const reproducirCancion = async (trackUri) => {
    try {
      console.log('Intentando reproducir canción:', trackUri);
      const token = await AsyncStorage.getItem('spotifyToken');
      console.log('Token de Spotify:', token);
      if (!token) throw new Error('Token de Spotify no disponible');

      const res = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri] })
      });

      const responseText = await res.text();
      console.log(`Respuesta de Spotify (${res.status}):`, responseText);

      if (res.status === 204) {
        console.log('Reproducción iniciada');
      } else {
        console.error('Spotify Error', res.status, responseText);
        Alert.alert('Error', 'No se pudo iniciar la reproducción');
      }
    } catch (err) {
      console.error('Error al reproducir:', err);
      Alert.alert('Error', 'No se pudo reproducir la canción');
    }
  };

  // Función para enviar un mensaje
  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || !usuarioActualId) return;

    const mensaje = {
      contenido: nuevoMensaje,
      emisorId: usuarioActualId,
    };

    try {
      const nuevo = await conversationService.sendMessage(conversacionId, mensaje);
      setMensajes((prev) => [...prev, nuevo]);
      setNuevoMensaje('');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  // Función para renderizar un mensaje
    const renderItem = ({ item }) => {
    const esMio = item.emisor_id === usuarioActualId || item.emisor_id?._id === usuarioActualId;
    const tieneCancion = !!item.cancion;

    const messageStyle = [
      styles.message,
      esMio ? styles.myMessage : styles.theirMessage,
      tieneCancion ? styles.withSong : {},
    ];

    return (
      <View style={messageStyle}>
        {item.contenido ? <Text style={styles.messageText}>{item.contenido}</Text> : null}

        {tieneCancion && (
          <View style={styles.songContainer}>
            <Image source={{ uri: item.cancion.imagen }} style={styles.songImage} />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.cancion.nombre || item.cancion.titulo || 'Sin título'}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {item.cancion.artista}
              </Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => {
                  const formattedTrack = {
                    name: item.cancion.nombre || item.cancion.titulo,
                    artists: [{ name: item.cancion.artista }],
                    album: { images: [{ url: item.cancion.imagen }] },
                    uri: item.cancion.uri,
                    duration_ms: 180000,
                    addedAt: Date.now(),
                  };
                  setTrack(formattedTrack);
                  reproducirCancion(item.cancion.uri);
                }}
              >
                <Ionicons name="play" size={18} color="#1E4E4E" />
                <Text style={styles.playText}>Reproducir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.messageTime}>
          {new Date(item.fecha_envio).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 90}
      >
        <FlatList
          data={mensajes}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: (track ? MINI_PLAYER_HEIGHT : 0) + INPUT_BAR_HEIGHT + insets.bottom,
          }}
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          style={styles.flex}
        />

        <View
          style={[styles.inputBar, {
            paddingBottom: Math.max(insets.bottom, 12),
            marginBottom: track ? MINI_PLAYER_HEIGHT : 0,
          }]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#88C5B5"
            value={nuevoMensaje}
            onChangeText={setNuevoMensaje}
          />
          <TouchableOpacity onPress={handleEnviar} style={styles.iconButton}>
            <Ionicons name="send" size={24} color="#4ECCA3" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4E4E' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#1E4E4E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A6B6B',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  message: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: '80%',
    minWidth: 60,
  },
  myMessage: {
    backgroundColor: '#4ECCA3',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#2A6B6B',
    alignSelf: 'flex-start',
  },
  messageText: { color: '#FFFFFF' },
  messageTime: {
    fontSize: 10,
    color: '#B2F5EA',
    textAlign: 'right',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A6B6B',
    backgroundColor: '#1E4E4E',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2A6B6B',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  iconButton: { padding: 6 },
  songContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#1E4E4E',
    borderRadius: 10,
    padding: 8,
    gap: 10,
    minWidth: 220,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
  },
  songInfo: { flex: 1, justifyContent: 'center' },
  songTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  songArtist: {
    color: '#B2F5EA',
    fontSize: 12,
    marginBottom: 6,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECCA3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  playText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#1E4E4E',
    fontWeight: 'bold',
  },
  withSong: {
    maxWidth: '100%',
  },
});