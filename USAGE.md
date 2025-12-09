# LoreWeaver - Usage Guide

## Quick Start

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No installation, server, or build process required

2. **Generate an Adventure**
   - Click on an environment tag to select it (it will highlight)
   - Set your party's level (1-20) using the number input
   - Click "🎲 Generate Adventure" button
   - A complete adventure will be displayed below

3. **Search & Browse**
   - Use the Search tab to explore all adventures and locations
   - Apply filters to find specific content types
   - View detailed information with expandable cards

## Understanding Generated Adventures

Each adventure includes:

### 1. Title & Description
- Unique adventure name based on the environment
- Thematic description setting the scene

### 2. Skill Challenges (3-4 per encounter)
- Skill name and purpose
- DC (Difficulty Class) scaled to party level
- Success/failure consequences
- Suggested checks appropriate to the environment

### 3. Traps (1-3 per encounter)
- Trap name and description
- Detection DC (Perception/Investigation)
- Disarm DC (usually +2 from detection)
- Damage dice scaled to party level

### 4. Environmental Hazards (2-3 per encounter)
- Natural or environmental dangers
- Save DC appropriate to party level
- Mitigation strategies

### 5. Environmental Effects (1-2 per encounter)
- Persistent conditions affecting the area
- Mechanical impact on gameplay

### 6. Level Scaling Guide
- Specific recommendations for the party's level
- General scaling tips for DMs
- Adjustment suggestions for different party compositions

### 7. Resolution & Rewards
- Success criteria
- Suggested rewards
- DM tips for running the adventure

## Environment Types

Each environment has unique characteristics:

- **🏛️ Urban**: City streets, rooftops, sewers, markets
- **❄️ Arctic**: Frozen tundra, ice caves, blizzards
- **🌊 Ocean**: Open water, storms, reefs, underwater
- **🌌 Space**: Void, stations, cosmic phenomena
- **💀 Crypt**: Tombs, catacombs, undead threats
- **🌲 Forest**: Dense woods, wilderness, natural hazards
- **🏜️ Desert**: Sand dunes, heat, dehydration
- **⛰️ Mountain**: Peaks, cliffs, altitude challenges
- **🐊 Swamp**: Wetlands, bogs, disease, toxic water
- **🕳️ Underground**: Caves, darkness, confined spaces

## Customization Tips

### Adjusting Difficulty
- **Easier**: Lower all DCs by 2-3, halve damage dice
- **Harder**: Raise all DCs by 2-3, add 50% to damage dice
- **Time Pressure**: Add countdown timers to increase tension
- **Complications**: Layer multiple hazards for complex adventures

### Adapting to Your Party
- If party lacks certain skills, provide alternative solutions
- Consider class abilities (e.g., rangers in forest, rogues in urban)
- Scale number of challenges based on session time available
- Combine with combat encounters for variety

### Using in Your Campaign
- Generate adventures for random travel
- Create location-specific challenges
- Build multi-adventure sequences
- Use as inspiration for custom scenarios

## Pro Tips

1. **Generate Multiple Options**: Create 2-3 adventures and pick the best fit
2. **Mix and Match**: Combine elements from different generated adventures
3. **Add NPCs**: Drop in friendly or hostile NPCs to complicate situations
4. **Consequences**: Failed checks should have interesting consequences, not just damage
5. **Reward Creativity**: Allow players to use abilities in unexpected ways

## Search & Browse Features

### Advanced Filtering
LoreWeaver includes a powerful search system to explore all content:

#### Filter Options
- **Type Filter**: Choose between Adventures Only, Locations Only, or All Types
- **Environment Filter**: Filter by specific environments (Urban, Arctic, Ocean, etc.)
- **Location Type Filter**: For locations only - filter by type (tavern, shop, landmark, etc.)
- **Setting Filter**: Filter locations by setting tags (urban, rural, coastal, etc.)
- **Plane Filter**: Filter by plane of existence

#### Dynamic Filtering
- Filters update dynamically based on your selections
- Each option shows a count of available results
- Select any filter first - the system intelligently updates other filters
- Clear All Filters button resets everything

#### Search Results
- **Paginated Display**: Results show 5, 10, 15, or 20 items per page
- **Result Count**: See total results with breakdown by type
- **Expandable Cards**: Click on descriptions and resolutions to expand/collapse
- **Location Details**: Locations show three-column layout with Primary Features, Secondary Features, and Discoveries

#### Pagination Controls
- Navigate with simple `‹` and `›` buttons
- See current page (e.g., "1 / 50")
- Change items per page on the fly
- Pagination appears at both top and bottom of results

### Quick Tips
1. Click Search with no filters to see all content
2. Use Type filter first to narrow to Adventures or Locations
3. Filter combinations update dynamically - no invalid selections
4. Click on any result card to expand full details
5. Use pagination to browse large result sets efficiently

## Technical Notes

- Works offline - save the HTML file locally
- No data is collected or sent anywhere
- Modular ES6 JavaScript architecture
- Fully responsive design for all screen sizes
- Refreshing the page resets the generator
- Each generation creates a unique combination
- Compatible with all modern browsers (Chrome, Firefox, Safari, Edge)

Enjoy creating memorable exploration adventures!
