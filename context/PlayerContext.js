import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

// Componente para proporcionar el contexto del reproductor
export const PlayerProvider = ({ children }) => {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <PlayerContext.Provider value={{ track, setTrack, isPlaying, setIsPlaying }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook para acceder al contexto del reproductor
export const usePlayer = () => useContext(PlayerContext);
