import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userService, friendService, notificationService } from '../services';

export default function AddFriendModal({ visible, onClose, existingFriends, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // useEffect para obtener los usuarios
  useEffect(() => {
    if (!visible) return;
  
    // Función para obtener los usuarios
    const fetchUsers = async () => {
      try {
        const user = await userService.getCurrentUser();
        console.log('Current user:', user);
        setCurrentUser(user);
  
        const all = await userService.getAllUsers();
        console.log(`Total users fetched: ${all.length}`);
  
        const existing = await friendService.getFriends(user._id);
        console.log(`Existing friends (${existing.length}):`, existing.map(f => f._id));
  
        const solicitudesRecibidas = await friendService.getRequests(user._id);
        console.log(`Pending requests (${solicitudesRecibidas.length}):`, solicitudesRecibidas);
  
        const existingIds = new Set(
            existing
              .map(f => f.id)
              .filter(id => id !== undefined && id !== null)
              .map(id => id.toString())
          );
          
        const solicitadosIds = new Set(
          solicitudesRecibidas
            .map(s => {
              const deId = s?.de_usuario_id?._id ? s.de_usuario_id._id.toString() : null;
              const paraId = s?.para_usuario_id?._id ? s.para_usuario_id._id.toString() : null;
              if (!deId || !paraId) {
                console.warn('Missing de_usuario_id or para_usuario_id in solicitud:', s);
                return null;
              }
              return deId === user._id.toString() ? paraId : deId;
            })
            .filter(id => id !== null)
        );
  
        const filtered = all.filter(u => {
          if (!u._id) {
            console.warn('User without _id found:', u);
            return false;
          }
          const uId = u._id.toString();
          const userId = user._id.toString();
  
          const passFilter = uId !== userId && !existingIds.has(uId) && !solicitadosIds.has(uId);
          if (!passFilter) {
            console.log(`Excluding user ${uId} (${u.nombre})`);
          }
          return passFilter;
        });
  
        setUsers(filtered);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
  
    fetchUsers();
  }, [visible]);

  // Función para enviar una solicitud de amistad
  const handleSendRequest = async (targetId, targetName) => {
    try {
      console.log("Enviando solicitud de amistad...");
      console.log("  - Emisor ID:", currentUser._id);
      console.log("  - Receptor ID:", targetId);
  
      const result = await friendService.sendRequest(currentUser._id, targetId);
      console.log("Solicitud enviada:", result);
  
      await notificationService.crear(
        targetId,
        `${currentUser.nombre} has sent you a friend request.`
      );
      console.log("🔔 Notificación enviada");
  
      onSuccess && onSuccess();
      setUsers(prev => prev.filter(u => u._id !== targetId));
    } catch (err) {
      console.error("Error al enviar solicitud:", err?.response?.data || err);
    }
  };
  
  // Filtrar usuarios según la búsqueda
  const filteredUsers = users.filter(u =>
    u.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Add a Friend</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#4ECCA3" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Search users..."
            placeholderTextColor="#88C5B5"
            value={search}
            onChangeText={setSearch}
          />

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Image
                    source={{ uri: item.foto_perfil?.startsWith('http') ? item.foto_perfil : `https://api.mariobueno.info${item.foto_perfil}` }}
                    style={styles.avatar}
                  />
                  <Text style={styles.username}>{item.nombre}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleSendRequest(item._id, item.nombre)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E4E4E',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#2A6B6B',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#2A6B6B',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4ECCA3',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#1E4E4E',
    fontWeight: 'bold',
  },
});
