import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Componente de registro
export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const scaleRegister = useRef(new Animated.Value(1)).current;
  const spring = (toValue) =>
    Animated.spring(scaleRegister, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();

  // Validar y registrar
  const validateAndRegister = async () => {
    if (!nombre.trim() || !apellidos.trim() || !email.trim() || !password || !repeatPassword) {
      return Alert.alert('Error', 'Rellena todos los campos obligatorios.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return Alert.alert('Error', 'Introduce un correo válido.');
    }
    if (password.length < 6 || password.length > 12) {
      return Alert.alert('Error', 'La contraseña debe tener 6–12 caracteres.');
    }
    if (password !== repeatPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden.');
    }
    if (!acceptedTerms) {
      return Alert.alert('Error', 'Acepta los términos y condiciones.');
    }

    try {
      const res = await fetch(
        'https://api.mariobueno.info/usuarios/register?mobile=true',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: nombre.trim(),
            apellidos: apellidos.trim(),
            email: email.trim().toLowerCase(),
            password,
            mobile: true,
          }),
        }
      );
      const data = await res.json();
      if (![200, 202].includes(res.status)) {
        throw new Error(data.mensaje || 'Registro fallido');
      }
      
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        const exp = Date.now() + 6 * 3600000;
        await AsyncStorage.setItem('expirationDate', exp.toString());
      }
      
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Registro fallido', err.message);
    }
  };

  return (
    <LinearGradient
      colors={['#1E4E4E', '#2A6B6B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.shadowWrapper}>
            <View style={styles.headerCard}>
              <Image
                source={require('../public/logo.png')}
                style={styles.logoLarge}
              />
              <Text style={styles.title}>Regístrate</Text>
              <Text style={styles.subtitle}>
                Únete y conecta con la música
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={apellidos}
              onChangeText={setApellidos}
            />
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
            <TextInput
              style={styles.input}
              placeholder="Repetir contraseña"
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry
              value={repeatPassword}
              onChangeText={setRepeatPassword}
            />

            <Pressable
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text style={styles.termsText}>
                Acepto los{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('Terms')}
                >
                  términos y condiciones
                </Text>
              </Text>
            </Pressable>

            <Animated.View
              style={{ transform: [{ scale: scaleRegister }], width: '100%' }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.btnRegister,
                  pressed && styles.btnPressed,
                ]}
                onPressIn={() => spring(0.95)}
                onPressOut={() => spring(1)}
                onPress={validateAndRegister}
              >
                <Text style={styles.btnRegisterText}>
                  Crear cuenta
                </Text>
              </Pressable>
            </Animated.View>

            <Text style={styles.loginPrompt}>
              ¿Ya tienes una cuenta?{' '}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                Inicia sesión
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
  },
  scroll: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  shadowWrapper: {
    alignItems: 'center',
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
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 50,
    width: width * 0.85,
    alignItems: 'center',
    overflow: Platform.OS === 'ios' ? 'hidden' : 'visible',
  },
  logoLarge: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  form: {
    width: width * 0.85,
    alignItems: 'center',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ECCA3',
    borderColor: '#4ECCA3',
  },
  termsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  btnRegister: {
    backgroundColor: '#2A6B6B',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnRegisterText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  btnPressed: { opacity: 0.8 },
  loginPrompt: {
    color: 'white',
    marginTop: 20,
    fontSize: 14,
  },
  loginLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
