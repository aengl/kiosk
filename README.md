# Kiosk Text Display

A fullscreen kiosk application built with Tauri that creates an immersive text typing experience with typewriter sounds and particle effects.

## Features

- **Fullscreen Kiosk Mode**: Clean, distraction-free interface with no window decorations
- **Dynamic Font Scaling**: Text automatically resizes to fit 90% of viewport width for optimal readability
- **Typewriter Audio**: Authentic typewriter sounds with random variation (3 different sounds) for each keystroke
- **Character Limit**: 32-character limit with bell sound notification when reached
- **Particle Effects**: Visual feedback with smart particle lifecycle management during backspace operations
- **Color Variety**: Random OKLCH color selection on startup and reset for vibrant text display
- **Smooth Color Transitions**: 700ms animated color transitions for seamless visual changes
- **Audio Feedback**: Bell sound at character limit, carriage return sound on text reset
- **Jump Animation**: Bouncy text animation with boing sound effect
- **Function Key Shortcuts**: F1 for random words, F2 for jump animation, F3 for color changes
- **Real-time Input**: Immediate character display with Atkinson Hyperlegible font for optimal readability

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build

# Show environment info
pnpm tauri info
```

## Controls

- **Type**: Any alphanumeric character, symbol, or space
- **Backspace**: Removes last character with particle effect
- **F1**: Generate random word with color change
- **F2**: Trigger bouncy jump animation with boing sound (prevents spam)
- **F3**: Change to random color with smooth transition
- **32 Characters**: Bell sound plays when limit is reached
- **Empty Text**: Carriage return sound plays and color randomizes when text becomes empty

## Audio Attributions

- **Royal_ping.WAV** by fastson -- https://freesound.org/s/99695/ -- License: Attribution 3.0
- **Typewriter - single key - type 1.wav** by yottasounds -- https://freesound.org/s/380138/ -- License: Creative Commons 0
- **Typewriter - single key - type 2.wav** by yottasounds -- https://freesound.org/s/380137/ -- License: Creative Commons 0
- **Typewriter - single key - type 3.wav** by yottasounds -- https://freesound.org/s/380136/ -- License: Creative Commons 0
- **Typewriter Carriage Return.wav** by ramsamba -- https://freesound.org/s/318686/ -- License: Creative Commons 0
- **boing.wav**: "Boing 1" by magnuswaker -- https://freesound.org/s/540788/ -- License: Creative Commons 0