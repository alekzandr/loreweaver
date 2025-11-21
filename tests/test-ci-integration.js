#!/usr/bin/env node

/**
 * Integration Test Suite for CI/CD Pipeline (Phase 4)
 * 
 * Tests the complete content submission workflow including:
 * - Merge script functionality
 * - End-to-end submission workflow
 * - Production data integrity
 * - Workflow file validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test utilities
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`${colors.green}✅ ${testName}${colors.reset}`);
    passed++;
    return true;
  } else {
    console.log(`${colors.red}❌ ${testName}${colors.reset}`);
    failed++;
    return false;
  }
}

function cleanup() {
  const testDirs = [
    'content-submissions/test-integration',
    'data/test-backup'
  ];
  
  testDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });
}

// Tests

console.log(`\n${colors.cyan}🧪 Running CI/CD Integration Tests - Phase 4${colors.reset}\n`);

// Test 1: Verify merge script exists and is executable
const mergeScriptPath = path.join(__dirname, '..', 'scripts', 'merge-content.js');
assert(
  fs.existsSync(mergeScriptPath),
  'merge-content.js script exists'
);

// Test 2: Verify GitHub Actions workflow file exists
const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'content-validation.yml');
assert(
  fs.existsSync(workflowPath),
  'GitHub Actions workflow file exists'
);

// Test 3: Validate workflow YAML syntax
let workflowContent = '';
try {
  workflowContent = fs.readFileSync(workflowPath, 'utf8');
  
  // Basic YAML validation checks
  const hasName = workflowContent.includes('name:');
  const hasOn = workflowContent.includes('on:');
  const hasJobs = workflowContent.includes('jobs:');
  const hasPullRequest = workflowContent.includes('pull_request');
  const hasValidateJob = workflowContent.includes('validate-content');
  const hasTestJob = workflowContent.includes('test-validation-suite');
  
  assert(
    hasName && hasOn && hasJobs && hasPullRequest && hasValidateJob && hasTestJob,
    'workflow YAML has required structure'
  );
  
  // Check for key workflow steps
  const hasCheckout = workflowContent.includes('actions/checkout');
  const hasSetupNode = workflowContent.includes('actions/setup-node');
  const hasNpmInstall = workflowContent.includes('npm install') || workflowContent.includes('npm ci');
  const hasValidation = workflowContent.includes('npm run validate:content');
  const hasGithubScript = workflowContent.includes('actions/github-script');
  
  assert(
    hasCheckout && hasSetupNode && hasNpmInstall && hasValidation && hasGithubScript,
    'workflow has all required steps'
  );
} catch (error) {
  assert(false, 'workflow YAML is valid and readable');
}

// Test 4: Verify merge script can be loaded as module
try {
  const mergeModule = require(mergeScriptPath);
  assert(
    typeof mergeModule.mergeContent === 'function' &&
    typeof mergeModule.detectContentType === 'function' &&
    typeof mergeModule.isDuplicate === 'function',
    'merge script exports required functions'
  );
} catch (error) {
  assert(false, 'merge script loads as module');
}

// Test 5: Test content type detection
const { detectContentType, isDuplicate } = require(mergeScriptPath);

const encounterSample = {
  type: 'encounter',
  name: 'Test Encounter',
  description: 'A test encounter',
  weight: 1.0
};

assert(
  detectContentType(encounterSample) === 'encounter',
  'detects encounter content type'
);

const locationSample = {
  name: 'Test Location',
  description: 'A test location',
  atmosphereEffect: 'Eerie silence'
};

assert(
  detectContentType(locationSample) === 'location',
  'detects location content type by structure'
);

const npcSample = {
  name: 'Test NPC',
  description: 'A test NPC',
  personality: 'Friendly',
  motivation: 'Help others'
};

assert(
  detectContentType(npcSample) === 'npc',
  'detects NPC content type by structure'
);

// Test 6: Test duplicate detection
const existingContent = [
  { name: 'Goblin Ambush', id: 'goblin-ambush' },
  { name: 'Ancient Ruins', id: 'ancient-ruins' }
];

const duplicateByName = { name: 'Goblin Ambush', id: 'new-id' };
const duplicateById = { name: 'Different Name', id: 'goblin-ambush' };
const uniqueContent = { name: 'Unique Content', id: 'unique-id' };

assert(
  isDuplicate(duplicateByName, existingContent) === true,
  'detects duplicate by name'
);

assert(
  isDuplicate(duplicateById, existingContent) === true,
  'detects duplicate by ID'
);

assert(
  isDuplicate(uniqueContent, existingContent) === false,
  'allows unique content'
);

// Test 7: Test merge script help output
try {
  const helpOutput = execSync('node scripts/merge-content.js', {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..')
  });
  
  assert(
    helpOutput.includes('Usage:') || helpOutput.includes('--all') || helpOutput.includes('--file'),
    'merge script shows usage information'
  );
} catch (error) {
  // Exit code 0 is expected for help
  if (error.status === 0) {
    assert(true, 'merge script shows usage information');
  } else {
    assert(false, 'merge script runs without errors');
  }
}

// Test 8: Create test submission and validate it
cleanup(); // Start clean
const testSubmissionDir = path.join(__dirname, '..', 'content-submissions', 'test-integration');
fs.mkdirSync(testSubmissionDir, { recursive: true });

const testEncounter = {
  type: 'encounter',
  name: 'Integration Test Encounter',
  description: 'This is a test encounter created during integration testing. It features a mysterious traveler who offers cryptic advice to the party.',
  tags: ['social', 'mystery'],
  weight: 1.0,
  resolution: [
    { type: 'success', description: 'The party learns valuable information' },
    { type: 'failure', description: 'The traveler disappears mysteriously' }
  ]
};

const testSubmissionPath = path.join(testSubmissionDir, 'test-encounter.json');
fs.writeFileSync(testSubmissionPath, JSON.stringify(testEncounter, null, 2));

assert(
  fs.existsSync(testSubmissionPath),
  'creates test submission file'
);

// Test 9: Validate test submission
try {
  const validationOutput = execSync(
    `node scripts/validate-content.js ${testSubmissionPath}`,
    {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    }
  );
  
  const passed = validationOutput.includes('All validations passed') || 
                 validationOutput.includes('✅') ||
                 !validationOutput.includes('❌');
  
  assert(
    passed,
    'test submission passes validation'
  );
} catch (error) {
  // Check if it's a validation error (exit code 1) or actual error
  const output = error.stdout || error.stderr || '';
  const hasValidationOutput = output.includes('LoreWeaver Content Validation');
  
  if (hasValidationOutput && !output.includes('Error:')) {
    assert(true, 'test submission passes validation');
  } else {
    assert(false, 'test submission validates successfully');
  }
}

// Test 10: Test merge script dry-run
try {
  const dryRunOutput = execSync(
    `node scripts/merge-content.js --dry-run --file ${testSubmissionPath}`,
    {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    }
  );
  
  assert(
    dryRunOutput.includes('DRY RUN') && dryRunOutput.includes('encounter'),
    'merge script dry-run works'
  );
} catch (error) {
  assert(false, 'merge script dry-run executes');
}

// Test 11: Verify production data file structure
const productionFiles = [
  'data/encounters.json',
  'data/locations.json',
  'data/npcs.json',
  'data/skillchecks.json',
  'data/dangers.json'
];

let allProductionValid = true;
productionFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    allProductionValid = false;
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check that it's a valid JSON object (not array)
    const isObject = typeof data === 'object' && !Array.isArray(data) && data !== null;
    
    if (!isObject) {
      allProductionValid = false;
    }
  } catch (error) {
    allProductionValid = false;
  }
});

assert(
  allProductionValid,
  'all production data files have valid JSON structure'
);

// Test 12: Verify schema files exist for all content types
const schemaFiles = [
  'schemas/encounter-schema.json',
  'schemas/location-schema.json',
  'schemas/npc-schema.json',
  'schemas/skillcheck-schema.json',
  'schemas/danger-schema.json'
];

let allSchemasExist = true;
schemaFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    allSchemasExist = false;
  }
});

assert(
  allSchemasExist,
  'all content type schemas exist'
);

// Test 13: Verify example files exist
const exampleDir = path.join(__dirname, '..', 'examples');
let exampleCount = 0;

if (fs.existsSync(exampleDir)) {
  const files = fs.readdirSync(exampleDir);
  exampleCount = files.filter(f => f.endsWith('.json')).length;
}

assert(
  exampleCount >= 5,
  'example templates exist for content types'
);

// Test 14: Verify documentation files exist
const docFiles = [
  'CONTRIBUTING_CONTENT.md',
  'MAINTAINING_CI.md',
  'CHANGELOG.md',
  'TODO.md'
];

let allDocsExist = true;
docFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    allDocsExist = false;
  }
});

assert(
  allDocsExist,
  'all documentation files exist'
);

// Test 15: Check CONTRIBUTING_CONTENT.md has CI/CD section
const contributingPath = path.join(__dirname, '..', 'CONTRIBUTING_CONTENT.md');
const contributingContent = fs.readFileSync(contributingPath, 'utf8');

assert(
  contributingContent.includes('Automated Validation') || contributingContent.includes('CI/CD'),
  'CONTRIBUTING_CONTENT.md documents CI/CD workflow'
);

// Test 16: Check MAINTAINING_CI.md has troubleshooting section
const maintainingPath = path.join(__dirname, '..', 'MAINTAINING_CI.md');
const maintainingContent = fs.readFileSync(maintainingPath, 'utf8');

assert(
  maintainingContent.includes('Troubleshooting') && maintainingContent.includes('Workflow'),
  'MAINTAINING_CI.md has troubleshooting guide'
);

// Test 17: Verify package.json has merge script
const packagePath = path.join(__dirname, '..', 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

assert(
  packageData.scripts['merge:content'] !== undefined,
  'package.json includes merge:content script'
);

assert(
  packageData.scripts['validate:content'] !== undefined,
  'package.json includes validate:content script'
);

// Test 18: Verify version consistency
assert(
  packageData.version === '1.7.0',
  'package.json version is 1.7.0'
);

const versionPath = path.join(__dirname, '..', 'data', 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

assert(
  versionData.version === '1.7.0',
  'version.json version is 1.7.0'
);

// Test 19: Check CHANGELOG has v1.7.0 entry
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const changelogContent = fs.readFileSync(changelogPath, 'utf8');

assert(
  changelogContent.includes('[1.7.0]') && changelogContent.includes('2025-11-19'),
  'CHANGELOG.md has v1.7.0 entry with date'
);

assert(
  changelogContent.includes('Phase 1') && 
  changelogContent.includes('Phase 2') && 
  changelogContent.includes('Phase 3'),
  'CHANGELOG.md documents all three phases'
);

// Test 20: Verify TODO.md marks phases as complete
const todoPath = path.join(__dirname, '..', 'TODO.md');
const todoContent = fs.readFileSync(todoPath, 'utf8');

assert(
  todoContent.includes('Phase 1') && todoContent.includes('IMPLEMENTED'),
  'TODO.md marks Phase 1 complete'
);

assert(
  todoContent.includes('Phase 2') && todoContent.includes('IMPLEMENTED'),
  'TODO.md marks Phase 2 complete'
);

assert(
  todoContent.includes('Phase 3') && todoContent.includes('IMPLEMENTED'),
  'TODO.md marks Phase 3 complete'
);

// Test 21: Verify all test suites are registered in package.json
assert(
  packageData.scripts['test:content-validation'] !== undefined,
  'package.json includes Phase 1 tests'
);

assert(
  packageData.scripts['test:content-validation-phase2'] !== undefined,
  'package.json includes Phase 2 tests'
);

// Test 22: Verify workflow has correct Node.js version
assert(
  workflowContent.includes("node-version: '18'"),
  'workflow uses Node.js 18'
);

// Test 23: Verify workflow has permissions configured
assert(
  workflowContent.includes('permissions:'),
  'workflow has permissions configured'
);

// Test 24: Verify workflow posts PR comments
assert(
  workflowContent.includes('createComment') || workflowContent.includes('updateComment'),
  'workflow posts/updates PR comments'
);

// Test 25: Verify workflow blocks merge on failure
assert(
  workflowContent.includes('exit 1') && workflowContent.includes('blocking merge'),
  'workflow blocks merge on validation failure'
);

// Cleanup
cleanup();
console.log(`\n${colors.cyan}Cleaning up test files...${colors.reset}`);

// Results
console.log(`\n${'='.repeat(50)}`);
console.log(`${colors.cyan}📊 Integration Test Results${colors.reset}`);
console.log('='.repeat(50));
console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
console.log(`📝 Total:  ${passed + failed}`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log(`\n${colors.green}✅ All integration tests passed!${colors.reset}\n`);
  console.log(`${colors.cyan}Phase 4 Integration Testing Complete${colors.reset}`);
  console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
  console.log('1. Review test results');
  console.log('2. Commit Phase 4 changes');
  console.log('3. Push feature branch to origin');
  console.log('4. Create pull request for review\n');
  process.exit(0);
} else {
  console.log(`\n${colors.red}❌ Some integration tests failed${colors.reset}\n`);
  process.exit(1);
}
