import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../services';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// Componente de perfil
export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState('');
  const [foto, setFoto] = useState('');
  const [bio, setBio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [generos, setGeneros] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  // Cargar perfil
  useEffect(() => {
    (async () => {
      try {
        const u = await userService.getCurrentUser();
        setUser(u);
        setNombre(u.nombre || '');
        setFoto(u.foto_perfil || '');
        setBio(u.biografia || '');
        setCiudad(u.ciudad || '');
        setGeneros((u.generos_favoritos || []).join(', '));
        setInstagram(u.redes?.instagram || '');
        setTwitter(u.redes?.twitter || '');
        setTiktok(u.redes?.tiktok || '');
      } catch (err) {
        console.error('Error cargando usuario', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Mostrar toast
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

  // Guardar perfil
  const guardarPerfil = async () => {
    try {
      await Promise.all([
        userService.updateProfile(user._id, { nombre, biografia: bio, foto_perfil: foto }),
        userService.updatePreferencias(user._id, { ciudad, generos_favoritos: generos.split(',').map(g => g.trim()) }),
        userService.updateRedesSociales(user._id, { instagram, twitter, tiktok })
      ]);
      mostrarToast('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error guardando perfil', err);
      Alert.alert('Error al guardar perfil');
    }
  };

  // Elegir foto
  const elegirFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado para acceder a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) {
      const file = {
        uri: result.assets[0].uri,
        name: 'foto.jpg',
        type: 'image/jpeg'
      };
      try {
        const res = await userService.updateFotoPerfil(user._id, file);
        setFoto(res.foto_perfil);
      } catch (err) {
        console.error('Error subiendo foto', err);
        Alert.alert('Error subiendo imagen');
      }
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    await AsyncStorage.multiRemove(['token', 'spotifyToken']);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return (
      <View style={styles.loader}><ActivityIndicator size="large" color="#4ECCA3" /></View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[styles.toast, { opacity: toastAnim }]}> 
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
        <Text style={styles.title}>Tu perfil</Text>

        <TouchableOpacity style={styles.avatarWrapper} onPress={elegirFoto}>
          <Image
            source={{ uri: foto || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <View style={styles.editOverlay}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#88C5B5"
        />

        <Text style={styles.label}>Biografía</Text>
        <TextInput
          style={styles.input}
          placeholder="Biografía"
          value={bio}
          onChangeText={setBio}
          multiline
          placeholderTextColor="#88C5B5"
        />

        <Text style={styles.label}>Ciudad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ciudad"
          value={ciudad}
          onChangeText={setCiudad}
          placeholderTextColor="#88C5B5"
        />

        <Text style={styles.label}>Géneros favoritos</Text>
        <TextInput
          style={styles.input}
          placeholder="Géneros favoritos (separados por coma)"
          value={generos}
          onChangeText={setGeneros}
          placeholderTextColor="#88C5B5"
        />

        <Text style={styles.subtitle}>Redes sociales</Text>

        <View style={styles.iconInputWrapper}>
          <FontAwesome name="instagram" size={18} color="#B2F5EA" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Instagram"
            value={instagram}
            onChangeText={setInstagram}
            placeholderTextColor="#88C5B5"
          />
        </View>

        <View style={styles.iconInputWrapper}>
          <FontAwesome name="twitter" size={18} color="#B2F5EA" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Twitter"
            value={twitter}
            onChangeText={setTwitter}
            placeholderTextColor="#88C5B5"
          />
        </View>

        <View style={styles.iconInputWrapper}>
          <FontAwesome name="music" size={18} color="#B2F5EA" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="TikTok"
            value={tiktok}
            onChangeText={setTiktok}
            placeholderTextColor="#88C5B5"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={guardarPerfil}>
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#1E4E4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: '#1E4E4E',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B2F5EA',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    color: '#B2F5EA',
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#2A6B6B',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flex: 1
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4ECCA3',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0D2B2B',
    borderRadius: 15,
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#4ECCA3',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#1E4E4E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
});
