# LoreWeaver Update Summary

## What Was Added

### New Feature: Highlighted Room Exploration Mode

The LoreWeaver app now includes a second exploration mode called "Highlighted Room" that implements the video game-style interactable approach to exploration.

## Key Features Added

### 1. Mode Selection
- Two-button interface to switch between "Full Encounter" and "Highlighted Room" modes
- Each mode has its own controls and display area

### 2. Highlighted Room Mode
- **Interactive Objects**: 3-5 clickable primary objects generated per room
- **Nested Exploration**: Each object reveals 2-4 secondary details, which can reveal 1-3 tertiary details
- **Environment-Specific Objects**: Different object pools for each environment (Urban, Crypt, Forest, Desert, Mountain, Swamp, Underground, Ocean, Arctic, Space)
- **Dynamic Descriptions**: Procedurally generated descriptions using templates with randomized attributes

### 3. Contextual Trap/Hazard Generation
- **"Generate Trap/Hazard" Button**: Available at any exploration level
- **Three Trap Categories**:
  - Mechanical (poisoned needles, crossbow bolts, falling blocks, etc.)
  - Magical (glyphs, curses, teleportation traps, etc.)
  - Environmental (gas release, fire bursts, acid spray, etc.)
- **Three Hazard Categories**:
  - Natural (unstable structures, slippery surfaces, toxic substances)
  - Supernatural (necrotic auras, psychic resonance, wild magic)
  - Creature (insect swarms, territorial creatures, parasites)
- **60/40 Split**: 60% chance of trap, 40% chance of hazard
- **Level-Appropriate DCs**: Detection and disarm DCs scale with party level
- **Scaling Damage**: Trap damage increases with party level (1d6 per 2 levels)
- **Contextual Flavor**: Trap/hazard descriptions explain why they're present in that environment

### 4. Navigation System
- **Breadcrumb Navigation**: Shows current exploration path
- **Back Button**: Return to previous exploration level
- **Back to Room**: Return to main room view
- **Exploration Stack**: Maintains history of explored objects

### 5. Object Pools by Environment

Each environment has three tiers of objects:
- **Primary** (8 objects): Major room features (desk, sarcophagus, tree, etc.)
- **Secondary** (8 objects): Smaller details (papers, urn, nest, etc.)
- **Tertiary** (8 objects): Fine details (letter, gemstone, feather, etc.)

Examples:
- **Urban**: desk → papers → coded message
- **Crypt**: sarcophagus → burial offerings → inscribed rune
- **Forest**: ancient tree → bird nest → colorful feather
- **Space**: control console → data terminal → access card

## Technical Implementation

### CSS Changes
- Added mode selector buttons and styling
- Added styles for interactable objects (hover effects, selection states)
- Added detail view with slide-in animation
- Added breadcrumb navigation styling
- Added trap/hazard display styling
- Made both control panels toggle-able

### JavaScript Changes
- New mode switching system
- Room generation function
- Object exploration system with depth tracking
- Exploration stack for navigation
- Template-based description generation
- Trap/hazard generation system
- Context-aware flavor text generation

### Data Structures
- `roomObjects`: 10 environments × 3 tiers × 8 objects = 240 objects
- `trapTypes`: 3 categories × 6 variations = 18 trap types
- `hazardTypes`: 3 categories × 6 variations = 18 hazard types

## Files Modified

### index.html
- Added mode selector UI
- Added room mode controls
- Added room display area
- Implemented complete Highlighted Room system
- Fixed JavaScript variable typo

### README.md
- Updated feature list
- Added Highlighted Room mode documentation
- Added trap/hazard generation documentation
- Added usage examples
- Explained the Highlighted Room method

### USAGE.md
- Completely rewritten with comprehensive guide
- Added separate sections for both modes
- Added step-by-step tutorials
- Added three detailed example sessions
- Added DM tips for both modes
- Added troubleshooting section

## Usage Example

1. Click "🚪 Highlighted Room" button
2. Select "Crypt" environment
3. Set party level to 5
4. Click "🚪 Generate Room"
5. Room shows: "stone sarcophagus", "altar", "statue", "burial niche"
6. Click "stone sarcophagus"
7. Details reveal: "burial offerings", "carved relief", "ritual dagger", "dusty tome"
8. Click "⚠️ Generate Trap/Hazard" button
9. System generates: "Cursed Treasure" trap with DC 15 detection, DC 17 disarm, 3d6 damage

## Benefits for DMs

1. **Player Agency**: Players choose what to investigate
2. **Scalable Detail**: Can explore as shallow or deep as desired
3. **Contextual Danger**: Traps generated only where needed
4. **Improvisation Support**: Provides framework while allowing creativity
5. **Time Efficient**: Quick generation of exploration content
6. **Replayable**: Randomization ensures variety

## Compatibility

- Fully backward compatible - old Full Encounter mode unchanged
- Works on all modern browsers
- No dependencies added
- Single self-contained HTML file
- Works offline

## Future Enhancement Ideas

- Custom object addition
- Save/export room configurations
- Print-friendly format
- Additional trap/hazard types
- Loot generation for explored objects
- NPC generation for urban environments
- Monster lair generation
