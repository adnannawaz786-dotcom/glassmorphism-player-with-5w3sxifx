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
      
      // Connect nodes: source -> gain -> analyser -> destination
      gainNode.connect(analyser);
      analyser.connect(audioContext.destination);
      
    } catch (error) {
      console.error('Failed to create audio context:', error);
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
  
  const connectAudioElement = (audioElement) => {
    if (!audioNodes.context || !audioElement) return null;
    
    try {
      // Disconnect previous source if it exists
      if (sourceNode) {
        sourceNode.disconnect();
      }
      
      // Create new source from audio element
      sourceNode = audioNodes.context.createMediaElementSource(audioElement);
      
      // Connect: source -> gain -> analyser -> destination
      sourceNode.connect(audioNodes.gainNode);
      
      return sourceNode;
    } catch (error) {
      console.error('Failed to connect audio element:', error);
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
    if (audioNodes.context && audioNodes.context.state === 'suspended') {
      try {
        await audioNodes.context.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  };
  
  return {
    ...audioNodes,
    connectAudioElement,
    getFrequencyData,
    setVolume,
    resumeContext,
    isSupported: !!(window.AudioContext || window.webkitAudioContext)
  };
};

const connectAudioNode = (sourceNode, destinationNode) => {
  if (!sourceNode || !destinationNode) {
    console.error('Invalid audio nodes provided');
    return false;
  }
  
  try {
    sourceNode.connect(destinationNode);
    return true;
  } catch (error) {
    console.error('Failed to connect audio nodes:', error);
    return false;
  }
};

export { createAudioContext, useAudioContext, connectAudioNode };