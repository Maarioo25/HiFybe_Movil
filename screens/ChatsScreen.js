// ChatsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ImageBackground, StyleSheet, ActivityIndicator, Alert,
  StatusBar, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { conversationService, userService } from '../services';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatsScreen() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      try {
        const user = await userService.getCurrentUser();
        if (!user?._id) throw new Error('No se pudo obtener el usuario actual');
        setMeId(user._id);
        const list = await conversationService.getConversations(user._id);
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
    console.log('Conversación:', item);
    if (!item.usuario1_id?._id || !item.usuario2_id?._id) return null;

    const other = item.usuario1_id._id === item.usuarioActualId
      ? item.usuario2_id
      : item.usuario1_id;

    if (!other) return null;

    const avatarUri = other?.foto_perfil
      ? (other.foto_perfil.startsWith('http')
          ? other.foto_perfil
          : `https://api.mariobueno.info${other.foto_perfil.startsWith('/') ? '' : '/'}${other.foto_perfil}`)
      : `https://via.placeholder.com/100?text=?`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ChatDetail', { conversacionId: item._id })}
      >
        <ImageBackground
          source={{ uri: avatarUri }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={['rgba(30,78,78,0)', 'rgba(30,78,78,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.overlay}
          >
            <Text style={styles.name}>{other?.nombre || 'Usuario'}</Text>
          </LinearGradient>
        </ImageBackground>
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

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
      <View style={styles.container}>
        <Text style={styles.title}>Tus chats</Text>
        <FlatList
          data={chats}
          keyExtractor={c => c._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E4E4E'
  },
  container:  { flex: 1, paddingHorizontal: 16, backgroundColor: '#1E4E4E' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#FFFFFF' },
  card:       { height: 100, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  imageBackground: { flex: 1, justifyContent: 'center' },
  imageStyle: { resizeMode: 'cover' },
  overlay:    {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  name:       { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 'auto' },
});