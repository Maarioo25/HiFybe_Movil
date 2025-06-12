// ChatDetailScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, StyleSheet, KeyboardAvoidingView,
  Platform, SafeAreaView, StatusBar, Animated
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { conversationService, userService } from '../services';

export default function ChatDetailScreen() {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastAnim] = useState(new Animated.Value(0));
  const scrollRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { conversacionId } = route.params;

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getCurrentUser();
        const user = res;
        setUsuarioActualId(user._id);
        const data = await conversationService.getMessages(conversacionId);
        setMensajes(data);
      } catch (err) {
        console.error('Error cargando mensajes:', err);
        mostrarToast('No se pudieron cargar los mensajes');
      }
    })();
  }, [conversacionId]);

  const mostrarToast = (mensaje) => {
    setToastMessage(mensaje);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim()) return;
    if (!usuarioActualId) {
      console.warn('usuarioActualId no disponible');
      return;
    }

    const body = {
        contenido: nuevoMensaje,
        emisorId: usuarioActualId
    };

    try {
      const res = await conversationService.sendMessage(conversacionId, body);
      setMensajes(prev => [...prev, res]);
      setNuevoMensaje('');
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      mostrarToast(err?.response?.data?.mensaje || 'No se pudo enviar el mensaje');
    }
  };

  const renderItem = ({ item }) => {
    const esMio = item.emisor_id === usuarioActualId || item.emisor_id?._id === usuarioActualId;

    return (
      <View
        style={[
          styles.messageContainer,
          esMio ? styles.myMessage : styles.theirMessage
        ]}
      >
        <Text style={styles.messageText}>{item.contenido}</Text>
        <Text style={styles.timeText}>{new Date(item.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
      <Animated.View style={[styles.toast, { opacity: toastAnim }]}> 
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
      <View style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </View>

      <FlatList
        data={mensajes}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16 }}
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="musical-notes" size={24} color="#88C5B5" />
          </TouchableOpacity>
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
    backgroundColor: '#1E4E4E'
  },
  toast: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: '#4ECCA3',
    borderRadius: 10,
    zIndex: 999,
  },
  toastText: {
    color: '#1E4E4E',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  headerWrapper: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#1E4E4E'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E4E4E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A6B6B'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  messageContainer: {
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
  timeText: {
    fontSize: 10,
    color: '#B2F5EA',
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A6B6B',
    backgroundColor: '#1E4E4E',
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2A6B6B',
    borderRadius: 20,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  iconButton: {
    padding: 8,
  }
});
