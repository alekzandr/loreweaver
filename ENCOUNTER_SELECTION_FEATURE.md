# Encounter Selection Feature

## Overview
The Encounter Selection feature allows users to select a specific encounter from search results and use it as the basis for generating a complete encounter on the Generate page. This provides a more targeted and intentional encounter generation experience.

## User Flow

1. **Search for Encounters**: Navigate to the Search page and search for encounters by keywords, tags, or filters
2. **Browse Results**: View detailed encounter information including descriptions and resolutions
3. **Select Encounter**: Click the "🎲 Use for Generation" button on any encounter
4. **Automatic Setup**: The app automatically:
   - Switches to the Generate page
   - Sets the environment to match the selected encounter
   - Clears the seed field for randomization
   - Shows a notification banner
5. **Customize & Generate**: Adjust party level, number of locations, or provide a custom seed, then generate

## Technical Implementation

### Components Modified

#### 1. Search Results UI (`assets/js/app.js`)
- Added "Use for Generation" button to each encounter result card
- Button calls `useEncounterForGeneration()` with encounter data

#### 2. Generation Logic (`index.html`)
- Modified `generateEncounter()` to check for `window.preselectedEncounter`
- Uses preselected encounter instead of random selection when available
- Clears preselected encounter after use

#### 3. State Management (`assets/js/app.js`)
- New function: `useEncounterForGeneration(environment, encounterData)`
- Sets `window.preselectedEncounter` with encounter template
- Updates environment selector
- Clears seed input
- Switches to Generate page
- Shows notification banner

#### 4. Styling (`assets/css/components.css`)
- New styles for `.use-for-gen-btn` with gradient background
- New styles for `.encounter-selected-banner` with slide-in animation
- Banner includes close button and auto-dismiss after 8 seconds

### Data Flow

```
User clicks "Use for Generation"
    ↓
useEncounterForGeneration(env, encounter)
    ↓
window.preselectedEncounter = {environment, template}
    ↓
Update UI (environment selector, clear seed)
    ↓
Switch to Generate page
    ↓
Show notification banner
    ↓
User clicks "Generate Encounter"
    ↓
generateEncounter() checks preselectedEncounter
    ↓
Use preselected template (or random if null)
    ↓
Clear preselectedEncounter
    ↓
Generate locations, NPCs, etc. as normal
```

### Global State

```javascript
window.preselectedEncounter = {
    environment: string,  // e.g., "urban", "forest"
    template: object      // Full encounter object with title, descriptions, tags, etc.
}
```

## Testing

### Unit Tests (`tests/test-encounter-selection.js`)
- Verifies `useEncounterForGeneration` sets correct state
- Tests environment selector updates
- Tests seed input clearing
- Tests preselected encounter cleanup
- Can be run with: `npm run test:encounter-selection`

### Integration Tests (`tests/integration-encounter-selection.js`)
- Browser-based tests for complete user flow
- Tests page navigation
- Tests banner creation and dismissal
- Tests encounter generation with preselected template
- Can be run by opening `index.html?test=true` and clicking test button

### CI/CD Integration
- Tests run automatically on push to `main` or `develop` branches
- Tests run on all pull requests
- Included in the `npm test` suite

## Usage Examples

### Example 1: Search and Select
```javascript
// User searches for "alley" on Search page
// Clicks "Use for Generation" on "The Shadowed Alley"
// Generate page opens with:
// - Environment: urban
// - Encounter template: The Shadowed Alley
// - Banner: "Ready to generate: The Shadowed Alley"
```

### Example 2: Customize After Selection
```javascript
// After selecting an encounter:
// 1. User changes Party Level to 10
// 2. User changes Locations to 5
// 3. User provides custom seed "myseed123"
// 4. Clicks "Generate Encounter"
// Result: The Shadowed Alley encounter with customized parameters
```

### Example 3: Cancel Selection
```javascript
// User clicks "Use for Generation"
// Sees banner notification
// Clicks X on banner to dismiss
// Clicks environment selector and chooses different environment
// Clicks "Generate Encounter"
// Result: Random encounter from newly selected environment
// (preselectedEncounter was cleared when environment changed)
```

## Benefits

1. **Targeted Generation**: Users can preview encounters and select specific scenarios
2. **Maintains Flexibility**: Users can still customize party level, locations, and seed
3. **Seamless UX**: Automatic page switching and visual feedback
4. **No Breaking Changes**: Existing random generation still works exactly as before
5. **Discoverable**: Clear button on search results makes feature obvious

## Future Enhancements

Potential improvements for future versions:

1. **Favorite Encounters**: Allow users to star/favorite encounters for quick access
2. **Recent Selections**: Show recently selected encounters in Generate page
3. **Bulk Selection**: Select multiple encounters and randomize between them
4. **Encounter Variations**: Generate multiple variations of the same encounter
5. **Share Selected Encounters**: Generate shareable links with pre-selected encounters

## Compatibility

- ✅ Works with all existing features (save/load, export, progressive reveal)
- ✅ Compatible with seeded generation
- ✅ Supports all environment types
- ✅ Works with custom filters and search
- ✅ Mobile responsive

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Performance Impact

- Minimal: Only adds one event handler per search result
- Banner auto-removes after 8 seconds to prevent memory leaks
- No impact on generation speed or quality

## Accessibility

- Button has clear text label with emoji
- Banner can be dismissed with keyboard (close button is focusable)
- Color contrast meets WCAG AA standards
- Screen reader friendly
