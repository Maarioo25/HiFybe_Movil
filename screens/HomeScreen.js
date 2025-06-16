// HomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  PermissionsAndroid
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { userService } from '../services';
import { StatusBar } from 'react-native';

MapboxGL.setAccessToken("pk.eyJ1IjoibWFhcmlvbzI1IiwiYSI6ImNtYnNkYndrODA1cjUyanNlMzVscHZoNnYifQ.1X7w2okP-pUP9R00f-JEyw");

const screen = Dimensions.get('window');

export default function HomeScreen() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ubicacion, setUbicacion] = useState([-3.7635, 40.3270]);
  const [usuariosCercanos, setUsuariosCercanos] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }
  }, []);

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({});
    return [loc.coords.longitude, loc.coords.latitude];
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
        animationDuration: 1000,
      });
    } catch (err) {
      console.error('[ActualizarMapa]', err);
    }
  };

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
        console.error('[HomeScreen] Error:', err.response?.data || err.message);
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
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#1E4E4E" barStyle="light-content" />
      <View style={styles.header}>
        <Image source={require('../public/logo.png')} style={styles.logo} />
      </View>

      <Text style={styles.title}>¡Hola, {usuario.nombre}!</Text>
      <Text style={styles.subtitle}>Mira lo que está escuchando la gente cerca tuyo</Text>

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

          {usuario.foto_perfil && (
            <MapboxGL.PointAnnotation
              id="mi-ubicacion"
              coordinate={ubicacion}
            >
              <View style={styles.customMarkerWrapper}>
                <Image
                  source={{ uri: usuario.foto_perfil }}
                  style={styles.customMarkerImage}
                />
              </View>
            </MapboxGL.PointAnnotation>
          )}

          {usuariosCercanos.map((u) => {
            if (u._id === usuario._id) return null;
            if (!u.ubicacion?.coordinates) return null;
            const uri = u.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}`;
            return (
              <MapboxGL.PointAnnotation
                key={u._id}
                id={`marker-${u._id}`}
                coordinate={[u.ubicacion.coordinates[0], u.ubicacion.coordinates[1]]}
              >
                <View style={styles.customMarkerWrapper}>
                  <Image source={{ uri }} style={styles.customMarkerImage} />
                </View>
              </MapboxGL.PointAnnotation>
            );
          })}
        </MapboxGL.MapView>

        <TouchableOpacity
          style={styles.centerButton}
          onPress={async () => {
            const coords = await obtenerUbicacion();
            if (!coords) return;
            setUbicacion(coords);
            cameraRef.current?.setCamera({
              centerCoordinate: coords,
              zoomLevel: 13,
              animationDuration: 1000,
            });
          }}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={actualizarMapa}
        >
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#1E4E4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#1E4E4E',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B2F5EA',
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
  mapWrapper: {
    position: 'relative',
    width: screen.width - 40,
    height: 450,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#4ECCA3',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 75,
    right: 15,
    backgroundColor: '#4ECCA3',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  customMarkerWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  customMarkerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
