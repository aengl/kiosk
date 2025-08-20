let currentText = '';
const textDisplay = document.getElementById('text-display');

function updateDisplay() {
  textDisplay.textContent = currentText;
  
  // Calculate font size based on text length
  const baseSize = 10;
  const minSize = 2;
  const scaleFactor = Math.max(minSize, baseSize - (currentText.length * 0.2));
  textDisplay.style.fontSize = `${scaleFactor}vmin`;
}

function handleKeyPress(event) {
  const char = event.key;
  
  // Handle regular characters (letters, numbers, symbols, spaces)
  if (char.length === 1 && char !== 'Dead') {
    currentText += char;
    updateDisplay();
  }
  
  // Handle backspace
  if (char === 'Backspace' && currentText.length > 0) {
    currentText = currentText.slice(0, -1);
    updateDisplay();
  }
  
  // Handle enter as a space
  if (char === 'Enter') {
    currentText += ' ';
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
});

// Make sure the document can receive focus
document.body.tabIndex = -1;
