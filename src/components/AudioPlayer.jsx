// utils/audioContext.js
let audioContext = null;
let analyser = null;
let gainNode = null;
let sourceNode = null;

const createAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create analyser node for visualizer
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Create gain node for volume control
      gainNode = audioContext.createGain();

      // Connect nodes: gain -> analyser -> destination
      gainNode.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (error) {
      console.error("Failed to create audio context:", error);
    }
  }

  return {
    context: audioContext,
    analyser,
    gainNode,
    sourceNode
  };
};

const useAudioContext = () => {
  const audioNodes = createAudioContext();

  const connectAudio = (audioElement) => {
    if (!audioNodes.context || !audioElement) return null;

    try {
      // Prevent creating multiple MediaElementSourceNodes for the same <audio>
      if (!sourceNode) {
        sourceNode = audioNodes.context.createMediaElementSource(audioElement);
        sourceNode.connect(audioNodes.gainNode);
      }
      return sourceNode;
    } catch (error) {
      console.error("Failed to connect audio element:", error);
      return null;
    }
  };

  const getFrequencyData = () => {
    if (!audioNodes.analyser) return new Uint8Array(0);

    const bufferLength = audioNodes.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    audioNodes.analyser.getByteFrequencyData(dataArray);

    return dataArray;
  };

  const setVolume = (volume) => {
    if (audioNodes.gainNode) {
      audioNodes.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  };

  const resumeContext = async () => {
    if (audioNodes.context && audioNodes.context.state === "suspended") {
      try {
        await audioNodes.context.resume();
      } catch (error) {
        console.error("Failed to resume audio context:", error);
      }
    }
  };

  return {
    audioContext: audioNodes.context, // 👈 consistent name
    analyser: audioNodes.analyser,
    gainNode: audioNodes.gainNode,
    sourceNode,
    connectAudio, // 👈 matches AudioPlayer.jsx
    getFrequencyData,
    setVolume,
    resumeContext,
    isInitialized: !!audioNodes.context, // 👈 matches Player.jsx
    isSupported: !!(window.AudioContext || window.webkitAudioContext)
  };
};

export { createAudioContext, useAudioContext };
