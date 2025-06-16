import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '../context/PlayerContext';
import { AntDesign } from '@expo/vector-icons';

export default function MiniPlayerBar() {
  const { track, isPlaying, setIsPlaying } = usePlayer();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const durationMs = track?.duration_ms || 0;
  const durationSec = Math.floor(durationMs / 1000);

  const togglePlayPause = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
    } else {
      startProgress();
    }
    setIsPlaying(!isPlaying);
  };

  const startProgress = () => {
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= durationSec) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isPlaying) startProgress();
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (progress / durationSec) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, durationSec]);

  if (!track || !track.name || !track.album) return null;

  const image = track.album.images?.[0]?.url ?? 'https://via.placeholder.com/50';
  const title = track.name;
  const artistNames = track.artists?.map((a) => a.name).join(', ') ?? 'Artista desconocido';

  return (
    <View style={[styles.container, { marginBottom: insets.bottom + 65 }]}>
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: `${(progress / durationSec) * 100}%` }]} />
      </View>

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
  progressBarContainer: {
    height: 3,
    backgroundColor: '#1E4E4E',
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#4ECCA3',
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
