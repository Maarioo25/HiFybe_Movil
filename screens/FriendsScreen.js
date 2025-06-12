// FriendsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ImageBackground, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert,
  SafeAreaView, StatusBar, Platform
} from 'react-native';
import { userService, friendService } from '../services';
import { LinearGradient } from 'expo-linear-gradient';

export default function FriendsScreen() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarAmigos = async () => {
      try {
        const usuario = await userService.getCurrentUser();
        const lista = await friendService.getFriends(usuario._id);
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
      <ImageBackground
        source={{
          uri: item.foto_perfil?.startsWith('http')
            ? item.foto_perfil
            : `https://api.mariobueno.info${item.foto_perfil}`,
        }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['rgba(30,78,78,0)', 'rgba(30,78,78,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.overlay}
        >
          <Text style={styles.name}>{item.nombre || 'Usuario'}</Text>
        </LinearGradient>
      </ImageBackground>
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
        <Text style={styles.title}>Tus amigos</Text>
        {friends.length === 0 ? (
          <Text style={styles.alert}>No tienes amigos aún 😢</Text>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(f, index) => f._id || `amigo-${index}`}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#1E4E4E' },
  innerWrapper: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  headerSpacer: {
    height: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 32,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title:      { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: '#FFFFFF' },
  alert:      { color: '#B2F5EA', textAlign: 'center', marginTop: 20 },
  card:       { height: 100, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  imageBackground: { flex: 1, justifyContent: 'center' },
  imageStyle: { resizeMode: 'cover' },
  overlay:    { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  name:       { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 'auto' },
});