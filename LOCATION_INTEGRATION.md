# Location-Integrated Skill Checks & Dangers

## Overview
Skill checks, traps, and hazards are now **contextually embedded within location panels** rather than shown as separate standalone sections. This creates a more immersive, natural exploration experience where challenges are discovered as the DM explores each location.

## How It Works

### 1. Removed Standalone Sections
The following sections have been **removed** from the main encounter display:
- ~~🎯 Skill Challenges~~
- ~~⚠️ Traps~~
- ~~💥 Environmental Hazards~~
- ~~🌪️ Environmental Effects~~

### 2. New Helper Functions
Three new functions smartly match content to specific locations:

**`getSkillChecksForLocation(locationTags)`**
- Scores all skill checks against the location's tags
- Returns 2-3 most relevant checks for that specific location
- Uses tag matching to ensure contextual relevance

**`getTrapsForLocation(locationTags)`**
- Scores traps against location tags
- 40% chance to return 1 trap if tags match
- Returns empty array if no good matches

**`getHazardsForLocation(locationTags)`**
- Scores hazards against location tags
- 50% chance to return 1 hazard if tags match
- Returns empty array if no good matches

### 3. Integration Points

#### A. Environmental Hazards (Top of Panel)
- Displayed at the **top** of location panel as warning banners
- Shows hazard name, description, save DC, and effect
- Orange warning styling (`⚠️` icon)
- Always visible when present

**Example:**
```
⚠️ Slippery Floor
The floor is slick with moisture and algae
Save: Dexterity DC 13 | Effect: Fall prone on failed save
```

#### B. Skill Checks (Primary Features Section)
- Shown in **Progressive Reveal mode** when viewing primary features
- Shown in **Show All mode** as separate section after primary features
- Displays full skill check details (DC, challenge, success, failure)
- Blue accent styling with DC badges
- 2-3 contextually relevant checks per location

**Example in Progressive Mode:**
```
🔍 Primary Features
[Hot Pools] - click to investigate
[Steam Vents] - click to investigate
[Marble Benches] - click to investigate

🎯 Possible Skill Checks
━━━━━━━━━━━━━━━━━━━━
Perception                    DC 12
Listen for whispered conversations
Success: Overhear noble gossip
Failure: Miss the conversation

Stealth                       DC 14
Move undetected through steam
Success: Position unnoticed
Failure: Nobles notice you
```

#### C. Traps (Hidden Discoveries - Tertiary Level)
- **30% chance** a hidden discovery is actually a trap
- Replaces the normal tertiary discovery content
- Shows full trap details (detect DC, disarm DC, damage, severity)
- Red danger styling (`🪤` icon)
- Contextual to what was being investigated

**Example:**
When clicking: Hot Pools → Investigate drain grate → *Hidden discovery*

Instead of treasure, might reveal:
```
⚠️ TRAP: Pressure Plate
Stepping on the loose tile triggers a poison dart
Detect: Perception check (DC 13)
Disarm: Thieves' Tools check (DC 15)
Damage: Poison | Severity: moderate
🪤 Hidden danger! Players trigger unless they search first.
```

#### D. Traps Section (Show All Mode Only)
- When "Show All" mode enabled, traps appear as dedicated section
- Listed after hidden discoveries
- Shows all possible traps for the location

### 4. Example Walkthrough

**Location: Public Bathhouse**

**Step 1: Click Location**
- Panel opens with location description
- ⚠️ Hazard appears at top: "Steam Obscurement - Lightly obscured area"

**Step 2: View Primary Features** (Progressive Mode)
- Hot Pools (clickable)
- Changing Rooms (clickable)
- Attendant Station (clickable)

Below features:
- 🎯 **Perception DC 12**: "Eavesdrop on conversations in the pools"
- 🎯 **Stealth DC 14**: "Move through steam without being noticed"
- 🎯 **Insight DC 13**: "Read body language of nobles"

**Step 3: Click "Hot Pools"**
- Shows secondary detail: "Gossiping nobles relaxing in the water"
- Click again to dig deeper...

**Step 4: Investigate Deeper**
- **70% chance**: Normal discovery - "Hidden waterproof pouch with messages"
- **30% chance**: TRAP! - "Poisoned Needle in drain mechanism"

## Benefits

### 1. **Immersive Discovery**
DM discovers challenges naturally while exploring locations, not as a checklist.

### 2. **Contextual Relevance**
Skill checks make sense for the location (Perception in pools with gossip, Stealth in steam).

### 3. **Dynamic Tension**
Not knowing if a hidden discovery is treasure or a trap adds excitement.

### 4. **Reduced Clutter**
Main encounter view is cleaner without 4 separate sections.

### 5. **Location-Focused Design**
Everything needed to run a location is in one panel on the right side.

### 6. **Progressive Reveal Friendly**
Works perfectly with both modes:
- **Progressive**: Discover checks as you drill down
- **Show All**: See everything at once in organized sections

## Technical Details

### Storage
During encounter generation, skill checks/traps/hazards are stored globally:
```javascript
window.encounterSkillChecks = selectedSkills;
window.encounterTraps = selectedTraps;
window.encounterHazards = selectedHazards;
window.encounterPartyLevel = partyLevel;
```

### Selection Process
When showing location detail:
1. Get location's tags
2. Score all skill checks/traps/hazards against those tags
3. Select top matches with randomization
4. Display contextually in appropriate sections

### Probability Tuning
- **Skill Checks**: Always show 2-3 if tags match (0 if poor match)
- **Traps**: 40% chance to appear in location panel
- **Traps in Discoveries**: 30% chance to replace tertiary content
- **Hazards**: 50% chance to appear as warning banner

### Tag Matching Example
```javascript
Location: "Public Bathhouse"
Tags: ["indoor", "urban", "water", "social", "luxury"]

Skill Check: "Eavesdrop on nobles"
Tags: ["perception", "wisdom", "social", "urban", "stealth"]
Match Score: 2 (social + urban) → HIGH RELEVANCE ✓

Trap: "Poisoned Needle"
Tags: ["mechanical", "trap", "crime", "urban", "indoor"]
Match Score: 2 (urban + indoor) → MODERATE RELEVANCE ✓

Hazard: "Extreme Cold"
Tags: ["cold", "arctic", "environmental", "weather"]
Match Score: 0 → NO RELEVANCE ✗
```

## DM Experience

### Before (Old System)
1. Generate encounter
2. Read main description
3. Scroll down to separate "Skill Checks" section
4. Scroll down to separate "Traps" section
5. Scroll down to separate "Hazards" section
6. Try to remember which applies to which location
7. Click location to see details
8. Alt-tab between panels

### After (New System)
1. Generate encounter
2. Read main description
3. Click location in encounter flow
4. **Everything for that location appears in one panel:**
   - Hazard warnings at top
   - Primary features to investigate
   - Relevant skill checks for those features
   - Possible traps in hidden areas
5. Drill down progressively or view all at once
6. All information contextual and location-specific

## Future Enhancements

### Possible Additions:
1. **Skill checks embedded in feature text**: "Hot Pools (🎯 Perception DC 12 to overhear)"
2. **Trap hints in secondary text**: "The grate seems suspicious..." (foreshadowing)
3. **NPC integration**: NPCs present in location shown in panel
4. **Difficulty indicators**: Color-code DCs based on party level
5. **Success rate calculator**: Show percentage chance with party stats

### Advanced Features:
- **Multi-location traps**: Trap that spans two connected locations
- **Hazard progression**: Hazards that worsen over time in location
- **Skill check chains**: Success on one check enables another
- **Environmental storytelling**: Hazards hint at location history

## Summary

Skill checks and dangers are no longer isolated from locations. They're **contextually integrated** into location panels, creating a cohesive exploration experience where the DM discovers challenges naturally as they explore each area.

The system:
- ✅ Removes clutter from main view
- ✅ Uses smart tag-based matching
- ✅ Respects progressive reveal preferences
- ✅ Adds dynamic tension (trap vs. treasure)
- ✅ Provides all location info in one place
- ✅ Maintains immersion and flow
