let currentText = '';
const textDisplay = document.getElementById('text-display');

function updateDisplay() {
  textDisplay.textContent = currentText;
  
  if (currentText.length === 0) {
    textDisplay.style.fontSize = '20vmin';
    return;
  }
  
  // Start with a large font size and measure
  let fontSize = 20; // vmin
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
