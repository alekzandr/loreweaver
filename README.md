# ⚔️ LoreWeaver ⚔️

A tool for Dungeon Masters to generate D&D exploration encounters and browse a library of content.

## Overview

LoreWeaver helps you create rich, non-combat encounters for your D&D games. Generate a complete scenario in seconds, or use the powerful search to find the perfect location or challenge for your next session. It's packed with skill challenges, traps, hazards, and environmental effects for ten different settings.

## Features

### Encounter Generation
Generate encounters for **10 unique environments**, from city streets to the depths of space. Each scenario comes with level-scaled skill challenges, environment-specific traps and hazards, and persistent environmental effects to make the location feel alive.

### Search & Browse
Browse the entire content library using a powerful search system with **dynamic filtering** by type, environment, setting, and more. Results are paginated and displayed on expandable cards, allowing you to get a quick preview before diving into the full details. Locations are broken down into Primary Features, Secondary Features, and hidden Discoveries.

### User Interface
A clean, intuitive interface that's easy to use on desktop, tablet, and mobile. It features a **dark mode** toggle and minimalist controls for a smooth experience.

## How to Use

### Generate Tab
1. Open `index.html` in any modern web browser
2. Select an environment by clicking on one of the environment tags
3. Set your party's level (1-20)
4. Click "🎲 Generate Encounter" to create a unique exploration encounter
5. Each generated encounter is a complete package, including a title, atmospheric descriptions, a 3-5 step narrative flow, 1-3 NPCs with detailed profiles, 3-5 explorable locations, skill challenges scaled to your party's level, and multiple resolution paths.
6. **Interactive Features**:
   - Click NPC names to open detail panels with full stats
   - Click locations to explore primary/secondary/tertiary objects
   - Use Flow Navigator (left panel) to see encounter structure
   - Toggle Progressive Reveal mode for gradual discovery

### Search Tab
1. Click the "Search" tab.
2. **Optional**: Type keywords into the search bar.
3. Use the dropdown filters to narrow results by **Type** (Encounter/Location), **Environment**, **Location Type**, **Setting**, or **Plane**.
4. Click "Search" to see the results. You can also search with no filters to browse everything.
5. Navigate through results using the pagination controls at the top and bottom of the page. You can change the number of items displayed per page.
6. Click on result cards to expand descriptions and view full details

### Search Features
The search system includes several smart features. **Live filter counts** show how many results match each option (e.g., "Arctic (24)"), and the filters update as you make selections to prevent empty results. You can select any filter first, and the others will adjust. The results summary gives you a total count broken down by Encounters and Locations.

## Environments

- 🏛️ **Urban**: Navigate cities, alleys, rooftops, and sewers
- ❄️ **Arctic**: Survive blizzards, ice, and extreme cold
- 🌊 **Ocean**: Face storms, currents, and marine dangers
- 🌌 **Space**: Explore the void with cosmic hazards
- 💀 **Crypt**: Delve into tombs with undead and curses
- 🌲 **Forest**: Trek through dense wilderness
- 🏜️ **Desert**: Endure heat, sand, and dehydration
- ⛰️ **Mountain**: Climb peaks and navigate altitude
- 🐊 **Swamp**: Wade through murky wetlands
- 🕳️ **Underground**: Explore caves and caverns in darkness

## Technical Details

LoreWeaver is built with pure HTML, CSS, and JavaScript, requiring no dependencies or frameworks. It runs entirely in your browser, so no server or internet connection is needed once loaded. All content is stored in easy-to-edit JSON files, making it simple to modify or add your own material. It's fully responsive, supports dark mode, and can be saved locally for offline use.

### Architecture
- `index.html` - Main application entry point with tabbed navigation
- `assets/js/app.js` - Core application logic, search functionality, and pagination
- `assets/js/ui.js` - UI components, interactions, and filter initialization
- `assets/js/data-loader.js` - Async external data loading system
- `assets/js/utils.js` - Helper functions and utilities
- `assets/js/core.js` - Encounter generation and NPC creation logic
- `assets/js/storage.js` - LocalStorage management for settings
- `assets/js/export.js` - Export functionality for encounters
- `assets/css/base.css` - Core styles and CSS variables
- `assets/css/components.css` - Reusable component styles
- `assets/css/pages.css` - Page-specific styles
- `assets/css/themes.css` - Dark mode theme overrides
- `data/` - JSON files for encounters, locations, NPCs, skill checks, and dangers

### Data Files
- `encounters.json` - ~100+ encounters with multiple descriptions and resolutions
- `locations.json` - Explorable locations with primary/secondary/tertiary objects
- `npcs.json` - NPC generation data (species, professions, personalities, secrets)
- `skillchecks.json` - 100+ skill challenges with contextual tags
- `dangers.json` - 40+ traps, 35+ hazards, 35+ environmental effects

## Getting Started

### Quick Start
Just open `index.html` in a web browser. No installation or build process required!

### Local Development
For best results during development, use a local web server to avoid CORS issues:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then visit http://localhost:8000
```

## Contributing

Want to add your own content? All data is stored in the `data/` directory as JSON files. Check out `DATA_README.md` for a guide on how to add your own encounters, locations, and more.

## License

Open source - feel free to use and modify for your D&D campaigns!
