import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, List } from 'lucide-react';
import { useAudioContext } from '../utils/audioContext.js';
import { savePlaylist, loadPlaylist } from '../lib/storage.js';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [audioData, setAudioData] = useState(new Uint8Array(128));

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const { analyser, connectAudio } = useAudioContext();

  // Load playlist from localStorage on component mount
  useEffect(() => {
    const savedPlaylist = loadPlaylist();
    if (savedPlaylist && savedPlaylist.length > 0) {
      setPlaylist(savedPlaylist);
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    if (playlist.length > 0) {
      savePlaylist(playlist);
    }
  }, [playlist]);

  // Audio visualization
  useEffect(() => {
    if (analyser && isPlaying) {
      const animate = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        setAudioData(dataArray);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  // Connect audio element to Web Audio API
  useEffect(() => {
    if (audioRef.current && analyser) {
      connectAudio(audioRef.current);
    }
  }, [audioRef.current, analyser, connectAudio]);

  // Canvas visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / audioData.length;
    let barHeight;
    let x = 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');

    for (let i = 0; i < audioData.length; i++) {
      barHeight = (audioData[i] / 255) * height * 0.8;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      
      x += barWidth;
    }
  }, [audioData]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newTracks = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setPlaylist(prev => [...prev, ...newTracks]);
    
    if (playlist.length === 0 && newTracks.length > 0) {
      setCurrentTrack(0);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const next = (currentTrack + 1) % playlist.length;
    setCurrentTrack(next);
    setIsPlaying(false);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const prev = currentTrack === 0 ? playlist.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    setIsPlaying(false);
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setIsPlaying(false);
    setShowPlaylist(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSong = playlist[currentTrack];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Main Player Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Visualizer */}
          <div className="mb-8 relative">
            <canvas
              ref={canvasRef}
              width={320}
              height={120}
              className="w-full h-24 rounded-xl bg-black/20 backdrop-blur-sm"
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/60 text-sm">Audio Visualizer</div>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentSong ? currentSong.name : 'No Track Selected'}
            </h2>
            <p className="text-white/70">
              {playlist.length > 0 ? `${currentTrack + 1} of ${playlist.length}` : 'Upload music to start'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div
              className="w-full h-2 bg-white/20 rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all duration-150"
                style={{
                  width: duration ? `${(currentTime / duration) * 100}%` : '0%'
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/70 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTrack}
              disabled={playlist.length === 0}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePlay}
              disabled={playlist.length === 0}
              className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTrack}
              disabled={playlist.length === 0}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward size={20} />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3 mb-6">
            <Volume2 size={18} className="text-white/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
            >
              <Upload size={18} />
              <span>Upload</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
            >
              <List size={18} />
              <span>Playlist ({playlist.length})</span>
            </motion.button>
          </div>
        </div>

        {/* Playlist */}
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl max-h-64 overflow-y-auto"
          >
            <h3 className="text-white font-semibold mb-3">Playlist</h3>
            {playlist.length === 0 ? (
              <p className="text-white/60 text-center py-4">No tracks in playlist</p>
            ) : (
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectTrack(index)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      index === currentTrack
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <div className="font-medium truncate">{track.name}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Hidden Audio Element */}
        {currentSong && (
          <audio
            ref={audioRef}
            src={currentSong.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={nextTrack}
            crossOrigin="anonymous"
          />
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </motion.div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #3b82f6);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #a855f7, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;