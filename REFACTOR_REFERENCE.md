# LoreWeaver Application State - Pre-Refactor Reference
**Date:** November 2, 2025  
**Purpose:** Complete documentation of current functionality before modular refactoring  
**File Count:** 6484 lines in index.html + 5 JSON data files

---

## APPLICATION OVERVIEW

**LoreWeaver** is a D&D Exploration Encounter Generator that creates dynamic, multi-location narrative encounters with NPCs, skill checks, traps, hazards, and environmental effects. It features a sophisticated tag-based matching system for contextual content selection.

### Core Purpose
- Generate thematic D&D encounters across 10 environments
- Create narrative flow between 1-5 locations with NPCs
- Smart content selection based on tags (encounters, locations, NPCs, dangers)
- Save/load encounter functionality with localStorage
- Export to Markdown, Text, and PDF formats
- Standalone NPC generation
- Search/filter system for encounters and locations

---

## FILE STRUCTURE (CURRENT)

```
loreweaver/
├── index.html (6484 lines - MONOLITHIC)
│   ├── CSS (lines 1-1650)
│   ├── HTML Structure (lines 1651-1975)
│   └── JavaScript (lines 1976-6484)
├── encounters.json (1800 lines, 10 environments)
├── locations.json (2586 lines, 10 environments)
├── npcs.json (species, professions, personalities, secrets, appearances)
├── skillchecks.json (tag-based skill checks)
├── dangers.json (traps, hazards, environmental effects)
├── start.ps1 (Windows HTTP server)
├── start.sh (Unix HTTP server)
└── Documentation files (README, guides, etc.)
```

---

## DATA ARCHITECTURE

### 1. **Encounters (encounters.json)**
- **10 Environments:** urban, arctic, ocean, space, crypt, forest, desert, mountain, swamp, underground
- **Structure per encounter:**
  ```json
  {
    "title": "String",
    "tags": ["tag1", "tag2"],
    "descriptions": ["variant1", "variant2"] || "single description",
    "weight": 1.0,
    "customLocations": ["specific_location_key"] (optional),
    "resolutions": [
      {
        "title": "Resolution Name",
        "description": "Narrative outcome",
        "requirements": "What players need",
        "rewards": "What they get"
      }
    ]
  }
  ```
- **Replayability System:** Multiple descriptions and resolutions with random selection

### 2. **Locations (locations.json)**
- **Nested Structure:** Environment → Location Type → Details
- **Each location has:**
  - `tags`: For matching (e.g., "warehouse", "indoor", "criminal")
  - `primary`: 6 main interactable objects
  - `secondary`: 6 minor objects
  - `tertiary`: 6 hidden/valuable objects
  - `description`: Atmospheric narrative text
- **Custom Locations:** Some encounters specify exact locations via `customLocations` array

### 3. **NPCs (npcs.json)**
- **Components:**
  - `species`: Multiple fantasy races with first/surnames
  - `professions`: Tag-based with narrative hooks
  - `personalities`: Traits with descriptions and tags
  - `secrets`: Hidden motivations/backgrounds with tags
  - `alignments`: 9 D&D alignments
  - `appearances`: Physical descriptions with tags

### 4. **Skill Checks (skillchecks.json)**
- Tag-based selection
- Fields: `name`, `description`, `dc`, `tags`

### 5. **Dangers (dangers.json)**
- **Three categories:**
  - `traps`: Mechanical hazards (tags, trigger, effect)
  - `hazards`: Environmental dangers (tags, description, effect)
  - `environmentalEffects`: Ongoing conditions (tags, description, effect)

---

## CORE FUNCTIONALITY INVENTORY

### A. PAGE NAVIGATION & UI (4 Pages)
**Functions:**
- `switchPage(page)` - Multi-page navigation (generate, npc, search, settings)
- `toggleTheme()` / `loadTheme()` / `updateThemeUI()` - Dark/light mode persistence
- `toggleProgressiveReveal()` / `loadProgressiveReveal()` - Step-by-step reveal toggle
- `toggleSection(event)` - Collapsible sections in encounters
- `toggleFlowNavigator()` - Floating nav panel for encounter steps

**Global State Variables:**
- `dataLoaded` - Boolean flag for JSON load completion
- `encounterTitles`, `locationObjects`, `npcData`, `skillChecksData`, `dangersData`
- Progressive reveal: `isProgressiveRevealEnabled`

---

### B. DATA LOADING
**Function:** `async loadData()`
- Fetches 5 JSON files in parallel
- Populates global variables
- Initializes UI (environment tags, search filters)
- **Critical:** Must complete before any generation

**Dependencies:**
```javascript
await Promise.all([
  fetch('encounters.json'),
  fetch('locations.json'),
  fetch('npcs.json'),
  fetch('skillchecks.json'),
  fetch('dangers.json')
])
```

---

### C. ENCOUNTER GENERATION SYSTEM

#### Main Generation Flow
**Function:** `generateEncounter(specificEncounterTitle = null)`

**Steps:**
1. Get party level (1-20) and number of locations (1-5)
2. Select environment and encounter template
3. Generate NPCs based on encounter tags
4. Select locations (smart tag matching OR customLocations)
5. Aggregate all tags (encounter + location + NPC)
6. Select skill checks, traps, hazards, effects (tag-based scoring)
7. Generate encounter flow (narrative progression)
8. Build HTML display
9. Store in global state for save/export

**Global State Set:**
```javascript
window.encounterTitle
window.encounterDescription
window.encounterEnvironment
window.encounterPartyLevel
window.encounterTemplate
window.encounterLocationsData
window.encounterNPCsData
window.encounterSkillChecks
window.encounterTraps
window.encounterHazards
window.encounterEffects
window.encounterFlowData
```

#### Supporting Functions

**Template Selection:**
- `selectEncounterTemplate(environment, specificTitle)` - Weighted random or specific

**Description Building:**
- `buildEncounterDescription(environment, title, customDescription)`
- Handles both single string and array of descriptions
- Random selection from array if available

**Location Selection:**
- `selectLocationsForEncounter(encounterTags, environment, numLocations, customLocationKeys)`
- **If customLocationKeys:** Use those exact locations (guaranteed match)
- **Else:** Tag-based scoring system:
  - Score each location by tag overlap
  - Weight by encounter environment match
  - Select top-scoring locations randomly

**NPC Selection:**
- `selectNPCsForEncounter(encounterTags, numNPCs)`
- Smart profession matching based on encounter tags
- Ensures profession diversity (no duplicates)
- Generates: name, race, profession, alignment, personality, secret, appearance

**Content Selection (Tag-Based Scoring):**
- `selectSkillChecks(encounterTags, locationTags, npcTags, numChecks)`
- `selectTraps(locationTags, numTraps)`
- `selectHazards(environmentTag, locationTags, numHazards)`
- `selectEnvironmentalEffects(environmentTag, encounterTags, numEffects)`
- All use weighted tag matching with randomization

**Utilities:**
- `calculateDC(partyLevel)` - Returns appropriate DC for party level
- `getScalingNotes(partyLevel)` - Tier-appropriate advice
- `formatLocationName(key)` - Converts snake_case to Title Case
- `getRandomElements(array, count)` - Random selection helper

---

### D. ENCOUNTER FLOW SYSTEM

**Function:** `generateEncounterFlow(locations, npcs, encounterTitle, encounterTemplate)`

**Creates narrative progression:**
1. Loop through each location (step number)
2. Generate title, description with NPC integration
3. Add DM tips (roleplay, tension, secrets)
4. Include custom resolutions if in template
5. Wrap NPC names as clickable links

**Flow Data Structure:**
```javascript
{
  step: 1,
  title: "Step Title",
  location: { key, name, data },
  description: "Narrative with {{NPC}} links",
  dmTips: ["tip1", "tip2"],
  customResolutions: [...]
}
```

**Related Functions:**
- `renderFlowStep(step)` - Generates HTML for flow step display
- `populateFlowNavigator(flowSteps)` - Floating nav panel
- `scrollToFlowStep(stepNumber)` - Smooth scroll to step
- `wrapNPCName(npc, index)` - Creates clickable NPC spans

---

### E. DYNAMIC ENCOUNTER EDITING

**Location Management:**
- `regenerateFlowLocation(stepNumber)` - Regenerate single location
- `addNewLocation()` - Add new location to existing encounter
- `removeLocation(stepNumber)` - Delete location and reflow
- `moveLocationUp(stepNumber)` - Reorder locations
- `moveLocationDown(stepNumber)` - Reorder locations
- `updateSubsequentFlowSteps(changedStepNumber)` - Renumber steps
- `updateFlowReferences()` - Fix NPC/location references after edits

**NPC Management:**
- `regenerateNPC(npcIndex)` - Replace single NPC
- `renderNPCSection()` - Rebuild NPC display after changes

**Display Rebuild:**
- `rebuildEncounterDisplay()` - Complete refresh after edits

---

### F. DETAIL PANELS & INTERACTIONS

**Location Details:**
- `showLocationDetail(locationKey, viewLevel, selectedIndex)` - Slide-in panel
- Three levels: primary/secondary/tertiary objects
- `hideLocationDetail()` - Close panel
- `toggleLocationSection(sectionId)` - Expand/collapse sections

**NPC Details:**
- `showNPCDetail(npcIndex)` - Full NPC information panel
- `hideNPCDetail()` - Close panel
- `showNPCTooltip(event, npcIndex)` - Hover preview
- `hideNPCTooltip()` - Remove tooltip

**Content Helpers:**
- `getSkillChecksForLocation(locationTags)` - Filter relevant checks
- `getTrapsForLocation(locationTags)` - Filter relevant traps
- `getHazardsForLocation(locationTags)` - Filter relevant hazards
- `getProfessionRoleTip(profession)` - Narrative suggestions

---

### G. SAVE/LOAD SYSTEM

**LocalStorage-Based:**

**Save:**
- `saveCurrentEncounter()` - Prompts for name, saves to localStorage
- Stores: template, environment, party level, locations, NPCs, skill checks, traps, hazards, effects, flow
- Timestamp included
- Key: `loreweaver_saved_encounters`

**Load:**
- `showSavedEncounters()` - Display saved list with preview
- `loadSavedEncounter(index)` - Restore all state and rebuild display
- `deleteSavedEncounter(index)` - Remove from localStorage

**Migration Support:**
- Handles old encounters without flow data
- Regenerates flow if missing

---

### H. EXPORT SYSTEM

**Three Formats:**

**Markdown Export:**
- `exportEncounterMarkdown()` - Creates .md file
- `generateEncounterMarkdown()` - Formats content
- Proper markdown headers, lists, emphasis

**Text Export:**
- `exportEncounterText()` - Creates .txt file
- `generateEncounterText()` - Plain text with separators

**PDF Export:**
- `exportEncounterPDF()` - Opens print dialog
- `generateEncounterHTML()` - Styled HTML for PDF
- Browser print-to-PDF workflow

**Download Helper:**
- `downloadFile(content, filename, mimeType)` - Blob download

**Modern UI:**
- `toggleEncounterMenu(event)` - Dropdown menu for actions
- `closeEncounterMenu()` - Close dropdown
- Compact design with organized sections

---

### I. STANDALONE NPC GENERATOR

**Function:** `generateNPC()`
- Independent NPC creation (not tied to encounter)
- Random species, profession, alignment, personality, secret, appearance
- Full display with roleplay tips
- Uses same NPC data as encounters

---

### J. SEARCH & FILTER SYSTEM

**Search Page Features:**

**Initialization:**
- `initializeSearchFilters()` - Build filter tag UI from data

**Filtering:**
- `toggleFilter(element, type, value)` - Multi-select filters
- Three filter types: environment, location type, setting
- `clearFilters()` - Reset all filters

**Search:**
- `performSearch()` - Text + tag-based search
- Searches encounters AND locations
- Returns merged results

**Display:**
- `displaySearchResults(results)` - Result list with preview buttons
- `previewResult(index)` - Modal preview
- `openResult(index)` - Generate encounter from search
- `closePreview()` - Close modal

**Active Filters State:**
```javascript
activeFilters = {
  environment: [],
  locationType: [],
  setting: []
}
```

---

### K. ROOM EXPLORATION (Legacy/Bonus Feature)

**Functions:**
- `exploreEncounterLocation()` - Generate random room from encounter
- `generateRoom(environment, locationType, locationData)` - Room details
- `displayRoomView()` - Render room with objects
- `exploreObject(level, index)` - Reveal object details
- `returnToEncounter()` - Back to main encounter

**Note:** This is a secondary feature for progressive reveal mode

---

## CSS ARCHITECTURE

### Theme System
**CSS Variables:**
```css
:root {
  --accent-blue: #007aff;
  --text-primary: #1d1d1f;
  --bg-primary: #f5f5f7;
  --hover-bg: rgba(0, 122, 255, 0.08);
  /* ...more variables */
}

[data-theme="dark"] {
  --accent-blue: #0a84ff;
  --text-primary: #f5f5f7;
  --bg-primary: #000000;
  /* ...dark variants */
}
```

### Key Component Styles
- `.controls` - Input forms and environment selection
- `.encounter-section` - Collapsible encounter segments
- `.location-detail-panel` - Slide-in location viewer
- `.npc-detail-panel` - Slide-in NPC viewer
- `.flow-navigator` - Floating step navigation
- `.encounter-dropdown` - Modern actions menu
- `.search-page` - Search/filter interface
- Responsive breakpoints at 768px

### Modern UX Elements
- Glassmorphism effects (backdrop-filter)
- Smooth transitions (0.2-0.3s)
- Gradient accents
- Hover states with transforms
- Collapsible sections with animations

---

## HTML STRUCTURE

### Main Container
```html
<div class="main-content" id="mainContent">
  <div class="container">
    <header>
      <!-- Title, navigation tabs -->
    </header>

    <!-- 4 Pages -->
    <div id="generatePage" class="page-content">...</div>
    <div id="npcPage" class="page-content">...</div>
    <div id="searchPage" class="page-content">...</div>
    <div id="settingsPage" class="page-content">...</div>

    <!-- Dynamic Panels -->
    <div id="locationDetailPanel" class="location-detail-panel">...</div>
    <div id="npcDetailPanel" class="npc-detail-panel">...</div>
    <div id="flowNavigator" class="flow-navigator">...</div>
  </div>
</div>
```

### Generate Page Components
- Environment tag selector (10 environments)
- Party level input (1-20)
- Number of locations input (1-5)
- Generate button
- Encounter display area
- Flow display sections
- Actions dropdown menu

### Search Page Components
- Search input
- Filter tags (environment, location type, setting)
- Results display area
- Preview modal

### Settings Page
- Theme toggle
- Progressive reveal toggle
- Future expansion area

---

## EVENT LISTENERS & INITIALIZATION

**On Page Load:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();           // Critical first step
  loadTheme();               // Apply saved theme
  loadProgressiveReveal();   // Apply saved preference
  
  // Environment tag click handlers
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => selectEnvironment(tag));
  });
});
```

**Global Event Listeners:**
- Click outside dropdown → `closeEncounterMenu()`
- Escape key → `closeEncounterMenu()`
- Environment tag clicks → select environment

---

## CRITICAL DEPENDENCIES & ASSUMPTIONS

1. **JSON Files Must Load:** App is non-functional without data
2. **LocalStorage Available:** Save/load requires browser localStorage
3. **Modern Browser:** ES6+, backdrop-filter, CSS Grid/Flex
4. **No Build Process:** Pure vanilla JS/HTML/CSS
5. **Tag System:** All content matching depends on consistent tagging
6. **Global State:** Heavy use of `window.*` for encounter state
7. **Synchronous After Load:** Data loading is async, everything else is sync

---

## KNOWN FEATURES & EDGE CASES

### Replayability
- Encounters support both single `description` string AND `descriptions` array
- Random selection from array provides variety
- Same for resolutions

### Custom Locations
- `customLocations` array in encounter template forces specific locations
- Overrides tag-based matching
- Ensures thematic consistency (e.g., "Clocktower District" → clocktower_district)

### Flow Generation
- NPCs integrated into location descriptions with `{{NPC}}` placeholders
- NPC names become clickable for detail view
- DM tips auto-generated based on NPCs/locations/encounter type

### Progressive Reveal Mode
- When enabled, shows "Explore Location" button
- Generates random room from encounter locations
- Shows objects in three tiers
- Legacy feature, not core to main workflow

### Encounter Editing
- Can regenerate individual locations without affecting others
- Can add/remove locations dynamically
- Can reorder locations (updates references)
- Can regenerate individual NPCs
- All changes update flow narrative

---

## TESTING CHECKLIST FOR POST-REFACTOR

### Core Generation
- [ ] Generate encounter in all 10 environments
- [ ] Verify 1-5 location selection works
- [ ] Verify party level affects DC calculations
- [ ] Check encounter descriptions (both string and array)
- [ ] Verify custom locations override tag matching
- [ ] Confirm NPCs match encounter theme
- [ ] Verify skill checks/traps/hazards/effects appear

### Flow & Navigation
- [ ] Encounter flow generates correctly
- [ ] Flow navigator populates and scrolls
- [ ] NPC names clickable in flow text
- [ ] Resolutions appear when available
- [ ] Step numbering correct
- [ ] DM tips generate properly

### Editing
- [ ] Regenerate location works
- [ ] Add location works
- [ ] Remove location works
- [ ] Move location up/down works
- [ ] Regenerate NPC works
- [ ] Flow updates after edits

### Detail Panels
- [ ] Location detail panel opens/closes
- [ ] Shows primary/secondary/tertiary objects
- [ ] Skill checks/traps/hazards display
- [ ] NPC detail panel opens/closes
- [ ] Shows all NPC information
- [ ] Tooltips work on hover

### Save/Load
- [ ] Save encounter prompts for name
- [ ] Saved encounters appear in list
- [ ] Load encounter restores full state
- [ ] Delete encounter works
- [ ] Old encounters migrate correctly

### Export
- [ ] Markdown export creates valid .md
- [ ] Text export creates readable .txt
- [ ] PDF export opens print dialog
- [ ] All content included in exports
- [ ] Dropdown menu opens/closes properly

### Search
- [ ] Search filters initialize
- [ ] Text search works
- [ ] Tag filters work (multi-select)
- [ ] Clear filters works
- [ ] Results display encounters AND locations
- [ ] Preview modal works
- [ ] Open result generates encounter

### NPC Generator
- [ ] Standalone NPC generation works
- [ ] All fields populate
- [ ] Display shows roleplay tips

### UI/UX
- [ ] Theme toggle persists
- [ ] Progressive reveal toggle persists
- [ ] Page navigation works
- [ ] Collapsible sections work
- [ ] Responsive layout (mobile)
- [ ] Dark mode styles correct
- [ ] Animations smooth

### Data Integrity
- [ ] All JSON files load
- [ ] Tag matching works correctly
- [ ] No duplicate NPCs in encounter
- [ ] Weights respected in selection
- [ ] Random selection actually random

---

## FUNCTION DEPENDENCY MAP

```
loadData()
  └─> ALL OTHER FUNCTIONS (must complete first)

generateEncounter()
  ├─> selectEncounterTemplate()
  ├─> buildEncounterDescription()
  ├─> selectNPCsForEncounter()
  ├─> selectLocationsForEncounter()
  │     └─> formatLocationName()
  ├─> selectSkillChecks()
  ├─> selectTraps()
  ├─> selectHazards()
  ├─> selectEnvironmentalEffects()
  ├─> generateEncounterFlow()
  │     └─> wrapNPCName()
  └─> [Sets global window.* variables]

regenerateFlowLocation()
  ├─> selectLocationsForEncounter()
  ├─> updateSubsequentFlowSteps()
  └─> rebuildEncounterDisplay()
      └─> renderFlowStep()

saveCurrentEncounter()
  └─> Uses window.* global state

loadSavedEncounter()
  ├─> Sets window.* global state
  └─> rebuildEncounterDisplay()

exportEncounter*()
  ├─> generateEncounter*()
  └─> downloadFile()
```

---

## GLOBAL STATE VARIABLES (Complete List)

```javascript
// Data
let encounterTitles = {};
let locationObjects = {};
let npcData = {};
let skillChecksData = {};
let dangersData = {};
let dataLoaded = false;

// Settings
let isProgressiveRevealEnabled = false;

// Search
let searchResults = [];
let activeFilters = { environment: [], locationType: [], setting: [] };

// Current Encounter State
window.encounterTitle
window.encounterDescription
window.encounterEnvironment
window.encounterPartyLevel
window.encounterTemplate
window.encounterLocationsData
window.encounterNPCsData
window.encounterSkillChecks
window.encounterTraps
window.encounterHazards
window.encounterEffects
window.encounterFlowData
```

---

## CONCLUSION

This application is a sophisticated encounter generator with:
- **~80 JavaScript functions** spanning generation, UI, search, save/load, export
- **Tag-based content matching** for thematic consistency
- **Dynamic flow generation** with NPC integration
- **Modern UX** with panels, navigation, animations
- **Full CRUD operations** on generated encounters
- **Multiple export formats** for game use
- **Progressive enhancement** through optional features

**Refactoring Goal:** Maintain 100% functionality while organizing code into modular structure for better maintainability, debugging, and future feature additions.
