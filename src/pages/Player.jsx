import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AudioPlayer from '../components/AudioPlayer.jsx';
import Visualizer from '../components/Visualizer.jsx';
import { useAudioContext } from '../utils/audioContext.js';

const Player = () => {
  const { audioContext, analyser, isInitialized } = useAudioContext();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  // Mock playlist data
  useEffect(() => {
    const mockPlaylist = [
      {
        id: 1,
        title: "Ambient Dreams",
        artist: "Digital Soundscape",
        duration: "3:45",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      },
      {
        id: 2,
        title: "Neon Nights",
        artist: "Synthwave Collective",
        duration: "4:12",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      },
      {
        id: 3,
        title: "Glass Horizon",
        artist: "Ethereal Beats",
        duration: "5:08",
        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
      }
    ];
    
    setPlaylist(mockPlaylist);
    setCurrentTrack(mockPlaylist[0]);
  }, []);

  const handleTrackSelect = (track) => {
    setCurrentTrack(track);
  };

  const handlePlayStateChange = (playing) => {
    setIsPlaying(playing);
  };

  const handleNextTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  };

  const handlePreviousTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentTrack(playlist[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Glass Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Glass Player
          </h1>
          <p className="text-white/70 text-lg">
            Immersive audio experience with visual dynamics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Visualizer Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-semibold text-white mb-4 text-center">
                Audio Visualizer
              </h2>
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/10">
                <Visualizer 
                  analyser={analyser} 
                  isPlaying={isPlaying}
                  isInitialized={isInitialized}
                />
              </div>
            </div>
          </motion.div>

          {/* Player Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="order-1 lg:order-2"
          >
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <AudioPlayer
                currentTrack={currentTrack}
                onPlayStateChange={handlePlayStateChange}
                onNextTrack={handleNextTrack}
                onPreviousTrack={handlePreviousTrack}
              />
            </div>
          </motion.div>
        </div>

        {/* Playlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Playlist
            </h2>
            <div className="space-y-3">
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  onClick={() => handleTrackSelect(track)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    currentTrack?.id === track.id
                      ? 'bg-white/20 border border-white/30 shadow-lg'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        currentTrack?.id === track.id && isPlaying
                          ? 'bg-purple-500/30 animate-pulse'
                          : 'bg-white/10'
                      }`}>
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{track.title}</h3>
                        <p className="text-white/60 text-sm">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm">
                      {track.duration}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-12 text-white/50"
        >
          <p>Experience music in a new dimension</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Player;