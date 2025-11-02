# LoreWeaver - D&D Exploration Encounter Generator

A single-page application for generating D&D 5e exploration encounters with contextual NPCs, locations, skill challenges, and narrative flow.

## File Structure

### Core Application
- **index.html** - Main application file containing all UI logic, event handlers, and encounter generation algorithms. This file should NOT be edited for content updates.

### Data Files (JSON)
- **encounters.json** - Encounter titles organized by environment with tags for contextual matching
- **locations.json** - Location types with primary/secondary/tertiary explorable objects and descriptions
- **npcs.json** - NPC generation data including species, professions, personalities, alignments, secrets, and appearances
- **skillchecks.json** - 100 skill challenges across all D&D skills with contextual tags
- **dangers.json** - Traps (40), hazards (35), and environmental effects (35) with severity ratings and tags

## Content Guidelines

### encounters.json - Encounter Titles & Descriptions

**Structure:**
```json
{
  "environment_name": [
    {
      "title": "Encounter Name",
      "description": "Rich narrative description that sets the scene and atmosphere",
      "tags": ["tag1", "tag2", "tag3", "tag4"]
    }
  ]
}
```

**Best Practices:**
- **Title**: Evocative, 2-5 words (e.g., "The Shadowed Alley", "Derelict Station")
- **Description**: 2-4 sentences painting a vivid picture with sensory details
- **Tags**: 3-5 descriptive tags that match locations, NPCs, and skill checks
  - Include environment type: `urban`, `dungeon`, `outdoor`, `indoor`
  - Include themes: `crime`, `mystery`, `supernatural`, `combat`, `social`
  - Include specific features: `warehouse`, `mansion`, `sewer`, `laboratory`

**Tagging Philosophy**: Tags drive smart content selection - NPCs, locations, and skill checks with matching tags will be prioritized.

---

### locations.json - Explorable Locations

**Structure:**
```json
{
  "environment_name": {
    "location_key": {
      "tags": ["tag1", "tag2", "tag3"],
      "description": "Atmospheric description of the location",
      "primary": ["visible feature 1", "visible feature 2", ...],
      "secondary": ["detail 1", "detail 2", ...],
      "tertiary": ["hidden thing 1", "hidden thing 2", ...]
    }
  }
}
```

**Object Tiers (6 items each recommended):**
- **Primary**: Immediately visible objects and features when entering the location
- **Secondary**: Details discovered when examining primary objects more closely
- **Tertiary**: Hidden discoveries requiring investigation - treasures, traps, secrets, plot hooks

**Description Guidelines:**
- 2-3 sentences setting atmosphere with sensory details
- Focus on what players SEE, HEAR, and SMELL
- Create mood and tone appropriate to the environment

**Tags**: Should overlap heavily with encounter and skill check tags for contextual matching.

**Examples of Good Tags:**
- Environment: `urban`, `wilderness`, `dungeon`, `indoor`, `outdoor`
- Building types: `warehouse`, `mansion`, `laboratory`, `sewer`, `crypt`
- Themes: `crime`, `abandoned`, `haunted`, `industrial`, `magical`

---

### npcs.json - NPC Generation Data

**Structure:**
```json
{
  "species": {
    "species_name": {
      "firstNames": ["name1", "name2", ...],
      "surnames": ["surname1", "surname2", ...]
    }
  },
  "professions": [
    {
      "name": "Profession Name",
      "description": "What this person does and their role",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ],
  "alignments": [
    {
      "name": "Alignment",
      "description": "How this affects behavior and choices"
    }
  ],
  "personalities": [
    {
      "trait": "Personality Trait",
      "description": "How this manifests in behavior",
      "tags": ["tag1", "tag2"]
    }
  ],
  "secrets": [
    {
      "secret": "The secret itself",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ],
  "appearances": [
    {
      "description": "Physical description",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

**Adding New Content:**

**Species**: Add first names and surnames appropriate to the fantasy race. 10-15 names per category recommended.

**Professions**: 
- **Name**: Clear job title
- **Description**: What they do and their typical role in encounters
- **Tags**: Match to environments and encounter types (e.g., `urban`, `crime`, `trade`, `guard`)

**Personalities**:
- **Trait**: One or two word descriptor (e.g., "Paranoid", "Jovial")
- **Description**: How this trait affects interactions
- **Tags**: Social contexts where this matters (e.g., `suspicious`, `friendly`, `hostile`)

**Secrets**: 
- **Secret**: DM-only information that creates depth (e.g., "Is a spy for a rival faction")
- **Tags**: Thematic tags (e.g., `crime`, `politics`, `supernatural`, `betrayal`)

**Appearances**:
- **Description**: Distinctive physical features (e.g., "Has a jagged scar across left cheek")
- **Tags**: Descriptive tags (e.g., `scarred`, `distinctive`, `intimidating`, `beautiful`)

---

### skillchecks.json - Skill Challenges

**Structure:**
```json
{
  "skillChecks": [
    {
      "skill": "Skill Name",
      "challenge": "Short description of the challenge",
      "description": "Detailed explanation of what's happening",
      "success": "What happens on success",
      "failure": "What happens on failure",
      "tags": ["ability", "theme1", "theme2", "environment1", "situation1"]
    }
  ]
}
```

**Current Count**: 100 skill checks covering all D&D skills

**Adding New Skill Checks:**
- **Skill**: Exact D&D 5e skill name (e.g., "Acrobatics", "Arcana", "Stealth")
- **Challenge**: Brief, action-oriented description (3-8 words)
- **Description**: 1-2 sentences explaining the situation
- **Success**: Clear outcome if the check succeeds
- **Failure**: Clear consequence if the check fails
- **Tags**: 5-7 tags minimum
  - ALWAYS include the relevant ability score: `strength`, `dexterity`, `intelligence`, `wisdom`, `charisma`
  - Include situation types: `combat`, `social`, `exploration`, `stealth`, `emergency`
  - Include environments: `urban`, `wilderness`, `dungeon`, `indoor`, `outdoor`
  - Include specific locations: `tavern`, `temple`, `prison`, `guard`, `merchant`
  - Include themes: `crime`, `magic`, `healing`, `animals`, `investigation`

**Tag Philosophy**: More tags = better matching. Skill checks should have 5-10 tags for maximum flexibility.

---

### dangers.json - Traps, Hazards & Environmental Effects

**Structure:**
```json
{
  "traps": [
    {
      "name": "Trap Name",
      "description": "What the trap looks like and does",
      "detectMethod": "How to spot it",
      "disarmMethod": "How to disable it",
      "damageType": "Type of damage dealt",
      "tags": ["tag1", "tag2", "tag3"],
      "severity": "low|medium|high|deadly",
      "resetable": true|false
    }
  ],
  "hazards": [
    {
      "name": "Hazard Name",
      "description": "What the hazard is",
      "saveAbility": "Ability for saving throw",
      "effect": "What happens if you fail",
      "tags": ["tag1", "tag2", "tag3"],
      "severity": "minor|moderate|severe|lethal",
      "persistent": true|false
    }
  ],
  "environmentalEffects": [
    {
      "name": "Effect Name",
      "description": "What the effect is",
      "mechanicalEffect": "Game mechanical impact",
      "tags": ["tag1", "tag2", "tag3"],
      "severity": "minor|moderate|severe"
    }
  ]
}
```

**Current Counts**: 40 traps, 35 hazards, 35 environmental effects

**Traps**: Mechanical or magical devices that trigger when disturbed
- **detectMethod**: Investigation, Perception, or specific observation needed
- **disarmMethod**: Thieves' Tools, magic, or clever solutions
- **damageType**: Physical, elemental, or magical damage
- **resetable**: Can it trigger multiple times?
- **Severity**: low (1-2d6), medium (3-4d6), high (5-8d6), deadly (9d6+)

**Hazards**: Persistent environmental dangers
- **saveAbility**: STR, DEX, CON, INT, WIS, or CHA
- **effect**: What happens on failed save
- **persistent**: Does it continue affecting the area?
- **Severity**: minor (nuisance), moderate (harmful), severe (dangerous), lethal (deadly)

**Environmental Effects**: Area-wide conditions affecting everyone
- **mechanicalEffect**: Specific game impact (disadvantage, movement reduction, etc.)
- **Severity**: minor (inconvenience), moderate (significant), severe (major challenge)

**Tags for Dangers**:
- Environment types: `urban`, `dungeon`, `forest`, `arctic`, `ocean`, `desert`, `mountain`, `swamp`, `underground`, `space`, `crypt`
- Location specifics: `warehouse`, `mansion`, `laboratory`, `sewer`, `tomb`, `cave`, `temple`
- Themes: `mechanical`, `magical`, `natural`, `supernatural`, `poison`, `fire`, `ice`, `acid`

---

## Environments

**Available Environments**: 
- `urban` - Cities, towns, settlements
- `arctic` - Frozen tundra, glaciers, ice caves
- `ocean` - Seas, underwater, islands, ships
- `space` - Wildspace, spelljammer, void
- `crypt` - Tombs, graveyards, undead lairs
- `forest` - Woods, jungles, groves
- `desert` - Dunes, oases, sandstorms
- `mountain` - Peaks, cliffs, high altitude
- `swamp` - Bogs, marshes, wetlands
- `underground` - Caves, underdark, mines

---

## Tag System Philosophy

The entire system is built on **contextual tag matching**. When generating encounters:

1. **Encounter tags** are selected from encounters.json
2. **Locations** with matching tags are prioritized (3-5 locations per encounter)
3. **NPCs** are selected based on profession/secret/appearance tags matching encounter tags (1-3 NPCs)
4. **Skill Checks** with matching tags are chosen (3-4 checks)
5. **Dangers** can be integrated based on matching tags (future feature)

**Good Tagging Strategy:**
- Use 5-10 tags per item
- Mix broad tags (`urban`, `indoor`) with specific tags (`warehouse`, `crime`, `smuggling`)
- Include thematic tags (`mystery`, `supernatural`, `political`)
- Think about what situations this content fits

**Example Tag Progression**:
- Encounter: `["urban", "crime", "warehouse", "smuggling", "investigation"]`
- Matching Location: Warehouse with tags `["urban", "indoor", "building", "warehouse", "storage"]`
- Matching NPC Profession: Smuggler with tags `["crime", "urban", "illegal", "trade"]`
- Matching Skill Check: Investigation with tags `["intelligence", "perception", "urban", "crime", "investigation"]`

---

## Features

### Current Features
1. **Encounter Generation**: Creates complete encounters with:
   - Title and atmospheric description
   - Encounter flow diagram (3-5 steps)
   - NPCs (1-3) with full details
   - Skill challenges (3-4) scaled to party level
   - Level scaling guide
   - Resolution and rewards

2. **Interactive Elements**:
   - **NPC Detail Panels**: Click any NPC name to see full stats, appearance, secret, personality
   - **Location Detail Panels**: Click locations to explore primary/secondary/tertiary objects
   - **Flow Navigator**: Collapsible left-side panel showing encounter flow diagram
   - **Collapsible Sections**: All encounter sections can collapse to reduce scrolling
   - **Progressive Reveal**: Toggle between showing all location details or progressive discovery

3. **Search System**: Browse all encounters and locations with keyword filtering

4. **Smart Selection**: Content is chosen based on tag matching for coherent, themed encounters

### Removed Features (No Longer Displayed)
- Standalone "Key Locations" section (now integrated into Flow)
- Standalone "Traps" section
- Standalone "Environmental Hazards" section  
- Standalone "Environmental Effects" section

**Note**: Dangers.json exists and is ready for future integration into encounter flow.

---

## Technical Notes

### File Loading
The application uses async/await to load all JSON files:
- `loadData()` function loads encounters, locations, and NPCs
- `dataLoaded` flag prevents generation before data is ready
- Defensive checks prevent crashes if data loads slowly

### JSON Validation
All JSON files must be valid. Common issues:
- **Line breaks in strings**: JSON strings cannot span multiple lines
- **Missing commas**: Between array items and object properties
- **Extra commas**: After the last item in arrays/objects
- **Unclosed brackets/braces**: Every `[` needs `]`, every `{` needs `}`

**To validate**: Use `python3 -m json.tool filename.json` in terminal

### Browser Compatibility
- Works in all modern browsers
- Local file access may require local web server or browser settings adjustment
- Uses ES6 features (async/await, template literals, arrow functions)

---

## Adding New Content - Quick Reference

### New Encounter
```json
{
  "title": "Evocative Title",
  "description": "Rich sensory description creating atmosphere and tension.",
  "tags": ["environment", "theme", "location_type", "mood", "challenge_type"]
}
```

### New Location
```json
"location_key": {
  "tags": ["environment", "building_type", "theme", "indoor/outdoor"],
  "description": "What it looks, sounds, and smells like.",
  "primary": ["visible thing 1", "visible thing 2", ...],
  "secondary": ["detail 1", "detail 2", ...],
  "tertiary": ["secret 1", "treasure 1", ...]
}
```

### New NPC Profession
```json
{
  "name": "Job Title",
  "description": "What they do and their typical role in stories",
  "tags": ["environment", "theme", "social_class", "alignment_tendency"]
}
```

### New Skill Check
```json
{
  "skill": "D&D Skill Name",
  "challenge": "Action description",
  "description": "What's happening",
  "success": "Good outcome",
  "failure": "Bad outcome",
  "tags": ["ability_score", "environment", "theme", "situation", "location"]
}
```

### New Danger (Trap/Hazard/Effect)
```json
{
  "name": "Danger Name",
  "description": "What it is",
  "tags": ["environment", "location", "type", "element"],
  "severity": "minor/moderate/severe"
}
```

---

## Tips for Creating Immersive Content

### Descriptions
- Use **sensory details**: What do they see, hear, smell?
- Create **mood**: Is it tense, mysterious, dangerous, peaceful?
- Be **concise**: 2-4 sentences maximum
- **Show, don't tell**: "Rusty chains dangle from hooks" vs "This is a prison"

### Tags
- **Be generous**: 5-10 tags is better than 2-3
- **Mix specificity**: Combine broad (`urban`) and specific (`sewers`) tags
- **Think connections**: What other content should this match with?
- **Use existing tags**: Check other files to see common tag patterns

### Progression (Locations)
- **Primary**: Obvious, visible, safe to interact with
- **Secondary**: Requires closer examination, adds detail
- **Tertiary**: Hidden, valuable, dangerous, plot-relevant

### Cohesion
- Content with similar tags will appear together
- Think about narrative flow: what NPCs, locations, and challenges make sense together?
- Environmental tags should match across all content types

---

## File Maintenance

**When editing JSON files:**
1. Use a text editor with JSON syntax highlighting
2. Validate after every edit: `python3 -m json.tool filename.json`
3. Keep backups before major changes
4. Test in the application after changes
5. Ensure descriptions don't have line breaks within strings

**Common Errors:**
- Description text breaking across lines (invalid JSON)
- Missing comma between array items
- Extra closing braces `}`
- Inconsistent indentation (doesn't break JSON but makes it hard to read)

---

## Usage

Simply open `index.html` in a web browser. The application automatically loads all JSON data files.

**Local Development**: Use a local web server to avoid CORS issues:
```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```
