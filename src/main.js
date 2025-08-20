// Configuration constants
const MAX_CHARACTERS = 32;
const INITIAL_FONT_SIZE = 90; // vmin

let currentText = '';
const textDisplay = document.getElementById('text-display');
let particles = [];

// Web Audio API for low-latency typewriter sounds
let audioContext;
const audioBuffers = [];
let bellBuffer = null;

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

function updateDisplay() {
  textDisplay.textContent = currentText;
  
  if (currentText.length === 0) {
    textDisplay.style.fontSize = `${INITIAL_FONT_SIZE}vmin`;
    // Generate random HSL color with reasonable lightness/saturation
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 40); // 60-100%
    const lightness = 50 + Math.floor(Math.random() * 30);  // 50-80%
    textDisplay.style.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
    color: color
  };
}

function spawnParticleEffect(x, y, char) {
  const numParticles = 8 + Math.random() * 6;
  const currentColor = getComputedStyle(textDisplay).color;
  for (let i = 0; i < numParticles; i++) {
    particles.push(createParticle(x, y, char, currentColor));
  }
}

function updateParticles() {
  const maxParticles = 60; // Threshold for accelerated decay
  const excessCount = Math.max(0, particles.length - maxParticles);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // gravity
    
    // Accelerate decay for older particles when we have too many
    let currentDecay = p.decay;
    if (excessCount > 0) {
      // Older particles (earlier in array) get more accelerated decay
      const ageMultiplier = 1 + (excessCount * 0.05) + ((particles.length - i) * 0.02);
      currentDecay *= ageMultiplier;
    }
    
    p.life -= currentDecay;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function renderParticles() {
  // Remove old particle elements
  document.querySelectorAll('.particle').forEach(el => el.remove());
  
  particles.forEach(p => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = p.char;
    particle.style.position = 'fixed';
    particle.style.left = p.x + 'px';
    particle.style.top = p.y + 'px';
    // Extract RGB values from stored color and apply life-based alpha
    const rgbMatch = p.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      particle.style.color = `rgba(${r}, ${g}, ${b}, ${p.life})`;
    } else {
      // Fallback to original color with alpha
      particle.style.color = p.color.replace('rgb(', 'rgba(').replace(')', `, ${p.life})`);
    }
    particle.style.fontFamily = 'monospace';
    particle.style.fontSize = (parseFloat(textDisplay.style.fontSize) * p.size) + 'vmin';
    particle.style.pointerEvents = 'none';
    particle.style.userSelect = 'none';
    particle.style.transform = 'translate(-50%, -50%)';
    particle.style.zIndex = '1000';
    
    document.body.appendChild(particle);
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
  
  // Handle regular characters (letters, numbers, symbols, spaces)
  if (char.length === 1 && char !== 'Dead') {
    if (currentText.length < MAX_CHARACTERS) {
      currentText += char;
      updateDisplay();
      playRandomTypewriterSound();
      
      // Play bell when reaching exactly max characters
      if (currentText.length === MAX_CHARACTERS) {
        playBellSound();
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
});

// Make sure the document can receive focus
document.body.tabIndex = -1;
