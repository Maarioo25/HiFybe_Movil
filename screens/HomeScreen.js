import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  StatusBar
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, friendService, notificationService } from '../services';
import { usePlayer } from '../context/PlayerContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MiniPlayerBar from '../components/MiniPlayerBar';

const BASE_URL = 'https://api.mariobueno.info';

MapboxGL.setAccessToken('pk.eyJ1IjoibWFhcmlvbzI1IiwiYSI6ImNtYnNkYndrODA1cjUyanNlMzVscHZoNnYifQ.1X7w2okP-pUP9R00f-JEyw');

export default function HomeScreen() {
  const { setTrack } = usePlayer();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ubicacion, setUbicacion] = useState([-3.7635, 40.3270]);
  const [usuariosCercanos, setUsuariosCercanos] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarUbicacion, setMostrarUbicacion] = useState(true);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }
  }, []);

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({});
    return [loc.coords.longitude, loc.coords.latitude];
  };

  const formatUri = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
  };

  const actualizarMapa = async () => {
    try {
      const coords = await obtenerUbicacion();
      if (!coords) return;
      setUbicacion(coords);
      await userService.actualizarUbicacion(coords[1], coords[0]);
      const res = await userService.getUsuariosCercanos(coords[1], coords[0]);
      setUsuariosCercanos(res);
      cameraRef.current?.setCamera({
        centerCoordinate: coords,
        zoomLevel: 13,
        animationDuration: 1000
      });
      setMostrarUbicacion(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await friendService.sendRequest(usuario._id, userId);
      await notificationService.crear(userId, `${usuario.nombre} te ha enviado una solicitud`);
      Alert.alert('¡Solicitud enviada!', 'Has solicitado seguir a este usuario.');
    } catch {
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };

  const reproducirCancion = async (trackUri) => {
    try {
      const token = await AsyncStorage.getItem('spotifyToken');
      if (!token) throw new Error('Token de Spotify no disponible');

      const res = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri] })
      });

      if (res.status === 204) {
        console.log('▶️ Reproducción iniciada');
      } else {
        const msg = await res.text();
        console.error('[Spotify Error]', res.status, msg);
        Alert.alert('Error', 'No se pudo iniciar la reproducción');
      }
    } catch (err) {
      console.error('Error al reproducir:', err);
      Alert.alert('Error', 'No se pudo reproducir la canción');
    }
  };

  const handleMarkerPress = async (u) => {
    try {
      const song = await userService.getCancionUsuario(u._id);
      console.log("song", song);
      setUsuarioSeleccionado({ ...u, song });
    } catch {
      Alert.alert('Error', 'No se pudo cargar la canción');
    }
  };

  const handleToggleUbicacion = () => {
    if (mostrarUbicacion) {
      setUsuariosCercanos([]);
      setUsuarioSeleccionado(null);
    } else {
      actualizarMapa();
    }
    setMostrarUbicacion(!mostrarUbicacion);
  };

  const handleCenter = () => {
    cameraRef.current?.setCamera({
      centerCoordinate: ubicacion,
      zoomLevel: 13,
      animationDuration: 500
    });
  };
  const handleRefresh = () => actualizarMapa();

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getCurrentUser();
        const profile = data.usuario ?? data;
        setUsuario(profile);
        if (profile.compartir_ubicacion) {
          await actualizarMapa();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4ECCA3" />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E4E4E" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../public/logo.png')} style={styles.logo} />
        <Text style={styles.title}>¡Hola, {usuario.nombre}!</Text>
      </View>
      <Text style={styles.subtitle}>
        Mira lo que está escuchando la gente cerca tuyo
      </Text>

      {/* Mapa */}
      <View style={styles.mapWrapper}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Dark}
          logoEnabled={false}
          compassEnabled={false}
          scaleBarEnabled={false}
          attributionEnabled={false}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            zoomLevel={13}
            centerCoordinate={ubicacion}
          />

          {mostrarUbicacion && (
            <MapboxGL.MarkerView
              id="mi-ubicacion"
              coordinate={ubicacion}
            >
              <TouchableOpacity onPress={handleCenter} activeOpacity={0.7}>
                <View style={styles.customMarkerWrapper}>
                  <Image
                    source={{
                      uri:
                        formatUri(usuario.foto_perfil) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          usuario.nombre
                        )}`
                    }}
                    style={styles.customMarkerImage}
                  />
                </View>
              </TouchableOpacity>
            </MapboxGL.MarkerView>
          )}

          {mostrarUbicacion &&
            usuariosCercanos.map(u =>
              u._id !== usuario._id && u.ubicacion?.coordinates ? (
                <MapboxGL.MarkerView
                  key={u._id}
                  id={u._id}
                  coordinate={[
                    u.ubicacion.coordinates[0],
                    u.ubicacion.coordinates[1]
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleMarkerPress(u)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.customMarkerWrapper}>
                      <Image
                        source={{
                          uri:
                            formatUri(u.foto_perfil) ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.nombre
                            )}`
                        }}
                        style={styles.customMarkerImage}
                      />
                    </View>
                  </TouchableOpacity>
                </MapboxGL.MarkerView>
              ) : null
            )}
        </MapboxGL.MapView>

        {!mostrarUbicacion && (
          <View style={styles.overlayMensaje}>
            <Text style={styles.overlayTexto}>Tu ubicación está oculta</Text>
          </View>
        )}

        {/* Controles */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenter}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleFloatingButton}
          onPress={handleToggleUbicacion}
        >
          <MaterialCommunityIcons
            name={mostrarUbicacion ? 'eye' : 'eye-off'}
            size={20}
            color="#1E4E4E"
          />
        </TouchableOpacity>

        {/* Popup usuario */}
        {usuarioSeleccionado && (
          <View style={styles.popupCard}>
          {/* Foto de perfil */}
          <Image
            source={{
              uri:
                formatUri(usuarioSeleccionado.foto_perfil) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  usuarioSeleccionado.nombre
                )}`
            }}
            style={styles.profileImage}
          />
        
          {/* Info textual */}
          <View style={styles.popupText}>
            <Text style={styles.popupName} numberOfLines={1}>
              {usuarioSeleccionado.nombre}
            </Text>
            <Text style={styles.popupSong} numberOfLines={1}>
              {usuarioSeleccionado.song?.nombre || 'No está escuchando nada'}
            </Text>
            <Text style={styles.popupArtist} numberOfLines={1}>
              {usuarioSeleccionado.song?.artista || ''}
            </Text>
          </View>
        
          {/* Imagen de la canción */}
          {usuarioSeleccionado.song?.imagen && (
            <Image
              source={{ uri: usuarioSeleccionado.song.imagen }}
              style={styles.songImage}
            />
          )}
        
          {/* Botones */}
          <View style={styles.buttonsContainer}>
            {usuarioSeleccionado.song?.uri && (
              console.log("🚀 usuarioSeleccionado.song.uri:", usuarioSeleccionado.song.uri),
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  const formattedTrack = {
                    name: usuarioSeleccionado.song?.nombre,
                    artists: [{ name: usuarioSeleccionado.song?.artista }],
                    album: { images: [{ url: usuarioSeleccionado.song?.imagen }] },
                    uri: usuarioSeleccionado.song?.uri,
                    duration_ms: 180000,
                    addedAt: Date.now()
                  };

                  console.log("📤 Enviando track al contexto:", formattedTrack);
                  setTrack(formattedTrack);          
                  reproducirCancion(usuarioSeleccionado.song?.uri); 
                }}
              >
                <Text style={styles.actionText}>Escuchar</Text>
              </TouchableOpacity>

            )}
            <TouchableOpacity style={styles.followButton} onPress={() => handleFollow(usuarioSeleccionado._id)}>
              <Text style={styles.actionText}>Seguir</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        )}
      </View>
      <View style={styles.playerSpacer} />
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E4E4E' },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#1E4E4E',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: { color: '#FFFFFF', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: {
    fontSize: 12,
    color: '#B2F5EA',
    marginHorizontal: 16,
    marginBottom: 8
  },
  mapWrapper: { flex: 1, margin: 16, borderRadius: 15, overflow: 'hidden' },
  map: { flex: 1 },
  toggleFloatingButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4ECCA3',
    padding: 6,
    borderRadius: 20,
    elevation: 3
  },
  overlayMensaje: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlayTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: '#1E4E4EAA',
    padding: 12,
    borderRadius: 10
  },
  centerButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#4ECCA3',
    padding: 12,
    borderRadius: 30,
    elevation: 5
  },
  refreshButton: {
    position: 'absolute',
    bottom: 75,
    right: 15,
    backgroundColor: '#4ECCA3',
    padding: 10,
    borderRadius: 30,
    elevation: 5
  },
  customMarkerWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff'
  },
  customMarkerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  popupCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 100,
    backgroundColor: '#2A6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    elevation: 4
  },
  profileImage: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  popupText: { flex: 1, marginVertical: 8 },
  popupName: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  popupSong: { color: '#B2F5EA', fontSize: 12, marginTop: 4 },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 8
  },
  actionButton: {
    backgroundColor: '#4ECCA3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 8
  },
  followButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18
  },
  actionText: { color: '#1E4E4E', fontSize: 12, fontWeight: 'bold' },
  playerSpacer: { height: 80 },
  popupArtist: {
    color: '#B2F5EA',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.9
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#fff'
  },
  songName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4
  },
  songArtist: {
    color: '#B2F5EA',
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9
  },
});
