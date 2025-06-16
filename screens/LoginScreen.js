// screens/LoginScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  Alert,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const scaleLogin = useRef(new Animated.Value(1)).current;
  const scaleGoogle = useRef(new Animated.Value(1)).current;
  const scaleSpotify = useRef(new Animated.Value(1)).current;

  // Animaciones
  const animateIn = (scale) => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  // Animaciones
  const animateOut = (scale) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  // Verificar token
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      const expiry = await AsyncStorage.getItem('expirationDate');
      if (token && expiry && Date.now() < parseInt(expiry, 10)) {
        navigation.replace('Main');
      } else {
        await AsyncStorage.multiRemove(['token', 'expirationDate']);
      }
    };
    checkToken();

    // Manejar redirección
    const handleRedirect = async ({ url }) => {
      try {
        const parsed = new URL(url);
        if (parsed.hostname === 'spotify-auth-callback') {
          const token = parsed.searchParams.get('token');
          const spotifyToken = parsed.searchParams.get('spotify_token');
    
          if (token) {
            await AsyncStorage.setItem('token', token);
            const exp = Date.now() + 6 * 3600000;
            await AsyncStorage.setItem('expirationDate', exp.toString());
          }
    
          if (spotifyToken) {
            await AsyncStorage.setItem('spotifyToken', spotifyToken);
          }
    
          console.log('Token = ' + token);
          console.log('SpotifyToken = ' + spotifyToken);
          navigation.replace('Main');
        }
      } catch (err) {
        console.warn('Redirect error', err);
      }
    };
    
    const sub = Linking.addEventListener('url', handleRedirect);
    return () => sub.remove();
  }, [navigation]);

  // Navegar a la pantalla de registro
  const onRegister = () => navigation.navigate('Register');

  // Login manual con backend
  const onEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Introduce correo y contraseña');
    }
    try {
      const res = await fetch('https://api.mariobueno.info/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mobile: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Credenciales inválidas');
      }
      const { token } = data;
      // Guardar token y expiración (6h)
      await AsyncStorage.setItem('token', token);
      const exp = Date.now() + 6 * 3600000;
      await AsyncStorage.setItem('expirationDate', exp.toString());
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const onGoogleLogin = () =>
    Linking.openURL('https://api.mariobueno.info/usuarios/google?mobile=true');
  const onSpotifyLogin = () =>
    Linking.openURL('https://api.mariobueno.info/usuarios/spotify?mobile=true');

  return (
    <LinearGradient colors={['#1E4E4E', '#2A6B6B']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.shadowWrapper}>
          <View style={styles.headerCard}>
            <Image source={require('../public/logo.png')} style={styles.logo} />
            <Text style={styles.title}>HiFybe</Text>
            <Text style={styles.subtitle}>
              Conecta con la música{"\n"}y con quienes la aman
            </Text>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="rgba(255,255,255,0.7)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="rgba(255,255,255,0.7)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Animated.View style={{ transform: [{ scale: scaleLogin }], width: '100%' }}>
            <Pressable
              style={({ pressed }) => [styles.btnLogin, pressed && styles.btnPressed]}
              onPress={onEmailLogin}
              onPressIn={() => animateIn(scaleLogin)}
              onPressOut={() => animateOut(scaleLogin)}
            >
              <Text style={styles.btnLoginText}>Iniciar sesión</Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.registerText} onPress={onRegister}>
            ¿Todavía no tienes una cuenta?{' '}
            <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </View>

        <View style={styles.socials}>
          {/* Google a la izquierda */}
          <Animated.View style={{ transform: [{ scale: scaleGoogle }], width: '48%' }}>
            <Pressable
              onPress={onGoogleLogin}
              onPressIn={() => animateIn(scaleGoogle)}
              onPressOut={() => animateOut(scaleGoogle)}
              style={({ pressed }) => [
                styles.socialBtn,
                { backgroundColor: '#DB4437' },
                pressed && styles.btnPressed,
              ]}
            >
              <FontAwesome name="google" size={20} color="white" style={styles.socialIcon} />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
          </Animated.View>

          {/* Spotify a la derecha */}
          <Animated.View style={{ transform: [{ scale: scaleSpotify }], width: '48%' }}>
            <Pressable
              onPress={onSpotifyLogin}
              onPressIn={() => animateIn(scaleSpotify)}
              onPressOut={() => animateOut(scaleSpotify)}
              style={({ pressed }) => [
                styles.socialBtn,
                { backgroundColor: '#1DB954' },
                pressed && styles.btnPressed,
              ]}
            >
              <FontAwesome name="spotify" size={20} color="white" style={styles.socialIcon} />
              <Text style={styles.socialText}>Spotify</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 , paddingVertical: 30},
  safe: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 40,
    alignItems: 'center',
  },
  shadowWrapper: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 30,
  },
  headerCard: {
    backgroundColor: '#2A6B6B',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: width * 0.85,
    alignItems: 'center',
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 16,
    marginBottom: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    width: width * 0.85,
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 16,
  },
  btnLogin: {
    backgroundColor: '#2A6B6B',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnLoginText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  registerText: {
    color: 'white',
    fontSize: 14,
    marginTop: 6,
  },
  registerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  btnPressed: { opacity: 0.8 },
  socials: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.85,
    marginTop: 5,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  socialIcon: {
    marginRight: 8,
  },
  socialText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
