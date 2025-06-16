import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, ImageBackground, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, SafeAreaView,
  StatusBar, Platform
} from 'react-native';
import { userService, friendService } from '../services';
import { LinearGradient } from 'expo-linear-gradient';
import AddFriendsModal from '../components/AddFriendsModal';
import { useFocusEffect } from '@react-navigation/native';

export default function FriendsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('amigos');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        setLoading(true);
        try {
          const usuario = await userService.getCurrentUser();
          if (!isActive) return;
          setUserId(usuario._id);
          const [amigos, solicitudes] = await Promise.all([
            friendService.getFriends(usuario._id),
            friendService.getRequests(usuario._id),
          ]);
          if (isActive) {
            setFriends(amigos);
            setRequests(solicitudes);
          }
        } catch (err) {
          if (isActive) Alert.alert('Error', 'No se pudieron cargar tus amigos/solicitudes');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleRequest = async (id, estado) => {
    try {
      await friendService.respondFriendRequest(id, estado);
      const nuevas = requests.filter((s) => s._id !== id);
      setRequests(nuevas);
      if (estado === 'aceptada') {
        const actualizados = await friendService.getFriends(userId);
        setFriends(actualizados);
      }
    } catch {
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    }
  };

  const handleAddFriendPress = () => {
    setModalVisible(true);
  };

  const renderFriend = ({ item }) => {
    if (item._id === 'add') {
      return (
        <TouchableOpacity style={styles.addCard} onPress={handleAddFriendPress}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('FriendDetail', { friendId: item.id || item._id })}
      >
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
  };

  const renderRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.requestName}>{item.de_usuario_id?.nombre || 'Usuario desconocido'}</Text>
      <View style={styles.requestButtons}>
        <TouchableOpacity
          style={[styles.requestButton, { backgroundColor: '#4ECCA3' }]}
          onPress={() => handleRequest(item._id, 'aceptada')}
        >
          <Text style={styles.requestButtonText}>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.requestButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => handleRequest(item._id, 'rechazada')}
        >
          <Text style={styles.requestButtonText}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AddFriendsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        currentUserId={userId}
        existingFriends={friends}
        onSuccess={async () => {
          try {
            const [amigos, solicitudes] = await Promise.all([
              friendService.getFriends(userId),
              friendService.getRequests(userId),
            ]);
            setFriends(amigos);
            setRequests(solicitudes);
          } catch (err) {
            console.error('Error al recargar amigos:', err);
          }
        }}
      />

      <StatusBar barStyle="light-content" backgroundColor="#1E4E4E" />
      <View style={styles.innerWrapper}>
        <View style={styles.headerSpacer} />
        <Text style={styles.title}>Amigos</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'amigos' && styles.tabActive]}
            onPress={() => setActiveTab('amigos')}
          >
            <Text style={[styles.tabText, activeTab === 'amigos' && styles.tabTextActive]}>
              Amigos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'solicitudes' && styles.tabActive]}
            onPress={() => setActiveTab('solicitudes')}
          >
            <Text style={[styles.tabText, activeTab === 'solicitudes' && styles.tabTextActive]}>
              Solicitudes
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECCA3" />
          </View>
        ) : activeTab === 'amigos' ? (
          <FlatList
            data={[...friends, { _id: 'add' }]}
            keyExtractor={(item, index) => item._id || `item-${index}`}
            renderItem={renderFriend}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : requests.length === 0 ? (
          <Text style={styles.alert}>No tienes solicitudes pendientes</Text>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(r) => r._id}
            renderItem={renderRequest}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4E4E' },
  innerWrapper: { flex: 1, paddingHorizontal: 16 },
  headerSpacer: { height: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#4ECCA3',
  },
  tabActive: {
    backgroundColor: '#4ECCA3',
  },
  tabText: {
    color: '#4ECCA3',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#1E4E4E',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  alert: { color: '#B2F5EA', textAlign: 'center', marginTop: 20 },
  card: { height: 100, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  imageBackground: { flex: 1, justifyContent: 'center' },
  imageStyle: { resizeMode: 'cover' },
  overlay: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 'auto' },
  addCard: {
    height: 100,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#2A6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 36,
    color: '#4ECCA3',
    fontWeight: 'bold',
  },
  requestCard: {
    backgroundColor: '#2A6B6B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  requestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});