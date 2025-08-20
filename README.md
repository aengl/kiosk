# Kiosk Text Display

A fullscreen kiosk application built with Tauri that creates an immersive text typing experience with typewriter sounds and particle effects.

## Features

- **Fullscreen Kiosk Mode**: Clean, distraction-free interface with no window decorations
- **Dynamic Font Scaling**: Text automatically resizes to fit 90% of viewport width
- **Typewriter Audio**: Authentic typewriter sounds with random variation for each keystroke
- **Character Limit**: 42-character limit with bell sound notification
- **Particle Effects**: Visual feedback with smart particle lifecycle management during backspace
- **Real-time Input**: Immediate character display with monospace font rendering

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Controls

- **Type**: Any alphanumeric character, symbol, or space
- **Enter**: Acts as a space character
- **Backspace**: Removes last character with particle effect
- **42 Characters**: Bell sound plays when limit is reached

## Audio Attributions

- **Royal_ping.WAV** by fastson -- https://freesound.org/s/99695/ -- License: Attribution 3.0
- **Typewriter - single key - type 1.wav** by yottasounds -- https://freesound.org/s/380138/ -- License: Creative Commons 0
- **Typewriter - single key - type 2.wav** by yottasounds -- https://freesound.org/s/380137/ -- License: Creative Commons 0
- **Typewriter - single key - type 3.wav** by yottasounds -- https://freesound.org/s/380136/ -- License: Creative Commons 0