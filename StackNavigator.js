// StackNavigator.js
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator }  from '@react-navigation/bottom-tabs'
import { Entypo, Ionicons, AntDesign } from '@expo/vector-icons'

import LoginScreen     from './screens/LoginScreen'
import HomeScreen      from './screens/HomeScreen'
import FriendsScreen   from './screens/FriendsScreen.js'
import PlaylistsScreen from './screens/PlaylistsScreen'
import ChatsScreen     from './screens/ChatsScreen'
import ProfileScreen   from './screens/ProfileScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#1DB954',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home')      return <Entypo    name="home"       size={size} color={color}/>
          if (route.name === 'Friends')   return <Ionicons  name="people"     size={size} color={color}/>
          if (route.name === 'Playlists') return <AntDesign name="playcircleo"size={size} color={color}/>
          if (route.name === 'Chats')     return <Entypo    name="chat"       size={size} color={color}/>
          if (route.name === 'Profile')   return <Entypo    name="user"       size={size} color={color}/>
        }
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ tabBarLabel: 'Home'      }}/>
      <Tab.Screen name="Friends"   component={FriendsScreen}   options={{ tabBarLabel: 'Friends'   }}/>
      <Tab.Screen name="Playlists" component={PlaylistsScreen} options={{ tabBarLabel: 'Playlists' }}/>
      <Tab.Screen name="Chats"     component={ChatsScreen}     options={{ tabBarLabel: 'Chats'     }}/>
      <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ tabBarLabel: 'Profile'   }}/>
    </Tab.Navigator>
  )
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Main"  component={BottomTabs}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
