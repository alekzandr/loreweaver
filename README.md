# ⚔️ LoreWeaver ⚔️

A comprehensive D&D exploration encounter tool with advanced search and filtering capabilities.

## Overview

LoreWeaver generates complete exploration encounters for Dungeons & Dragons and provides a powerful search system to browse encounters and locations. Features skill challenges, traps, hazards, and environmental effects across diverse environments.

## Features

### Core Functionality
- **10 Unique Environments**: Urban, Arctic, Ocean, Space, Crypt, Forest, Desert, Mountain, Swamp, and Underground
- **Skill Challenges**: Appropriate skill checks for each environment with dynamic DC scaling
- **Traps & Hazards**: Environment-specific dangers with detection and disarm mechanics
- **Environmental Effects**: Persistent conditions that affect the entire encounter area
- **Level Scaling**: Automatic adjustment of DCs and damage based on party level (1-20)

### Advanced Search System
- **Dynamic Filtering**: Intelligent filter system with live option counts
- **Multiple Filter Types**: Type, Environment, Location Type, Setting, and Plane filters
- **Paginated Results**: Display 5, 10, 15, or 20 results per page
- **Expandable Cards**: Click to view full descriptions and resolutions
- **Location Features**: Three-column display showing Primary Features, Secondary Features, and Discoveries
- **Smart Updates**: Filters update based on available data combinations

### User Interface
- **Modern Design**: Glassmorphic UI with smooth animations
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Controls**: Clean, minimalist pagination and filter controls

## How to Use

### Generate Tab
1. Open `index.html` in any modern web browser
2. Select an environment by clicking on one of the environment tags
3. Set your party's level (1-20)
4. Click "🎲 Generate Encounter" to create a unique exploration encounter
5. Each generated encounter includes:
   - Encounter title with multiple atmospheric descriptions
   - Encounter flow diagram with 3-5 narrative steps
   - 1-3 NPCs with detailed profiles (click names to view)
   - 3-5 explorable locations (click to view interactive details)
   - 3-4 skill challenges with appropriate DCs scaled to party level
   - Multiple resolution paths with requirements and rewards
   - Level-specific scaling guidance
6. **Interactive Features**:
   - Click NPC names to open detail panels with full stats
   - Click locations to explore primary/secondary/tertiary objects
   - Use Flow Navigator (left panel) to see encounter structure
   - Toggle Progressive Reveal mode for gradual discovery

### Search Tab
1. Click the "Search" tab to access the search system
2. **Optional**: Enter search keywords to filter by text
3. Use filters to narrow down results:
   - **Type**: Filter between Encounters Only, Locations Only, or All Types
   - **Environment**: Select specific environments (Urban, Arctic, Ocean, etc.)
   - **Location Type**: Filter locations by type (tavern, shop, landmark, etc.)
   - **Setting**: Filter by setting tags (urban, rural, coastal, etc.)
   - **Plane**: Filter by plane of existence
4. Click "Search" to view results (or search with no filters to see everything)
5. Navigate through results:
   - Use `‹` and `›` buttons to change pages
   - Current page shown as "1 / 50" format
   - Adjust items per page: 5, 10, 15, or 20 items
   - Pagination appears at both top and bottom
6. Click on result cards to expand descriptions and view full details

### Search Features
- **Dynamic Filter Counts**: Each option shows how many results match (e.g., "Arctic (24)")
- **Smart Filtering**: Filters intelligently update based on your selections
- **Independent Selection**: Select any filter first - others update automatically
- **Expandable Cards**: 
  - Encounters show multiple descriptions and resolution paths
  - Locations display three-column feature breakdown
- **Result Summary**: Total count with badges for Encounters and Locations
- **Minimal Design**: Clean pagination controls with transparent styling

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

- **Pure HTML/CSS/JavaScript** - no dependencies or frameworks required
- **ES6 Modules** - clean, modular architecture
- **Client-Side Only** - runs entirely in the browser, no server needed
- **External Data Files** - JSON-based data structure for easy content updates
- **Responsive Design** - works on desktop, tablet, and mobile devices
- **Dark Mode Support** - theme toggle with persistent preference stored in localStorage
- **Offline Capable** - save locally and use without internet connection

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
Simply open `index.html` in a web browser - no build process or installation required!

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

Want to add content? All encounter data is stored in easy-to-edit JSON files in the `data/` directory. See `DATA_README.md` for detailed documentation on the data structure and content guidelines.

## License

Open source - feel free to use and modify for your D&D campaigns!
