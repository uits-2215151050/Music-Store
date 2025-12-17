# Music Store

A Next.js-based web application that procedurally generates a simulated music streaming interface. It uses seeded random number generation to create song data, cover art, and audio previews on-demand.

## Features

- **Procedural Song Generation**: Generates songs with titles, artists, genres, and like counts based on seeded RNG for reproducibility.
- **Multiple Views**: Table view with pagination and gallery view with infinite scroll.
- **Dynamic Content**: On-demand SVG cover art and WAV audio previews.
- **Localization**: Supports multiple regions (en-US, de-DE, uk-UA) with region-specific data.
- **Interactive UI**: Built with React, TypeScript, and Tailwind CSS.

## How It Works

- **Generation**: Uses Mulberry32 RNG seeded by user input to create consistent song data.
- **APIs**: Server-side routes generate songs, covers, and audio.
- **State Management**: Custom hooks handle data fetching and UI state.

## Getting Started

1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `src/app/`: Next.js app router with pages and API routes.
- `src/components/`: UI components (SongTable, SongGallery, SongDetail).
- `src/lib/`: Core logic for RNG, generation, audio, and covers.
- `src/data/`: JSON datasets for different regions.
- `src/hooks/`: Custom React hooks.

## Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React (icons)

For more details, explore the code or run the app.
