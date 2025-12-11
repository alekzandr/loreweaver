#!/usr/bin/env node

/**
 * Content Validation Script
 * Validates submitted content against JSON schemas
 * 
 * Usage:
 *   node scripts/validate-content.js [file or directory]
 *   node scripts/validate-content.js --fix [file or directory]
 *   npm run validate:content
 * 
 * Options:
 *   --fix                Auto-fix common issues (formatting, casing, whitespace)
 *   --report             Generate detailed validation report
 *   --check-production   Check against production data for duplicates
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize AJV with strict mode
const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: true
});
addFormats(ajv);

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Command-line options
const options = {
    fix: false,
    report: false,
    checkProduction: false
};

// Validation statistics
const stats = {
    totalFiles: 0,
    validFiles: 0,
    invalidFiles: 0,
    errors: [],
    warnings: [],
    fixed: [],
    suggestions: []
};

// Production data cache
const productionData = {
    encounters: null,
    locations: null,
    npcs: null,
    skillchecks: null,
    dangers: null
};

// Load all schemas
const schemas = {};
const schemaDir = path.join(__dirname, '..', 'schemas');
const schemaFiles = {
    encounter: 'encounter-schema.json',
    location: 'location-schema.json',
    npc: 'npc-schema.json',
    skillcheck: 'skillcheck-schema.json',
    danger: 'danger-schema.json'
};

/**
 * Load production data for cross-referencing
 */
function loadProductionData() {
    if (!options.checkProduction) return;

    console.log(`${colors.cyan}📚 Loading production data for cross-referencing...${colors.reset}\n`);

    const dataDir = path.join(__dirname, '..', 'data');
    const dataFiles = ['encounters.json', 'locations.json', 'npcs.json', 'skillchecks.json', 'dangers.json'];

    for (const filename of dataFiles) {
        const filePath = path.join(dataDir, filename);
        const key = filename.replace('.json', '');

        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                productionData[key] = JSON.parse(content);
                console.log(`${colors.green}✅${colors.reset} Loaded: ${filename}`);
            } catch (error) {
                console.log(`${colors.yellow}⚠️${colors.reset}  Failed to load ${filename}: ${error.message}`);
            }
        }
    }

    console.log('');
}

/**
 * Extract all tags from production data
 */
function extractProductionTags() {
    const tags = new Set();

    if (productionData.encounters) {
        Object.values(productionData.encounters).forEach(categoryEncounters => {
            if (Array.isArray(categoryEncounters)) {
                categoryEncounters.forEach(enc => {
                    if (enc.tags) enc.tags.forEach(tag => tags.add(tag));
                });
            }
        });
    }

    if (productionData.locations) {
        Object.values(productionData.locations).forEach(categoryLocations => {
            Object.values(categoryLocations).forEach(loc => {
                if (loc.tags) loc.tags.forEach(tag => tags.add(tag));
            });
        });
    }

    if (productionData.npcs && productionData.npcs.species) {
        Object.values(productionData.npcs.species).forEach(species => {
            if (species.tags) species.tags.forEach(tag => tags.add(tag));
        });
    }

    if (productionData.skillchecks) {
        Object.values(productionData.skillchecks).forEach(categoryChecks => {
            if (Array.isArray(categoryChecks)) {
                categoryChecks.forEach(check => {
                    if (check.tags) check.tags.forEach(tag => tags.add(tag));
                });
            }
        });
    }

    if (productionData.dangers) {
        Object.values(productionData.dangers).forEach(categoryDangers => {
            if (Array.isArray(categoryDangers)) {
                categoryDangers.forEach(danger => {
                    if (danger.tags) danger.tags.forEach(tag => tags.add(tag));
                });
            }
        });
    }

    return tags;
}

/**
 * Check if content already exists in production
 */
function checkProductionDuplicates(content, contentType) {
    const duplicates = [];

    if (!options.checkProduction) return duplicates;

    if (contentType === 'encounter' && productionData.encounters) {
        Object.values(productionData.encounters).forEach(categoryEncounters => {
            if (Array.isArray(categoryEncounters)) {
                categoryEncounters.forEach(enc => {
                    if (enc.title.toLowerCase() === content.title.toLowerCase()) {
                        duplicates.push(`Encounter title "${content.title}" already exists in production`);
                    }
                });
            }
        });
    }

    if (contentType === 'location' && productionData.locations) {
        Object.values(productionData.locations).forEach(categoryLocations => {
            if (categoryLocations[content.key]) {
                duplicates.push(`Location key "${content.key}" already exists in production`);
            }
        });
    }

    if (contentType === 'npc' && content.type === 'species' && productionData.npcs?.species) {
        if (productionData.npcs.species[content.key]) {
            duplicates.push(`NPC species key "${content.key}" already exists in production`);
        }
    }

    return duplicates;
}

/**
 * Auto-fix common issues
 */
function autoFixContent(content, contentType, filePath) {
    const fixes = [];
    let modified = false;

    // Fix: Trim whitespace from strings
    function trimStrings(obj) {
        if (typeof obj === 'string') {
            const trimmed = obj.trim();
            if (trimmed !== obj) {
                modified = true;
                return trimmed;
            }
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(trimStrings);
        }
        if (obj && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = trimStrings(value);
            }
            return result;
        }
        return obj;
    }

    content = trimStrings(content);
    if (modified) {
        fixes.push('Trimmed whitespace from strings');
        modified = false;
    }

    // Fix: Ensure tags are lowercase-hyphenated
    if (content.tags && Array.isArray(content.tags)) {
        const originalTags = [...content.tags];
        content.tags = content.tags.map(tag => {
            const fixed = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (fixed !== tag) modified = true;
            return fixed;
        });
        if (modified) {
            fixes.push(`Fixed tag formatting: ${originalTags.join(', ')} → ${content.tags.join(', ')}`);
            modified = false;
        }
    }

    // Fix: Ensure location keys are lowercase-hyphenated
    if (contentType === 'location' && content.key) {
        const originalKey = content.key;
        content.key = content.key.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (content.key !== originalKey) {
            fixes.push(`Fixed location key: ${originalKey} → ${content.key}`);
        }
    }

    // Fix: Ensure NPC species keys are lowercase
    if (contentType === 'npc' && content.type === 'species' && content.key) {
        const originalKey = content.key;
        content.key = content.key.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (content.key !== originalKey) {
            fixes.push(`Fixed NPC species key: ${originalKey} → ${content.key}`);
        }
    }

    // Fix: Ensure encounter weight is within reasonable bounds
    if (contentType === 'encounter' && content.weight) {
        const originalWeight = content.weight;
        if (content.weight < 0.5) {
            content.weight = 0.5;
            fixes.push(`Adjusted weight from ${originalWeight} to minimum 0.5`);
        } else if (content.weight > 2.0) {
            content.weight = 2.0;
            fixes.push(`Adjusted weight from ${originalWeight} to maximum 2.0`);
        }
    }

    // Write fixes back to file if any were made
    if (fixes.length > 0 && options.fix) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
            stats.fixed.push({ file: path.relative(process.cwd(), filePath), fixes });
        } catch (error) {
            console.log(`  ${colors.red}❌ Failed to write fixes: ${error.message}${colors.reset}`);
        }
    }

    return { content, fixes };
}

/**
 * Load JSON schemas
 */
function loadSchemas() {
    console.log(`${colors.cyan}📚 Loading validation schemas...${colors.reset}\n`);

    for (const [key, filename] of Object.entries(schemaFiles)) {
        const schemaPath = path.join(schemaDir, filename);

        if (!fs.existsSync(schemaPath)) {
            console.error(`${colors.red}❌ Schema not found: ${filename}${colors.reset}`);
            process.exit(1);
        }

        try {
            const schemaContent = fs.readFileSync(schemaPath, 'utf8');
            schemas[key] = JSON.parse(schemaContent);
            ajv.addSchema(schemas[key], key);
            console.log(`${colors.green}✅${colors.reset} Loaded: ${filename}`);
        } catch (error) {
            console.error(`${colors.red}❌ Failed to load ${filename}: ${error.message}${colors.reset}`);
            process.exit(1);
        }
    }

    console.log('');
}

/**
 * Determine content type from file path or content
 */
function determineContentType(filePath, content) {
    const fileName = path.basename(filePath).toLowerCase();
    const dirName = path.basename(path.dirname(filePath)).toLowerCase();

    // Try to determine from directory structure
    if (dirName.includes('encounter')) return 'encounter';
    if (dirName.includes('location')) return 'location';
    if (dirName.includes('npc')) return 'npc';
    if (dirName.includes('skillcheck')) return 'skillcheck';
    if (dirName.includes('danger')) return 'danger';

    // Try to determine from content structure
    if (content.type) {
        return content.type === 'species' || content.type === 'profession' ||
            content.type === 'alignment' || content.type === 'personality'
            ? 'npc'
            : content.type;
    }

    if (content.category === 'trap' || content.category === 'hazard') return 'danger';
    if (content.skill) return 'skillcheck';
    if (content.title && content.resolutions) return 'encounter';
    if (content.key && content.primary && content.secondary) return 'location';

    return null;
}

/**
 * Validate a single JSON file
 */
function validateFile(filePath) {
    stats.totalFiles++;

    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`${colors.blue}🔍 Validating:${colors.reset} ${relativePath}`);

    // Read and parse JSON
    let content;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        content = JSON.parse(fileContent);
    } catch (error) {
        const errorMsg = `JSON parsing error: ${error.message}`;
        console.log(`  ${colors.red}❌ ${errorMsg}${colors.reset}\n`);
        stats.invalidFiles++;
        stats.errors.push({ file: relativePath, error: errorMsg });
        return false;
    }

    // Determine content type
    const contentType = determineContentType(filePath, content);

    if (!contentType) {
        const errorMsg = 'Unable to determine content type';
        console.log(`  ${colors.yellow}⚠️  ${errorMsg}${colors.reset}\n`);
        stats.invalidFiles++;
        stats.errors.push({ file: relativePath, error: errorMsg });
        return false;
    }

    console.log(`  ${colors.cyan}Type:${colors.reset} ${contentType}`);

    // Apply auto-fixes if requested
    const { content: fixedContent, fixes } = autoFixContent(content, contentType, filePath);
    content = fixedContent;

    if (fixes.length > 0) {
        console.log(`  ${colors.magenta}🔧 Auto-fixes applied:${colors.reset}`);
        fixes.forEach(fix => console.log(`     • ${fix}`));
    }

    // Validate against schema
    const validate = ajv.getSchema(contentType);

    if (!validate) {
        const errorMsg = `No schema found for type: ${contentType}`;
        console.log(`  ${colors.red}❌ ${errorMsg}${colors.reset}\n`);
        stats.invalidFiles++;
        stats.errors.push({ file: relativePath, error: errorMsg });
        return false;
    }

    const valid = validate(content);

    if (!valid) {
        console.log(`  ${colors.red}❌ Validation failed:${colors.reset}`);
        validate.errors.forEach(error => {
            console.log(`     • ${error.instancePath || '/'}: ${error.message}`);
            if (error.params) {
                console.log(`       ${colors.yellow}${JSON.stringify(error.params)}${colors.reset}`);
            }
        });
        console.log('');

        stats.invalidFiles++;
        stats.errors.push({
            file: relativePath,
            error: 'Schema validation failed',
            details: validate.errors
        });
        return false;
    }

    // Additional validation checks
    const customErrors = [];
    const warnings = [];
    const suggestions = [];

    // Check for production duplicates
    const productionDupes = checkProductionDuplicates(content, contentType);
    if (productionDupes.length > 0) {
        productionDupes.forEach(dupe => customErrors.push(dupe));
    }

    // Tag consistency check
    if (content.tags && Array.isArray(content.tags) && options.checkProduction) {
        const productionTags = extractProductionTags();
        const unknownTags = content.tags.filter(tag => !productionTags.has(tag));

        if (unknownTags.length > 0) {
            warnings.push(`Unknown tags not found in production: ${unknownTags.join(', ')}`);
            suggestions.push(`Consider using existing tags or documenting new tag meanings`);
        }
    }

    // Check for encounter-specific issues
    if (contentType === 'encounter') {
        // Check environment if specified
        if (content.environment && !['urban', 'undercity', 'wilderness', 'dungeon', 'planar'].includes(content.environment)) {
            customErrors.push('Invalid environment value');
        }

        // Ensure resolutions have variety
        const resolutionTitles = content.resolutions.map(r => r.title.toLowerCase());
        if (new Set(resolutionTitles).size !== resolutionTitles.length) {
            customErrors.push('Duplicate resolution titles detected');
        }

        // Weight validation with suggestions
        if (content.weight) {
            if (content.weight < 0.8) {
                suggestions.push(`Low weight (${content.weight}) - encounter will be rare. Consider 0.8-1.2 for normal frequency`);
            } else if (content.weight > 1.5) {
                suggestions.push(`High weight (${content.weight}) - encounter will be very common. Consider 0.8-1.2 for normal frequency`);
            }
        }

        // Check description quality
        content.descriptions.forEach((desc, idx) => {
            if (desc.length < 100) {
                warnings.push(`Description ${idx + 1} is short (${desc.length} chars). Aim for 150+ for immersive detail`);
            }
            if (desc.length > 500) {
                warnings.push(`Description ${idx + 1} is long (${desc.length} chars). Consider condensing to 300-400`);
            }
        });

        // Check resolution quality
        content.resolutions.forEach((res, idx) => {
            if (res.description.length < 80) {
                warnings.push(`Resolution ${idx + 1} description is brief. Add more detail about consequences`);
            }
            if (!res.rewards || res.rewards.length < 20) {
                suggestions.push(`Resolution ${idx + 1} rewards could be more detailed`);
            }
        });
    }

    // Check for location-specific issues
    if (contentType === 'location') {
        // Validate key format
        if (content.key !== content.key.toLowerCase()) {
            customErrors.push('Location key must be lowercase');
        }

        // Check for item overlap between detail levels
        const allDetails = [...content.primary, ...content.secondary, ...content.tertiary];
        if (new Set(allDetails).size !== allDetails.length) {
            customErrors.push('Duplicate details found across reveal levels');
        }

        // Check for progressive reveal quality
        const totalDetails = allDetails.length;
        if (totalDetails < 18) {
            suggestions.push(`Location has ${totalDetails} details. Consider adding more for variety (aim for 20-24)`);
        }

        // Check detail length
        allDetails.forEach((detail, idx) => {
            if (detail.length < 3) {
                warnings.push(`Detail item "${detail}" is very short. Add more descriptive words`);
            }
        });
    }

    // Check for NPC-specific issues
    if (contentType === 'npc') {
        if (content.type === 'species') {
            const totalNames = (content.firstNames?.length || 0) + (content.surnames?.length || 0);
            if (totalNames < 30) {
                suggestions.push(`Species has ${totalNames} names. Aim for 30-40 for good variety`);
            }

            // Check for name variety
            if (content.firstNames) {
                const avgLength = content.firstNames.reduce((sum, name) => sum + name.length, 0) / content.firstNames.length;
                if (avgLength < 4) {
                    warnings.push(`First names are very short (avg ${avgLength.toFixed(1)} chars). Add variety with longer names`);
                }
            }
        }

        if (content.type === 'profession') {
            if (!content.tags || content.tags.length < 3) {
                suggestions.push(`Profession should have 3+ tags (environment, activity, tools)`);
            }
        }
    }

    // Check for skillcheck-specific issues
    if (contentType === 'skillcheck') {
        if (content.dc && (content.dc < 5 || content.dc > 30)) {
            warnings.push(`DC ${content.dc} is extreme. Standard range is 10-20`);
        }

        if (content.success.length < 50) {
            suggestions.push(`Success description is brief. Add more detail about what changes`);
        }

        if (content.failure.length < 50) {
            suggestions.push(`Failure description is brief. Add consequences and complications`);
        }
    }

    // Check for danger-specific issues
    if (contentType === 'danger') {
        if (content.category === 'trap') {
            if (!content.detectMethod || content.detectMethod.length < 30) {
                suggestions.push(`Provide detailed detection method with DC or clues`);
            }
            if (!content.disarmMethod || content.disarmMethod.length < 30) {
                suggestions.push(`Provide detailed disarm method with required skills/tools`);
            }
        }

        if (content.category === 'hazard') {
            if (!content.avoidMethod || content.avoidMethod.length < 30) {
                suggestions.push(`Provide detailed avoidance method`);
            }
        }
    }

    // Display results
    if (customErrors.length > 0) {
        console.log(`  ${colors.red}❌ Validation errors:${colors.reset}`);
        customErrors.forEach(err => console.log(`     • ${err}`));
        stats.invalidFiles++;
        stats.errors.push({ file: relativePath, errors: customErrors });
    }

    if (warnings.length > 0) {
        console.log(`  ${colors.yellow}⚠️  Warnings:${colors.reset}`);
        warnings.forEach(warn => console.log(`     • ${warn}`));
        stats.warnings.push({ file: relativePath, warnings });
    }

    if (suggestions.length > 0 && options.report) {
        console.log(`  ${colors.cyan}💡 Suggestions:${colors.reset}`);
        suggestions.forEach(sug => console.log(`     • ${sug}`));
        stats.suggestions.push({ file: relativePath, suggestions });
    }

    if (customErrors.length > 0) {
        console.log('');
        return false;
    }

    console.log(`  ${colors.green}✅ Valid${colors.reset}\n`);
    stats.validFiles++;
    return true;
}

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir) {
    const files = [];

    if (!fs.existsSync(dir)) {
        console.error(`${colors.red}❌ Directory not found: ${dir}${colors.reset}`);
        return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findJsonFiles(fullPath));
        } else if (item.endsWith('.json')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Check for duplicate IDs/keys across all submissions
 */
function checkForDuplicates(files) {
    console.log(`${colors.cyan}🔍 Checking for duplicate IDs...${colors.reset}\\n`);

    const ids = {
        encounters: new Map(),
        locations: new Map(),
        npcs: new Map()
    };

    const duplicates = [];

    for (const filePath of files) {
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const relativePath = path.relative(process.cwd(), filePath);

            // Check encounter titles
            if (content.title) {
                const key = content.title.toLowerCase();
                if (ids.encounters.has(key)) {
                    duplicates.push({
                        type: 'Encounter title',
                        value: content.title,
                        files: [ids.encounters.get(key), relativePath]
                    });
                } else {
                    ids.encounters.set(key, relativePath);
                }
            }

            // Check location keys
            if (content.key) {
                if (ids.locations.has(content.key)) {
                    duplicates.push({
                        type: 'Location key',
                        value: content.key,
                        files: [ids.locations.get(content.key), relativePath]
                    });
                } else {
                    ids.locations.set(content.key, relativePath);
                }
            }

            // Check NPC species keys
            if (content.type === 'species' && content.key) {
                if (ids.npcs.has(content.key)) {
                    duplicates.push({
                        type: 'NPC species key',
                        value: content.key,
                        files: [ids.npcs.get(content.key), relativePath]
                    });
                } else {
                    ids.npcs.set(content.key, relativePath);
                }
            }
        } catch (error) {
            // Skip files that couldn't be parsed (already reported in validation)
        }
    }

    if (duplicates.length > 0) {
        console.log(`${colors.red}❌ Duplicate IDs found:${colors.reset}\\n`);
        duplicates.forEach(dup => {
            console.log(`  ${colors.yellow}${dup.type}:${colors.reset} "${dup.value}"`);
            dup.files.forEach(file => console.log(`    • ${file}`));
            console.log('');
        });
        return false;
    }

    console.log(`${colors.green}✅ No duplicate IDs found${colors.reset}\\n`);
    return true;
}

/**
 * Main execution
 */
function main() {
    // Parse command-line options
    const args = process.argv.slice(2);
    for (const arg of args) {
        if (arg === '--fix') options.fix = true;
        else if (arg === '--report') options.report = true;
        else if (arg === '--check-production') options.checkProduction = true;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`${colors.cyan}🛡️  LoreWeaver Content Validation${colors.reset}`);
    if (options.fix) console.log(`${colors.magenta}   🔧 Auto-fix mode enabled${colors.reset}`);
    if (options.report) console.log(`${colors.blue}   📋 Detailed report mode enabled${colors.reset}`);
    if (options.checkProduction) console.log(`${colors.yellow}   🔍 Production cross-check enabled${colors.reset}`);
    console.log(`${'='.repeat(60)}\n`);

    // Load schemas
    loadSchemas();

    // Load production data if needed
    if (options.checkProduction) {
        loadProductionData();
    }

    // Determine what to validate
    let targetPath = path.join(__dirname, '..', 'content-submissions');

    // Find non-option arguments for target path
    const pathArgs = args.filter(arg => !arg.startsWith('--'));
    if (pathArgs.length > 0) {
        targetPath = path.resolve(pathArgs[0]);
    }

    console.log(`${colors.blue}📂 Target:${colors.reset} ${path.relative(process.cwd(), targetPath)}\n`);

    // Find files to validate
    let files = [];

    if (!fs.existsSync(targetPath)) {
        console.error(`${colors.red}❌ Path not found: ${targetPath}${colors.reset}\n`);
        process.exit(1);
    }

    if (fs.statSync(targetPath).isDirectory()) {
        files = findJsonFiles(targetPath);
    } else if (targetPath.endsWith('.json')) {
        files = [targetPath];
    }

    if (files.length === 0) {
        console.log(`${colors.yellow}⚠️  No JSON files found to validate${colors.reset}\n`);
        process.exit(0);
    }

    console.log(`${colors.blue}Found ${files.length} file(s) to validate${colors.reset}\n`);
    console.log(`${'─'.repeat(60)}\n`);

    // Validate each file
    files.forEach(validateFile);

    console.log(`${'─'.repeat(60)}\n`);

    // Check for duplicates
    const noDuplicates = checkForDuplicates(files);

    // Print summary
    console.log(`${'='.repeat(60)}`);
    console.log(`${colors.cyan}📊 Validation Summary${colors.reset}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Total files:    ${stats.totalFiles}`);
    console.log(`${colors.green}✅ Valid:       ${stats.validFiles}${colors.reset}`);
    console.log(`${colors.red}❌ Invalid:     ${stats.invalidFiles}${colors.reset}`);

    if (stats.warnings.length > 0) {
        console.log(`${colors.yellow}⚠️  Warnings:    ${stats.warnings.length}${colors.reset}`);
    }

    if (stats.fixed.length > 0) {
        console.log(`${colors.magenta}🔧 Auto-fixed:  ${stats.fixed.length} files${colors.reset}`);
    }

    console.log('');

    // Display fixes summary
    if (stats.fixed.length > 0) {
        console.log(`${colors.magenta}🔧 Auto-fix Summary:${colors.reset}`);
        stats.fixed.forEach(({ file, fixes }) => {
            console.log(`  ${file}:`);
            fixes.forEach(fix => console.log(`    • ${fix}`));
        });
        console.log('');
    }

    // Display warnings summary if in report mode
    if (options.report && stats.warnings.length > 0) {
        console.log(`${colors.yellow}⚠️  Warnings Summary:${colors.reset}`);
        stats.warnings.forEach(({ file, warnings }) => {
            console.log(`  ${file}:`);
            warnings.forEach(warn => console.log(`    • ${warn}`));
        });
        console.log('');
    }

    // Display suggestions summary if in report mode
    if (options.report && stats.suggestions.length > 0) {
        console.log(`${colors.cyan}💡 Improvement Suggestions:${colors.reset}`);
        stats.suggestions.forEach(({ file, suggestions }) => {
            console.log(`  ${file}:`);
            suggestions.forEach(sug => console.log(`    • ${sug}`));
        });
        console.log('');
    }

    // Exit with appropriate code
    if (stats.invalidFiles > 0 || !noDuplicates) {
        console.log(`${colors.red}❌ Validation failed${colors.reset}\n`);
        process.exit(1);
    }

    if (stats.warnings.length > 0) {
        console.log(`${colors.yellow}⚠️  Validation passed with warnings${colors.reset}\n`);
    } else {
        console.log(`${colors.green}✅ All validations passed!${colors.reset}\n`);
    }

    process.exit(0);
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { validateFile, checkForDuplicates };
