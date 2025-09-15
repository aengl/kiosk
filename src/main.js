import { WORDS } from './dictionary.js';

// Configuration constants
const MAX_CHARACTERS = 32;
const INITIAL_FONT_SIZE = 90; // vmin

let currentText = '';
let wasAtMaxCharacters = false; // Track if we were at max characters
let isJumpAnimating = false; // Track if jump animation is currently playing
let isPopAnimating = false; // Track if pop animation is currently playing
let isRocketLaunching = false; // Track if rocket launch animation is currently playing
let ignitionInterval = null; // Track ignition particle spawning interval
const textDisplay = document.getElementById('text-display');

// Color state for arrow key control
let currentHue = 0;
let currentLightness = 0.7;

// Set initial random color
function setRandomColor() {
  currentLightness = 0.55 + Math.random() * 0.35; // 0.55-0.9 (wider range)
  currentHue = Math.random() * 360;                // 0-360 degrees
  const chroma = 0.3;                             // Maximum saturation
  textDisplay.style.color = `oklch(${currentLightness} ${chroma} ${currentHue})`;
}

// Update color with current hue and lightness values
function updateColor() {
  const chroma = 0.3; // Maximum saturation
  textDisplay.style.color = `oklch(${currentLightness} ${chroma} ${currentHue})`;
}
let particles = [];

// Web Audio API for low-latency typewriter sounds
let audioContext;
const audioBuffers = [];
let bellBuffer = null;
let resetBuffer = null;
let boingBuffer = null;
let popBuffer = null;
let rocketBuffer = null;

async function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load and decode the 3 typewriter wav files
    const soundFiles = ['1.wav', '2.wav', '3.wav'];
    
    for (const filename of soundFiles) {
      try {
        const response = await fetch(filename);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
      } catch (e) {
        console.warn(`Failed to load ${filename}:`, e);
      }
    }
    
    // Load bell sound
    try {
      const bellResponse = await fetch('bell.wav');
      const bellArrayBuffer = await bellResponse.arrayBuffer();
      bellBuffer = await audioContext.decodeAudioData(bellArrayBuffer);
    } catch (e) {
      console.warn('Failed to load bell.wav:', e);
    }
    
    // Load reset sound
    try {
      const resetResponse = await fetch('reset.wav');
      const resetArrayBuffer = await resetResponse.arrayBuffer();
      resetBuffer = await audioContext.decodeAudioData(resetArrayBuffer);
    } catch (e) {
      console.warn('Failed to load reset.wav:', e);
    }
    
    // Load boing sound
    try {
      const boingResponse = await fetch('boing.wav');
      const boingArrayBuffer = await boingResponse.arrayBuffer();
      boingBuffer = await audioContext.decodeAudioData(boingArrayBuffer);
    } catch (e) {
      console.warn('Failed to load boing.wav:', e);
    }
    
    // Load pop sound
    try {
      const popResponse = await fetch('pop.wav');
      const popArrayBuffer = await popResponse.arrayBuffer();
      popBuffer = await audioContext.decodeAudioData(popArrayBuffer);
    } catch (e) {
      console.warn('Failed to load pop.wav:', e);
    }

    // Load rocket sound
    try {
      const rocketResponse = await fetch('rocket.wav');
      const rocketArrayBuffer = await rocketResponse.arrayBuffer();
      rocketBuffer = await audioContext.decodeAudioData(rocketArrayBuffer);
    } catch (e) {
      console.warn('Failed to load rocket.wav:', e);
    }
  } catch (e) {
    console.warn('Audio context initialization failed:', e);
  }
}

function playRandomTypewriterSound() {
  if (!audioContext || audioBuffers.length === 0) return;
  
  try {
    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const randomBuffer = audioBuffers[Math.floor(Math.random() * audioBuffers.length)];
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = randomBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0.4; // Quieter typewriter sounds
    source.start(0);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

function playBellSound() {
  if (!audioContext || !bellBuffer) return;
  
  try {
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = bellBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 1.0; // Bell louder
    source.start(0);
  } catch (e) {
    console.warn('Bell play failed:', e);
  }
}

function playResetSound() {
  if (!audioContext || !resetBuffer) return;
  
  try {
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = resetBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0.8; // Reset sound volume
    source.start(0);
  } catch (e) {
    console.warn('Reset sound play failed:', e);
  }
}

function playBoingSound() {
  if (!audioContext || !boingBuffer) return;
  
  try {
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = boingBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 1.0; // Boing sound volume
    source.start(0);
  } catch (e) {
    console.warn('Boing sound play failed:', e);
  }
}

function playPopSound() {
  if (!audioContext || !popBuffer) return;

  try {
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = popBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = 1.0; // Pop sound volume
    source.start(0);
  } catch (e) {
    console.warn('Pop sound play failed:', e);
  }
}

function playRocketSound(duration) {
  if (!audioContext || !rocketBuffer) return null;

  try {
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = rocketBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start with full volume
    gainNode.gain.value = 1.0;

    // Fade out over the duration
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    source.start(0);
    source.stop(audioContext.currentTime + duration);

    return { source, gainNode };
  } catch (e) {
    console.warn('Rocket sound play failed:', e);
    return null;
  }
}

function generateRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function updateDisplay() {
  textDisplay.textContent = currentText;
  
  if (currentText.length === 0) {
    textDisplay.style.fontSize = `${INITIAL_FONT_SIZE}vmin`;
    setRandomColor();
    // Only play reset sound if we were previously at max characters
    if (wasAtMaxCharacters) {
      playResetSound();
      wasAtMaxCharacters = false;
    }
    return;
  }
  
  // Start with a large font size and measure
  let fontSize = INITIAL_FONT_SIZE; // vmin - start much larger
  textDisplay.style.fontSize = `${fontSize}vmin`;
  
  // Get the available width (90% of viewport width)
  const maxWidth = window.innerWidth * 0.9;
  
  // Create a temporary element to measure actual text width
  const tempElement = document.createElement('span');
  tempElement.style.visibility = 'hidden';
  tempElement.style.position = 'absolute';
  tempElement.style.whiteSpace = 'nowrap';
  tempElement.style.fontFamily = 'monospace';
  tempElement.textContent = currentText;
  document.body.appendChild(tempElement);
  
  // If text is too wide, reduce font size until it fits
  let textWidth = 0;
  do {
    tempElement.style.fontSize = `${fontSize}vmin`;
    textWidth = tempElement.getBoundingClientRect().width;
    if (textWidth > maxWidth && fontSize > 2) {
      fontSize -= 0.5;
    }
  } while (textWidth > maxWidth && fontSize > 2);
  
  // Apply the calculated font size and clean up
  textDisplay.style.fontSize = `${fontSize}vmin`;
  document.body.removeChild(tempElement);
}

function calculateLastCharPosition() {
  if (currentText.length === 0) return null;
  
  // Create a temporary element to measure text up to the last character
  const tempElement = document.createElement('span');
  tempElement.style.visibility = 'hidden';
  tempElement.style.position = 'absolute';
  tempElement.style.whiteSpace = 'nowrap';
  tempElement.style.fontFamily = 'monospace';
  tempElement.style.fontSize = textDisplay.style.fontSize;
  
  // Measure text width up to (but not including) the last character
  const textBeforeLast = currentText.slice(0, -1);
  tempElement.textContent = textBeforeLast;
  document.body.appendChild(tempElement);
  
  const widthBeforeLast = tempElement.getBoundingClientRect().width;
  
  // Measure full text width to get character width
  tempElement.textContent = currentText;
  const fullWidth = tempElement.getBoundingClientRect().width;
  const charWidth = fullWidth - widthBeforeLast;
  
  document.body.removeChild(tempElement);
  
  // Calculate position relative to the text display center
  const displayRect = textDisplay.getBoundingClientRect();
  const textStartX = displayRect.left + (displayRect.width - fullWidth) / 2;
  const charCenterX = textStartX + widthBeforeLast + charWidth / 2;
  const charCenterY = displayRect.top + displayRect.height / 2;
  
  return {
    x: charCenterX,
    y: charCenterY,
    char: currentText[currentText.length - 1]
  };
}

function createParticle(x, y, char, color) {
  return {
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8 - 2,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.02,
    char: char,
    size: Math.random() * 0.5 + 0.5,
    color: color,
    element: null
  };
}

function createIgnitionParticle(x, y, char, color) {
  return {
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 6,
    vy: Math.random() * 3 + 2, // Downward velocity
    life: 1.0,
    decay: 0.015 + Math.random() * 0.01, // Slower decay
    char: char,
    size: Math.random() * 0.3 + 0.4, // Smaller particles
    color: color,
    element: null
  };
}

function spawnParticleEffect(x, y, char) {
  const numParticles = 8 + Math.random() * 6;
  const currentColor = getComputedStyle(textDisplay).color;
  for (let i = 0; i < numParticles; i++) {
    particles.push(createParticle(x, y, char, currentColor));
  }
}

function calculateAllCharPositions() {
  if (currentText.length === 0) return [];

  // Create a temporary element to measure character positions
  const tempElement = document.createElement('span');
  tempElement.style.visibility = 'hidden';
  tempElement.style.position = 'absolute';
  tempElement.style.whiteSpace = 'nowrap';
  tempElement.style.fontFamily = 'monospace';
  tempElement.style.fontSize = textDisplay.style.fontSize;
  document.body.appendChild(tempElement);

  // Get total text width for centering calculations
  tempElement.textContent = currentText;
  const fullWidth = tempElement.getBoundingClientRect().width;

  const displayRect = textDisplay.getBoundingClientRect();
  const textStartX = displayRect.left + (displayRect.width - fullWidth) / 2;
  const textCenterY = displayRect.top + displayRect.height / 2;

  const positions = [];

  for (let i = 0; i < currentText.length; i++) {
    // Measure width up to this character
    tempElement.textContent = currentText.slice(0, i);
    const widthBefore = tempElement.getBoundingClientRect().width;

    // Measure width including this character
    tempElement.textContent = currentText.slice(0, i + 1);
    const widthIncluding = tempElement.getBoundingClientRect().width;
    const charWidth = widthIncluding - widthBefore;

    const charCenterX = textStartX + widthBefore + charWidth / 2;

    positions.push({
      x: charCenterX,
      y: textCenterY,
      char: currentText[i]
    });
  }

  document.body.removeChild(tempElement);
  return positions;
}

function spawnIgnitionEffect() {
  const charPositions = calculateAllCharPositions();
  const currentColor = getComputedStyle(textDisplay).color;

  charPositions.forEach(pos => {
    // Spawn 2-4 ignition particles per character
    const numParticles = 2 + Math.random() * 3;
    for (let i = 0; i < numParticles; i++) {
      particles.push(createIgnitionParticle(pos.x, pos.y, pos.char, currentColor));
    }
  });
}

function startContinuousIgnition(duration) {
  // Spawn particles immediately
  spawnIgnitionEffect();

  // Continue spawning particles every 100ms during the animation
  ignitionInterval = setInterval(() => {
    if (currentText.length > 0) { // Only spawn if there's still text
      spawnIgnitionEffect();
    }
  }, 100);

  // Stop spawning after the animation duration
  setTimeout(() => {
    if (ignitionInterval) {
      clearInterval(ignitionInterval);
      ignitionInterval = null;
    }
  }, duration);
}

function stopContinuousIgnition() {
  if (ignitionInterval) {
    clearInterval(ignitionInterval);
    ignitionInterval = null;
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // gravity
    
    p.life -= p.decay;
    
    if (p.life <= 0) {
      // Clean up DOM element when particle dies
      if (p.element) {
        p.element.remove();
      }
      particles.splice(i, 1);
    }
  }
}

function renderParticles() {
  particles.forEach(p => {
    // Create DOM element only if it doesn't exist
    if (!p.element) {
      p.element = document.createElement('div');
      p.element.className = 'particle';
      p.element.textContent = p.char;
      p.element.style.position = 'fixed';
      p.element.style.pointerEvents = 'none';
      p.element.style.userSelect = 'none';
      p.element.style.zIndex = '1000';
      document.body.appendChild(p.element);
    }
    
    // Update position using GPU-accelerated transform
    p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
    
    // Update dynamic properties
    const oklchMatch = p.color.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
    if (oklchMatch) {
      const [, l, c, h] = oklchMatch;
      p.element.style.color = `oklch(${l} ${c} ${h} / ${p.life})`;
    } else {
      p.element.style.color = p.color;
    }
    p.element.style.fontSize = (parseFloat(textDisplay.style.fontSize) * p.size) + 'vmin';
  });
}

function animateParticles() {
  updateParticles();
  renderParticles();
  requestAnimationFrame(animateParticles);
}

// Start particle animation loop
animateParticles();

function handleKeyPress(event) {
  const char = event.key;
  
  // Handle F-key bindings
  if (char === 'F1') {
    // Ignore F1 if animation is already playing
    if (isPopAnimating) {
      event.preventDefault();
      return;
    }
    
    const randomWord = generateRandomWord();
    currentText = randomWord;
    setRandomColor();
    updateDisplay();
    
    // Trigger pop animation
    isPopAnimating = true;
    textDisplay.classList.remove('pop-animation');
    void textDisplay.offsetHeight; // Force reflow to restart animation
    textDisplay.classList.add('pop-animation');
    
    // Play pop sound at the peak of the animation (adjusted for audio latency)
    setTimeout(() => {
      playPopSound();
    }, 150);
    
    // Remove class and reset flag after animation completes
    setTimeout(() => {
      textDisplay.classList.remove('pop-animation');
      isPopAnimating = false;
    }, 270); // Match the faster animation duration
    
    event.preventDefault();
    return;
  }
  
  if (char === 'F2') {
    // Ignore F2 if animation is already playing
    if (isJumpAnimating) {
      event.preventDefault();
      return;
    }
    
    // Trigger jump animation
    isJumpAnimating = true;
    textDisplay.classList.remove('jump-animation');
    void textDisplay.offsetHeight; // Force reflow to restart animation
    textDisplay.classList.add('jump-animation');
    playBoingSound();
    
    // Remove class and reset flag after animation completes
    setTimeout(() => {
      textDisplay.classList.remove('jump-animation');
      isJumpAnimating = false;
    }, 600);
    
    event.preventDefault();
    return;
  }
  
  if (char === 'F3') {
    // Change to random color
    setRandomColor();
    event.preventDefault();
    return;
  }

  if (char === 'F4') {
    // Ignore F4 if animation is already playing or if there's no text
    if (isRocketLaunching || currentText.length === 0) {
      event.preventDefault();
      return;
    }

    // Trigger rocket launch animation
    const animationDuration = 6000; // 6 seconds
    isRocketLaunching = true;
    textDisplay.classList.remove('rocket-launch-animation');
    void textDisplay.offsetHeight; // Force reflow to restart animation
    textDisplay.classList.add('rocket-launch-animation');

    // Start continuous ignition particles that fall downward throughout the animation
    startContinuousIgnition(animationDuration);

    // Play rocket sound with fade-out (double the animation duration)
    playRocketSound((animationDuration * 2) / 1000); // Convert to seconds

    // Clear the text after animation completes
    setTimeout(() => {
      currentText = '';
      updateDisplay();
      textDisplay.classList.remove('rocket-launch-animation');
      stopContinuousIgnition(); // Ensure ignition stops
      isRocketLaunching = false;
    }, animationDuration);

    event.preventDefault();
    return;
  }
  
  // Handle arrow keys for color control
  if (char === 'ArrowLeft') {
    currentHue = (currentHue - 10 + 360) % 360;
    updateColor();
    event.preventDefault();
    return;
  }
  
  if (char === 'ArrowRight') {
    currentHue = (currentHue + 10) % 360;
    updateColor();
    event.preventDefault();
    return;
  }
  
  if (char === 'ArrowUp') {
    currentLightness = Math.min(0.9, currentLightness + 0.05);
    updateColor();
    event.preventDefault();
    return;
  }
  
  if (char === 'ArrowDown') {
    currentLightness = Math.max(0.1, currentLightness - 0.05);
    updateColor();
    event.preventDefault();
    return;
  }
  
  // Handle regular characters (letters, numbers, symbols, spaces)
  if (char.length === 1 && char !== 'Dead') {
    if (currentText.length < MAX_CHARACTERS) {
      currentText += char;
      updateDisplay();
      playRandomTypewriterSound();
      
      // Play bell when reaching exactly max characters
      if (currentText.length === MAX_CHARACTERS) {
        playBellSound();
        wasAtMaxCharacters = true;
      }
    }
    // Do nothing if already at max characters (no sound, no adding)
  }
  
  // Handle backspace
  if (char === 'Backspace' && currentText.length > 0) {
    const charPos = calculateLastCharPosition();
    if (charPos) {
      spawnParticleEffect(charPos.x, charPos.y, charPos.char);
    }
    currentText = currentText.slice(0, -1);
    updateDisplay();
  }
  
  
  // Prevent default behavior for most keys
  event.preventDefault();
}

// Add event listener
document.addEventListener('keydown', handleKeyPress);

// Focus the document to ensure key events are captured
document.addEventListener('DOMContentLoaded', () => {
  document.body.focus();
  initAudio();
  setRandomColor();
});

// Make sure the document can receive focus
document.body.tabIndex = -1;
