import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FriendsScreen from './screens/FriendsScreen';
import FriendDetailScreen from './screens/FriendDetailScreen';
import PlaylistsScreen from './screens/PlaylistsScreen';
import PlaylistDetailScreen from './screens/PlaylistDetailScreen';
import ChatsScreen from './screens/ChatsScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import MiniPlayerBar from './components/MiniPlayerBar';
import FriendPlaylistDetailScreen from './screens/FriendPlaylistDetailScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PlaylistsStack = createNativeStackNavigator();
const ChatsStack = createNativeStackNavigator();
const FriendsStack = createNativeStackNavigator();

// Navegador de playlists
function PlaylistsStackNavigator() {
  return (
    <PlaylistsStack.Navigator screenOptions={{ headerShown: false }}>
      <PlaylistsStack.Screen name="PlaylistsMain" component={PlaylistsScreen} />
      <PlaylistsStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
    </PlaylistsStack.Navigator>
  );
}

// Navegador de chats
function ChatsStackNavigator() {
  return (
    <ChatsStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatsStack.Screen name="ChatsMain" component={ChatsScreen} />
      <ChatsStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatsStack.Navigator>
  );
}

// Navegador de amigos
function FriendsStackNavigator() {
  return (
    <FriendsStack.Navigator screenOptions={{ headerShown: false }}>
      <FriendsStack.Screen name="FriendsMain" component={FriendsScreen} />
      <FriendsStack.Screen name="FriendDetail" component={FriendDetailScreen} />
      <FriendsStack.Screen name="FriendPlaylistDetail" component={FriendPlaylistDetailScreen} />
    </FriendsStack.Navigator>
  );
}

// Navegador de tabs
function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#1E4E4E' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#4ECCA3',
          tabBarInactiveTintColor: '#88C5B5',
          tabBarStyle: {
            backgroundColor: '#1F3F3F',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            height: 65 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            paddingTop: 5,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Entypo name="home" size={size} color={color} />;
            if (route.name === 'Friends') return <Ionicons name="people" size={size} color={color} />;
            if (route.name === 'Playlists') return <AntDesign name="playcircleo" size={size} color={color} />;
            if (route.name === 'Chats') return <Entypo name="chat" size={size} color={color} />;
            if (route.name === 'Profile') return <Entypo name="user" size={size} color={color} />;
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.7}
              style={[props.style, { borderRadius: 20, overflow: 'hidden' }]}
              android_ripple={{
                color: 'rgba(255, 255, 255, 0.15)',
                radius: 20,
                borderless: false,
              }}
            />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Friends" component={FriendsStackNavigator} />
        <Tab.Screen name="Playlists" component={PlaylistsStackNavigator} />
        <Tab.Screen name="Chats" component={ChatsStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <MiniPlayerBar />
    </View>
  );
}

// Navegador principal
export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
