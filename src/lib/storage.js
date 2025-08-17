// Storage utilities for playlist management in localStorage

const STORAGE_KEY = 'glassmorphism-player-playlist';

export const savePlaylist = (playlist) => {
  try {
    const playlistData = {
      tracks: playlist.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artist,
        duration: track.duration,
        url: track.url,
        file: null // Don't store file objects, only metadata
      })),
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlistData));
    return true;
  } catch (error) {
    console.error('Failed to save playlist to localStorage:', error);
    return false;
  }
};

export const loadPlaylist = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const playlistData = JSON.parse(stored);
    return playlistData.tracks || [];
  } catch (error) {
    console.error('Failed to load playlist from localStorage:', error);
    return [];
  }
};

export const clearPlaylist = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear playlist from localStorage:', error);
    return false;
  }
};

// Additional storage utilities for player state
export const savePlayerState = (state) => {
  try {
    const playerState = {
      currentTrackId: state.currentTrackId,
      currentTime: state.currentTime,
      volume: state.volume,
      isPlaying: false, // Always reset to false on page load
      timestamp: Date.now()
    };
    localStorage.setItem('glassmorphism-player-state', JSON.stringify(playerState));
    return true;
  } catch (error) {
    console.error('Failed to save player state:', error);
    return false;
  }
};

export const loadPlayerState = () => {
  try {
    const stored = localStorage.getItem('glassmorphism-player-state');
    if (!stored) return null;
    
    const playerState = JSON.parse(stored);
    return {
      currentTrackId: playerState.currentTrackId || null,
      currentTime: playerState.currentTime || 0,
      volume: playerState.volume || 0.8,
      isPlaying: false // Always start paused
    };
  } catch (error) {
    console.error('Failed to load player state:', error);
    return null;
  }
};

export const clearPlayerState = () => {
  try {
    localStorage.removeItem('glassmorphism-player-state');
    return true;
  } catch (error) {
    console.error('Failed to clear player state:', error);
    return false;
  }
};