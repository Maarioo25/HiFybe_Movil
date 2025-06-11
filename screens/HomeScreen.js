import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator, ScrollView
} from 'react-native';
import { userService } from '../services';
import { reverseGeocode } from '../utils/geocode';
import * as Location from 'expo-location';

export default function HomeScreen() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ciudadDetectada, setCiudadDetectada] = useState(null);

  const obtenerUbicacion = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso de ubicación denegado');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    return { latitude, longitude };
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getCurrentUser();
        const profile = data.usuario ?? data;
        setUsuario(profile);

        // Solo si compartir_ubicacion está activo
        if (profile.compartir_ubicacion) {
          const coords = await obtenerUbicacion();
          if (coords) {
            const { latitude, longitude } = coords;

            // Solo actualiza si las coordenadas son válidas
            if (latitude !== 0 || longitude !== 0) {
              await userService.actualizarUbicacion(latitude, longitude);
              const ciudad = await reverseGeocode(latitude, longitude);
              setCiudadDetectada(ciudad);
            }
          }
        }
      } catch (err) {
        console.error('[HomeScreen] Error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  const redes = usuario.redes || {};
  const generos = usuario.generos_favoritos || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {usuario.foto_perfil ? (
        <Image source={{ uri: usuario.foto_perfil }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: '#333' }]} />
      )}

      <Text style={styles.title}>¡Hola, {usuario.nombre}!</Text>
      <Text style={styles.email}>{usuario.email}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>ID:</Text>
        <Text style={styles.infoValue}>{usuario._id}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Proveedor:</Text>
        <Text style={styles.infoValue}>{usuario.auth_proveedor}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Biografía:</Text>
        <Text style={styles.infoValue}>{usuario.biografia || '—'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Géneros favoritos:</Text>
        <Text style={styles.infoValue}>{generos.join(', ') || '—'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Redes sociales:</Text>
        <Text style={styles.infoValue}>
          {Object.entries(redes).map(([key, val]) => `${key}: @${val}`).join(' | ') || '—'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Ciudad:</Text>
        <Text style={styles.infoValue}>{usuario.ciudad || '—'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Ubicación:</Text>
        <Text style={styles.infoValue}>
          {usuario.compartir_ubicacion
            ? (ciudadDetectada || 'Cargando ciudad...')
            : 'Oculta por privacidad'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  email: {
    fontSize: 17,
    color: 'gray',
    marginTop: 4,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 16,
    color: 'white',
  },
});
