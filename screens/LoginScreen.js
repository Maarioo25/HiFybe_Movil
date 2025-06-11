import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';


WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = await AsyncStorage.getItem('token');
      const expirationDate = await AsyncStorage.getItem('expirationDate');
      if (token && expirationDate && Date.now() < parseInt(expirationDate)) {
        navigation.navigate('Main');
      } else {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('expirationDate');
      }
    };
    checkTokenValidity();

    const handleRedirect = async (event) => {
      const url = event.url;
      console.log('[Redirect] URL:', url);

      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === 'spotify-auth-callback') {
          const token = parsedUrl.searchParams.get('token');
          if (token) {
            await AsyncStorage.setItem('token', token);
            const expiration = Date.now() + 6 * 60 * 60 * 1000;
            await AsyncStorage.setItem('expirationDate', expiration.toString());
            navigation.navigate('Main');
          }
        }
      } catch (err) {
        console.error('[Redirect] Error al manejar redirección:', err);
      }
    };

    const subscription = Linking.addEventListener('url', handleRedirect);
    return () => subscription.remove();
  }, []);

  const iniciarLoginSpotify = async () => {
    const loginUrl = 'https://api.mariobueno.info/usuarios/spotify?mobile=true';
    await Linking.openURL(loginUrl);
  };

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <SafeAreaView>
        <View style={{ height: 80 }} />
        <Entypo style={{ textAlign: 'center' }} name="spotify" size={80} color="white" />
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 40, marginTop: 40 }}>HiFybe</Text>
        <View style={{ height: 80 }} />

        <Pressable onPress={iniciarLoginSpotify} style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold', backgroundColor: '#1DB954', padding: 10, borderRadius: 30 }}>
            Login with Spotify
          </Text>
        </Pressable>

        <Pressable style={{ marginTop: 20 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>Login with Email</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
