import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAudioContext } from '../utils/audioContext.js';

const Visualizer = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { audioContext, analyser, isPlaying } = useAudioContext();
  const [visualizerType, setVisualizerType] = useState('bars');

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawBars = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / bufferLength * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.6)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.4)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    const drawWave = () => {
      analyser.getByteTimeDomainData(dataArray);
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();
    };

    const drawCircular = () => {
      analyser.getByteFrequencyData(dataArray);
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 4;
      
      ctx.clearRect(0, 0, width, height);
      
      const bars = 64;
      const step = Math.PI * 2 / bars;
      
      for (let i = 0; i < bars; i++) {
        const barHeight = (dataArray[i] / 255) * radius;
        const angle = step * i;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);
        
        const hue = (i / bars) * 360;
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const animate = () => {
      if (isPlaying) {
        switch (visualizerType) {
          case 'bars':
            drawBars();
            break;
          case 'wave':
            drawWave();
            break;
          case 'circular':
            drawCircular();
            break;
          default:
            drawBars();
        }
      } else {
        // Draw static visualization when not playing
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        ctx.clearRect(0, 0, width, height);
        
        // Draw subtle background pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, visualizerType]);

  const visualizerTypes = [
    { id: 'bars', label: 'Bars', icon: '▬' },
    { id: 'wave', label: 'Wave', icon: '〰' },
    { id: 'circular', label: 'Circular', icon: '◯' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-64 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))' }}
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        {visualizerTypes.map((type) => (
          <motion.button
            key={type.id}
            onClick={() => setVisualizerType(type.id)}
            className={`px-3 py-2 rounded-lg backdrop-blur-md border transition-all duration-200 ${
              visualizerType === type.id
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-black/20 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={type.label}
          >
            <span className="text-sm">{type.icon}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Info overlay when not playing */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center text-white/60">
            <div className="text-4xl mb-2">🎵</div>
            <p className="text-sm">Play music to see visualization</p>
          </div>
        </motion.div>
      )}
      
      {/* Glassmorphism border effect */}
      <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none" />
    </motion.div>
  );
};

export default Visualizer;