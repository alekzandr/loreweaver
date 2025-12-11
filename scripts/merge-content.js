#!/usr/bin/env node

/**
 * Content Merge Script
 * 
 * Merges validated content from content-submissions/ into production data files.
 * This script should only be run after content has been validated and approved.
 * 
 * Usage:
 *   node scripts/merge-content.js [options]
 * 
 * Options:
 *   --dry-run    Preview changes without writing files
 *   --file PATH  Merge specific file only
 *   --all        Merge all files in content-submissions/
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const mergeAll = args.includes('--all');
const fileIndex = args.indexOf('--file');
const specificFile = fileIndex !== -1 ? args[fileIndex + 1] : null;

// Paths
const submissionsDir = path.join(__dirname, '..', 'content-submissions');
const dataDir = path.join(__dirname, '..', 'data');

// Content type mapping
const contentTypeMap = {
  encounter: { file: 'encounters.json', arrayKey: 'encounters' },
  location: { file: 'locations.json', arrayKey: 'locations' },
  npc: { file: 'npcs.json', arrayKey: 'npcs' },
  skillcheck: { file: 'skillchecks.json', arrayKey: 'skillchecks' },
  danger: { file: 'dangers.json', arrayKey: 'dangers' }
};

/**
 * Load JSON file
 */
function loadJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, error.message);
    return null;
  }
}

/**
 * Save JSON file with proper formatting
 */
function saveJson(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error(`${colors.red}Error saving ${filePath}:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Detect content type from file structure
 */
function detectContentType(data) {
  if (data.type) {
    if (['species', 'profession', 'alignment', 'personality'].includes(data.type)) return 'npc';
    return data.type;
  }

  // Detect by structure
  // Encounter
  if (data.title && data.resolutions) return 'encounter';
  // Location
  if (data.key && data.primary && data.secondary) return 'location';
  // NPC
  if (data.type === 'species' || data.type === 'profession') return 'npc';
  // Danger
  if (data.category && (data.category === 'trap' || data.category === 'hazard')) return 'danger';
  // Skillcheck
  if (data.skill && data.dc) return 'skillcheck';

  return null;
}

/**
 * Generate unique ID for content
 */
/**
 * Generate unique ID for content
 */
function generateId(name, existingIds) {
  const base = (name || 'untitled').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let id = base;
  let counter = 1;

  while (existingIds.has(id)) {
    id = `${base}-${counter}`;
    counter++;
  }

  return id;
}

/**
 * Check if content already exists (by name or similar ID)
 */
function isDuplicate(newContent, existingContent) {
  const newName = newContent.name || newContent.title || newContent.key;
  if (!newName) return false;

  return existingContent.some(item => {
    const itemName = item.name || item.title || item.key;

    // Exact name match
    if (itemName === newName) return true;

    // Similar ID (case-insensitive)
    if (item.id && newContent.id &&
      item.id.toLowerCase() === newContent.id.toLowerCase()) {
      return true;
    }

    return false;
  });
}

/**
 * Merge content into production data
 */
function mergeContent(submissionPath) {
  console.log(`\n${colors.cyan}Processing:${colors.reset} ${submissionPath}`);

  // Load submission
  const submission = loadJson(submissionPath);
  if (!submission) {
    return { success: false, error: 'Failed to load submission' };
  }

  // Validate content schema
  try {
    const { execSync } = require('child_process');
    execSync(`node "${path.join(__dirname, 'validate-content.js')}" "${submissionPath}"`, { stdio: 'ignore' });
  } catch (error) {
    console.log(`  ${colors.red}validation failed${colors.reset}`);
    return { success: false, error: 'Schema validation failed' };
  }

  // Detect content type
  const contentType = detectContentType(submission);
  if (!contentType || !contentTypeMap[contentType]) {
    return { success: false, error: `Unknown content type: ${contentType}` };
  }

  const typeInfo = contentTypeMap[contentType];
  const productionPath = path.join(dataDir, typeInfo.file);

  console.log(`  ${colors.blue}Type:${colors.reset} ${contentType}`);

  // Load production data
  const productionData = loadJson(productionPath);
  if (!productionData) {
    return { success: false, error: 'Failed to load production data' };
  }

  const existingContent = productionData[typeInfo.arrayKey] || [];

  // Check for duplicates
  // Check for duplicates
  const identifier = submission.name || submission.title || submission.key;
  if (!identifier) {
    return { success: false, error: 'Content missing name/title/key identifier' };
  }

  if (isDuplicate(submission, existingContent)) {
    return {
      success: false,
      error: 'Duplicate content detected',
      warning: `Content with name "${identifier}" already exists`
    };
  }

  // Generate ID if not present
  const existingIds = new Set(existingContent.map(item => item.id).filter(Boolean));
  if (!submission.id) {
    submission.id = generateId(identifier, existingIds);
    console.log(`  ${colors.yellow}Generated ID:${colors.reset} ${submission.id}`);
  }

  // Add submission to production data
  existingContent.push(submission);

  // Sort by ID for consistency
  existingContent.sort((a, b) => {
    if (a.id && b.id) return a.id.localeCompare(b.id);
    return 0;
  });

  productionData[typeInfo.arrayKey] = existingContent;

  // Update metadata
  if (!productionData.metadata) {
    productionData.metadata = {};
  }
  productionData.metadata.lastUpdated = new Date().toISOString();
  productionData.metadata.totalCount = existingContent.length;

  // Save if not dry run
  if (!dryRun) {
    if (!saveJson(productionPath, productionData)) {
      return { success: false, error: 'Failed to save production data' };
    }
    console.log(`  ${colors.green}✓ Merged into ${typeInfo.file}${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}[DRY RUN] Would merge into ${typeInfo.file}${colors.reset}`);
  }

  return {
    success: true,
    contentType,
    file: typeInfo.file,
    id: submission.id,
    name: identifier
  };
}

/**
 * Find all submission files
 */
function findSubmissions() {
  const submissions = [];

  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip examples, tests, and temp directories
          if (!['examples', 'tests', 'temp-test'].includes(item)) {
            scanDir(fullPath);
          }
        } else if (item.endsWith('.json')) {
          submissions.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`${colors.red}Error scanning ${dir}:${colors.reset}`, error.message);
    }
  }

  scanDir(submissionsDir);
  return submissions;
}

/**
 * Main merge process
 */
function main() {
  console.log(`${colors.bright}=== Content Merge Tool ===${colors.reset}\n`);

  if (dryRun) {
    console.log(`${colors.yellow}[DRY RUN MODE] No files will be modified${colors.reset}\n`);
  }

  let filesToMerge = [];

  if (specificFile) {
    // Merge specific file
    const fullPath = path.resolve(specificFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`${colors.red}Error: File not found: ${fullPath}${colors.reset}`);
      process.exit(1);
    }
    filesToMerge = [fullPath];
  } else if (mergeAll) {
    // Merge all submissions
    filesToMerge = findSubmissions();
    console.log(`Found ${filesToMerge.length} submission(s) to merge\n`);
  } else {
    console.log(`${colors.yellow}Usage:${colors.reset}`);
    console.log('  node scripts/merge-content.js --all              Merge all submissions');
    console.log('  node scripts/merge-content.js --file PATH        Merge specific file');
    console.log('  node scripts/merge-content.js --dry-run --all    Preview merge without changes');
    console.log('');
    process.exit(0);
  }

  if (filesToMerge.length === 0) {
    console.log(`${colors.yellow}No submissions found to merge${colors.reset}`);
    process.exit(0);
  }

  // Process each submission
  const results = {
    success: [],
    failed: [],
    warnings: []
  };

  for (const file of filesToMerge) {
    const result = mergeContent(file);

    if (result.success) {
      results.success.push({ file, ...result });
    } else {
      results.failed.push({ file, ...result });
      if (result.warning) {
        results.warnings.push({ file, warning: result.warning });
      }
    }
  }

  // Print summary
  console.log(`\n${colors.bright}=== Merge Summary ===${colors.reset}\n`);

  if (results.success.length > 0) {
    console.log(`${colors.green}✓ Successfully merged: ${results.success.length}${colors.reset}`);
    results.success.forEach(item => {
      console.log(`  - ${item.name} (${item.contentType}) → ${item.file}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠ Warnings: ${results.warnings.length}${colors.reset}`);
    results.warnings.forEach(item => {
      console.log(`  - ${path.basename(item.file)}: ${item.warning}`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n${colors.red}✗ Failed: ${results.failed.length}${colors.reset}`);
    results.failed.forEach(item => {
      console.log(`  - ${path.basename(item.file)}: ${item.error}`);
    });
  }

  console.log('');

  if (!dryRun && results.success.length > 0) {
    console.log(`${colors.cyan}Next steps:${colors.reset}`);
    console.log('1. Review the merged content in data/');
    console.log('2. Test the application to ensure content loads correctly');
    console.log('3. Commit the changes with: git add data/ && git commit -m "feat: Add community content"');
    console.log('4. Archive or delete merged submissions from content-submissions/');
    console.log('');
  }

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { mergeContent, detectContentType, isDuplicate };
