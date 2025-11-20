#!/usr/bin/env node

/**
 * Content Validation Script
 * Validates submitted content against JSON schemas
 * 
 * Usage:
 *   node scripts/validate-content.js [file or directory]
 *   npm run validate:content
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
    cyan: '\x1b[36m'
};

// Validation statistics
const stats = {
    totalFiles: 0,
    validFiles: 0,
    invalidFiles: 0,
    errors: []
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
        console.log(`  ${colors.red}❌ ${errorMsg}${colors.reset}\\n`);
        stats.invalidFiles++;
        stats.errors.push({ file: relativePath, error: errorMsg });
        return false;
    }
    
    // Determine content type
    const contentType = determineContentType(filePath, content);
    
    if (!contentType) {
        const errorMsg = 'Unable to determine content type';
        console.log(`  ${colors.yellow}⚠️  ${errorMsg}${colors.reset}\\n`);
        stats.invalidFiles++;
        stats.errors.push({ file: relativePath, error: errorMsg });
        return false;
    }
    
    console.log(`  ${colors.cyan}Type:${colors.reset} ${contentType}`);
    
    // Validate against schema
    const validate = ajv.getSchema(contentType);
    
    if (!validate) {
        const errorMsg = `No schema found for type: ${contentType}`;
        console.log(`  ${colors.red}❌ ${errorMsg}${colors.reset}\\n`);
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
    }
    
    if (customErrors.length > 0) {
        console.log(`  ${colors.yellow}⚠️  Additional validation warnings:${colors.reset}`);
        customErrors.forEach(err => console.log(`     • ${err}`));
        console.log('');
    }
    
    console.log(`  ${colors.green}✅ Valid${colors.reset}\\n`);
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
    console.log(`\\n${'='.repeat(60)}`);
    console.log(`${colors.cyan}🛡️  LoreWeaver Content Validation${colors.reset}`);
    console.log(`${'='.repeat(60)}\\n`);
    
    // Load schemas
    loadSchemas();
    
    // Determine what to validate
    const args = process.argv.slice(2);
    let targetPath = path.join(__dirname, '..', 'content-submissions');
    
    if (args.length > 0) {
        targetPath = path.resolve(args[0]);
    }
    
    console.log(`${colors.blue}📂 Target:${colors.reset} ${path.relative(process.cwd(), targetPath)}\\n`);
    
    // Find files to validate
    let files = [];
    
    if (fs.statSync(targetPath).isDirectory()) {
        files = findJsonFiles(targetPath);
    } else if (targetPath.endsWith('.json')) {
        files = [targetPath];
    }
    
    if (files.length === 0) {
        console.log(`${colors.yellow}⚠️  No JSON files found to validate${colors.reset}\\n`);
        process.exit(0);
    }
    
    console.log(`${colors.blue}Found ${files.length} file(s) to validate${colors.reset}\\n`);
    console.log(`${'─'.repeat(60)}\\n`);
    
    // Validate each file
    files.forEach(validateFile);
    
    console.log(`${'─'.repeat(60)}\\n`);
    
    // Check for duplicates
    const noDuplicates = checkForDuplicates(files);
    
    // Print summary
    console.log(`${'='.repeat(60)}`);
    console.log(`${colors.cyan}📊 Validation Summary${colors.reset}`);
    console.log(`${'='.repeat(60)}\\n`);
    console.log(`Total files:    ${stats.totalFiles}`);
    console.log(`${colors.green}✅ Valid:       ${stats.validFiles}${colors.reset}`);
    console.log(`${colors.red}❌ Invalid:     ${stats.invalidFiles}${colors.reset}`);
    console.log('');
    
    // Exit with appropriate code
    if (stats.invalidFiles > 0 || !noDuplicates) {
        console.log(`${colors.red}❌ Validation failed${colors.reset}\\n`);
        process.exit(1);
    }
    
    console.log(`${colors.green}✅ All validations passed!${colors.reset}\\n`);
    process.exit(0);
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { validateFile, checkForDuplicates };
