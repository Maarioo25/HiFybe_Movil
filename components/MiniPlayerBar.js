import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '../context/PlayerContext';

// Componente para mostrar la barra del reproductor
export default function MiniPlayerBar() {
  const { track } = usePlayer();
  const insets = useSafeAreaInsets();

  if (!track?.name || !track?.album) return null;

  const image = track.album.images?.[0]?.url ?? 'https://via.placeholder.com/50';
  const title = track.name;
  const artistNames = track.artists?.map((a) => a.name).join(', ') ?? 'Artista desconocido';

  return (
    <View style={[styles.container, { marginBottom: insets.bottom + 65 }]}>
      <View style={styles.content}>
        <Image source={{ uri: image }} style={styles.cover} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artistNames}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2A6B6B',
    zIndex: 999
  },
  content: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  artist: {
    color: '#B2F5EA',
    fontSize: 12,
  },
});
