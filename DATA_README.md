# LoreWeaver - D&D Exploration Encounter Generator

A single-page application for generating D&D 5e exploration encounters with contextual location exploration.

## File Structure

### Core Application
- **index.html** - Main application file containing all UI logic, event handlers, and encounter generation algorithms. This file should NOT be edited for content updates.

### Data Files (JSON)
- **encounters.json** - Contains all encounter titles organized by environment, with associated tags for contextual matching
- **locations.json** - Contains all location types with primary/secondary/tertiary explorable objects

## Updating Content

### Adding or Modifying Encounters
Edit `encounters.json`:
```json
{
  "environment_name": [
    {
      "title": "Encounter Name",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}
```

**Tags**: Use 2-3 descriptive tags that match location types (indoor/outdoor, specific features, etc.)

### Adding or Modifying Locations
Edit `locations.json`:
```json
{
  "environment_name": {
    "location_type": {
      "tags": ["tag1", "tag2", "tag3"],
      "primary": ["object1", "object2", ...],
      "secondary": ["detail1", "detail2", ...],
      "tertiary": ["discovery1", "discovery2", ...]
    }
  }
}
```

**Object Tiers**:
- **Primary**: Main visible objects/features (6 items recommended)
- **Secondary**: Details discovered when examining primary objects (6 items)
- **Tertiary**: Hidden discoveries, treasures, traps, secrets (6 items)

**Tags**: Should overlap with encounter tags for contextual matching

## Environments

Available environments: `urban`, `arctic`, `ocean`, `space`, `crypt`, `forest`, `desert`, `mountain`, `swamp`, `underground`

## Features

1. **Generate Page**: Create random encounters based on environment and party level
2. **Search Page**: Browse all encounters and locations with keyword and filter search
3. **Preview**: View encounter/location details before opening
4. **Room Exploration**: Click "Explore Location" from encounters to investigate detailed locations
5. **Nested Discovery**: Primary → Secondary → Tertiary object exploration

## Usage

Simply open `index.html` in a web browser. The application will automatically load data from the JSON files.

**Note**: If running locally via `file://` protocol, some browsers may block fetch requests. Use a local web server or adjust browser security settings if needed.
