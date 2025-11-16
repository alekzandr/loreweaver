#!/usr/bin/env node
/**
 * LoreWeaver - Species Capitalization Tests
 * Tests that all species names are properly capitalized when displayed
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Species Capitalization Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log('✅', name);
        passed++;
    } catch (error) {
        console.log('❌', name, ':', error.message);
        failed++;
    }
}

// Load NPC data
const npcDataPath = path.join(__dirname, '..', 'data', 'npcs.json');
const npcData = JSON.parse(fs.readFileSync(npcDataPath, 'utf8'));

// Import the capitalization function logic
function capitalizeSpecies(species) {
    if (!species || typeof species !== 'string') {
        return species;
    }
    
    return species
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
}

console.log('==================================================');
console.log('Testing Species Capitalization Function');
console.log('==================================================\n');

// Test the capitalization function
test('Capitalizes single-word species', () => {
    if (capitalizeSpecies('human') !== 'Human') throw new Error('Failed for "human"');
    if (capitalizeSpecies('elf') !== 'Elf') throw new Error('Failed for "elf"');
    if (capitalizeSpecies('dwarf') !== 'Dwarf') throw new Error('Failed for "dwarf"');
});

test('Capitalizes hyphenated species', () => {
    if (capitalizeSpecies('half-elf') !== 'Half-Elf') throw new Error('Failed for "half-elf"');
    if (capitalizeSpecies('half-orc') !== 'Half-Orc') throw new Error('Failed for "half-orc"');
    if (capitalizeSpecies('shadow-fey') !== 'Shadow-Fey') throw new Error('Failed for "shadow-fey"');
    if (capitalizeSpecies('yuan-ti') !== 'Yuan-Ti') throw new Error('Failed for "yuan-ti"');
});

test('Handles edge cases', () => {
    if (capitalizeSpecies('') !== '') throw new Error('Failed for empty string');
    if (capitalizeSpecies(null) !== null) throw new Error('Failed for null');
    if (capitalizeSpecies(undefined) !== undefined) throw new Error('Failed for undefined');
});

test('Handles already capitalized species', () => {
    if (capitalizeSpecies('Human') !== 'Human') throw new Error('Failed for "Human"');
    if (capitalizeSpecies('Half-Elf') !== 'Half-Elf') throw new Error('Failed for "Half-Elf"');
});

console.log('\n==================================================');
console.log('Testing All Species in NPC Data');
console.log('==================================================\n');

// Test all species in the data file
test('All species keys are lowercase', () => {
    const speciesKeys = Object.keys(npcData.species);
    const nonLowercase = speciesKeys.filter(key => key !== key.toLowerCase());
    
    if (nonLowercase.length > 0) {
        throw new Error(`Found non-lowercase species keys: ${nonLowercase.join(', ')}`);
    }
});

test('All species can be properly capitalized', () => {
    const speciesKeys = Object.keys(npcData.species);
    const expected = {
        'human': 'Human',
        'elf': 'Elf',
        'dwarf': 'Dwarf',
        'halfling': 'Halfling',
        'dragonborn': 'Dragonborn',
        'tiefling': 'Tiefling',
        'gnome': 'Gnome',
        'half-elf': 'Half-Elf',
        'half-orc': 'Half-Orc',
        'genasi': 'Genasi',
        'aasimar': 'Aasimar',
        'goliath': 'Goliath',
        'kenku': 'Kenku',
        'kobold': 'Kobold',
        'harengon': 'Harengon',
        'satyr': 'Satyr',
        'shadow-fey': 'Shadow-Fey',
        'shifter': 'Shifter',
        'yuan-ti': 'Yuan-Ti',
        'aarakocra': 'Aarakocra'
    };
    
    const errors = [];
    speciesKeys.forEach(key => {
        const capitalized = capitalizeSpecies(key);
        if (expected[key] && capitalized !== expected[key]) {
            errors.push(`Expected "${key}" to become "${expected[key]}", got "${capitalized}"`);
        }
    });
    
    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }
});

test('Species count matches expected', () => {
    const speciesKeys = Object.keys(npcData.species);
    console.log(`  Found ${speciesKeys.length} species in data`);
    
    if (speciesKeys.length < 10) {
        throw new Error(`Expected at least 10 species, found ${speciesKeys.length}`);
    }
});

test('Each species has required data', () => {
    const speciesKeys = Object.keys(npcData.species);
    const errors = [];
    
    speciesKeys.forEach(key => {
        const species = npcData.species[key];
        
        if (!species.firstNames || !Array.isArray(species.firstNames)) {
            errors.push(`${key}: missing or invalid firstNames`);
        }
        if (!species.surnames || !Array.isArray(species.surnames)) {
            errors.push(`${key}: missing or invalid surnames`);
        }
        if (!species.tags || !Array.isArray(species.tags)) {
            errors.push(`${key}: missing or invalid tags`);
        }
    });
    
    if (errors.length > 0) {
        throw new Error(errors.join('; '));
    }
});

console.log('\n==================================================');
console.log('Capitalized Species List');
console.log('==================================================\n');

const speciesKeys = Object.keys(npcData.species).sort();
speciesKeys.forEach(key => {
    console.log(`  ${key.padEnd(15)} → ${capitalizeSpecies(key)}`);
});

console.log('\n==================================================');
console.log('📊 Test Results');
console.log('==================================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Total:  ${passed + failed}`);
console.log('==================================================\n');

if (failed === 0) {
    console.log('✨ All species capitalization tests passed!\n');
} else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
}

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
