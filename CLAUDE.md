# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm tauri dev` - Run the app in development mode with hot-reload
- `pnpm tauri build` - Build the app for production and generate installers/bundles
- `pnpm tauri info` - Show environment information and project configuration

## Architecture

This is a Tauri application that creates a fullscreen kiosk text display application. The architecture consists of:

**Frontend (JavaScript/HTML/CSS):**
- `/src/index.html` - Simple HTML structure with a single text display div
- `/src/main.js` - Core functionality that captures keyboard input and displays text with dynamic font sizing
- `/src/styles.css` - Minimal styling for fullscreen black background with centered white text

**Backend (Rust):**
- `/src-tauri/src/main.rs` - Entry point that launches the Tauri application
- `/src-tauri/src/lib.rs` - Main application logic using Tauri builder pattern
- `/src-tauri/Cargo.toml` - Rust dependencies (minimal - just Tauri core, opener plugin, and serde)

**Key Features:**
- Fullscreen kiosk mode with no window decorations
- Real-time text input capture with dynamic font sizing that scales based on content width
- Monospace font rendering that automatically adjusts size to fit 90% of viewport width
- Simple key handling (characters, backspace, enter as space)

**Configuration:**
- Tauri app configured for fullscreen display without decorations in `/src-tauri/tauri.conf.json`
- Frontend build output directory set to `../src`
- CSP disabled for flexibility

## Project Instructions

- Always run the app at the end of an implementation so I can test
- Almost all changes will go into src/main.js ; always check that file first
