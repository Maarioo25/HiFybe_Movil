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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { conversationService, userService } from '../services';
import MiniPlayerBar from '../components/MiniPlayerBar';
import { usePlayer } from '../context/PlayerContext';

export default function ChatDetailScreen() {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversacionId } = route.params;

  const { track } = usePlayer();

  const MINI_PLAYER_HEIGHT = 60;
  const INPUT_BAR_HEIGHT = 60; // aprox la altura de tu inputBar

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

  const renderItem = ({ item }) => {
    const esMio = item.emisor_id === usuarioActualId || item.emisor_id?._id === usuarioActualId;
    return (
      <View style={[styles.message, esMio ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.contenido}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          style={[
            styles.inputBar,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              marginBottom: track ? MINI_PLAYER_HEIGHT : 0,
            },
          ]}
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
  container: {
    flex: 1,
    backgroundColor: '#1E4E4E',
  },
  flex: {
    flex: 1,
  },
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
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  myMessage: {
    backgroundColor: '#4ECCA3',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#2A6B6B',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#FFFFFF',
  },
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
  iconButton: {
    padding: 6,
  },
});
