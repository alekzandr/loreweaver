# Species Capitalization Feature

## Overview
All species names in LoreWeaver are now consistently displayed with proper capitalization throughout the application, including support for hyphenated species names like Half-Elf and Yuan-Ti.

## Implementation

### Core Function
The `capitalizeSpecies()` function in `assets/js/utils.js` handles all species capitalization:

```javascript
export function capitalizeSpecies(species) {
    if (!species || typeof species !== 'string') {
        return species;
    }
    
    return species
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
}
```

### Data Storage
- Species keys remain **lowercase** in `data/npcs.json` (e.g., `human`, `half-elf`, `shadow-fey`, `yuan-ti`)
- Capitalization is applied only at the **display layer**

## Species List
The following 20 species are supported:

| Lowercase Key | Capitalized Display |
|--------------|---------------------|
| aarakocra    | Aarakocra          |
| aasimar      | Aasimar            |
| dragonborn   | Dragonborn         |
| dwarf        | Dwarf              |
| elf          | Elf                |
| genasi       | Genasi             |
| gnome        | Gnome              |
| goliath      | Goliath            |
| half-elf     | Half-Elf           |
| half-orc     | Half-Orc           |
| halfling     | Halfling           |
| harengon     | Harengon           |
| human        | Human              |
| kenku        | Kenku              |
| kobold       | Kobold             |
| satyr        | Satyr              |
| shadow-fey   | Shadow-Fey         |
| shifter      | Shifter            |
| tiefling     | Tiefling           |
| yuan-ti      | Yuan-Ti            |

## Files Modified

### 1. `assets/js/utils.js`
- Added `capitalizeSpecies()` function
- Exported function for use across modules
- Exposed to window object for inline scripts

### 2. `assets/js/core.js`
- Imported `capitalizeSpecies` function
- Updated NPC display template to use `capitalizeSpecies(npc.species)`

### 3. `assets/js/export.js`
- Imported `capitalizeSpecies` function
- Updated Markdown export format
- Updated Plain Text export format
- Updated HTML export format

### 4. `assets/js/ui.js`
- Imported `capitalizeSpecies` function
- Updated NPC flow visualization
- Updated location detail panel
- Updated NPC detail panel
- Updated NPC tooltip

## Testing

### Test Suite
Created comprehensive test suite in `tests/test-species-capitalization.js`:

**Tests Include:**
- ✅ Single-word species capitalization (human → Human)
- ✅ Hyphenated species capitalization (half-elf → Half-Elf)
- ✅ Edge case handling (null, undefined, empty string)
- ✅ Already capitalized species (idempotent)
- ✅ Data validation (all keys lowercase)
- ✅ Complete species mapping verification
- ✅ Species count validation
- ✅ Required data structure validation

### Running Tests
```bash
npm run test:species    # Run species tests only
npm test                # Run all tests including species
```

### Test Results
```
🧪 Running Species Capitalization Tests

==================================================
Testing Species Capitalization Function
==================================================
✅ Capitalizes single-word species
✅ Capitalizes hyphenated species
✅ Handles edge cases
✅ Handles already capitalized species

==================================================
Testing All Species in NPC Data
==================================================
✅ All species keys are lowercase
✅ All species can be properly capitalized
  Found 20 species in data
✅ Species count matches expected
✅ Each species has required data

📊 Test Results: 8 passed, 0 failed
```

## Usage Examples

### In JavaScript Modules
```javascript
import { capitalizeSpecies } from './utils.js';

const display = capitalizeSpecies('half-elf');  // Returns "Half-Elf"
```

### In Inline Scripts (index.html)
```javascript
const display = window.capitalizeSpecies(npc.species);
```

### In Templates
```javascript
`${capitalizeSpecies(npc.species)} ${npc.profession.name}`
```

## Benefits

1. **Consistency**: All species display the same way across the entire application
2. **Professional Appearance**: Proper capitalization improves readability
3. **Hyphenated Support**: Correctly handles complex species names (Half-Elf, Shadow-Fey, Yuan-Ti)
4. **Maintainability**: Single function handles all capitalization logic
5. **Data Integrity**: Data files remain lowercase for consistency
6. **Tested**: Comprehensive test suite ensures correctness
7. **Export Support**: Species are properly capitalized in Markdown, TXT, and HTML exports

## CI/CD Integration

The species capitalization tests are automatically run as part of the test suite:
- Runs on every push to GitHub
- Integrated into `npm test` command
- Added to `package.json` scripts as `test:species`
- Part of the complete validation pipeline

## Future Considerations

If adding new species:
1. Add the lowercase key to `data/npcs.json`
2. The `capitalizeSpecies()` function will automatically handle it
3. Add expected mapping to the test file for validation
4. Run `npm run test:species` to verify
