const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating version consistency...\n');

let hasErrors = false;

// Read version.json
const versionPath = path.join(__dirname, '../data/version.json');
const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const currentVersion = versionData.version;

console.log(`📦 Current version: ${currentVersion}`);

// Read CHANGELOG.md
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf8');

// Check if current version exists in CHANGELOG.md
const versionPattern = new RegExp(`##\\s*\\[${currentVersion.replace(/\./g, '\\.')}\\]`, 'm');
if (!versionPattern.test(changelog)) {
  console.error(`❌ Version ${currentVersion} not found in CHANGELOG.md`);
  console.error('   Please add a changelog entry for this version');
  hasErrors = true;
} else {
  console.log(`✅ Version ${currentVersion} found in CHANGELOG.md`);
}

// Check if CHANGELOG.md has an entry with current year
const currentYear = new Date().getFullYear();
const versionWithYear = new RegExp(`##\\s*\\[${currentVersion.replace(/\./g, '\\.')}\\]\\s*-\\s*${currentYear}`, 'm');
if (!versionWithYear.test(changelog)) {
  console.error(`❌ Version ${currentVersion} in CHANGELOG.md does not have year ${currentYear}`);
  console.error(`   Expected format: ## [${currentVersion}] - ${currentYear}-MM-DD`);
  hasErrors = true;
} else {
  console.log(`✅ Version ${currentVersion} has correct year (${currentYear})`);
}

// Check package.json version matches
const packagePath = path.join(__dirname, '../package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const packageVersion = packageData.version;

if (packageVersion !== currentVersion) {
  console.error(`❌ Version mismatch: package.json (${packageVersion}) != version.json (${currentVersion})`);
  console.error('   Please sync versions across files');
  hasErrors = true;
} else {
  console.log(`✅ package.json version matches: ${packageVersion}`);
}

// Check if on main branch and version was updated in this commit
try {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  
  if (currentBranch === 'main') {
    console.log('\n🔍 On main branch - checking version was updated...');
    
    try {
      // Check if there's a previous commit
      execSync('git rev-parse HEAD~1', { encoding: 'utf8', stdio: 'pipe' });
      
      // Check if version.json was modified in the last commit
      const lastCommitFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf8' });
      
      if (!lastCommitFiles.includes('data/version.json')) {
        console.error('❌ Pushing to main without updating version.json');
        console.error('   When merging to main, you must:');
        console.error('   1. Update data/version.json with new version');
        console.error('   2. Add corresponding entry to CHANGELOG.md');
        console.error('   3. Update package.json version');
        hasErrors = true;
      } else {
        console.log('✅ version.json was updated in this commit');
      }
    } catch (e) {
      // No previous commit (initial commit), skip this check
      console.log('⚠️  SKIP: No previous commit to compare (initial commit)');
    }
  } else {
    console.log(`\n✅ On branch '${currentBranch}' - version update check skipped`);
  }
} catch (e) {
  console.log('\n⚠️  SKIP: Not in a git repository or git not available');
}

// Check version format (semantic versioning)
const semverPattern = /^\d+\.\d+\.\d+$/;
if (!semverPattern.test(currentVersion)) {
  console.error(`❌ Invalid version format: ${currentVersion}`);
  console.error('   Must follow semantic versioning: MAJOR.MINOR.PATCH (e.g., 1.2.3)');
  hasErrors = true;
} else {
  console.log(`✅ Version follows semantic versioning format`);
}

// Check for [Unreleased] section
if (!changelog.includes('## [Unreleased]')) {
  console.error('❌ CHANGELOG.md missing [Unreleased] section');
  console.error('   Add "## [Unreleased]" section at the top for upcoming changes');
  hasErrors = true;
} else {
  console.log('✅ CHANGELOG.md has [Unreleased] section');
}

// Check version.json has required fields
const requiredFields = ['version', 'releaseDate'];
for (const field of requiredFields) {
  if (!versionData[field]) {
    console.error(`❌ version.json missing required field: ${field}`);
    hasErrors = true;
  }
}
if (!hasErrors || requiredFields.every(f => versionData[f])) {
  console.log('✅ version.json has all required fields');
}

// Check release date format (YYYY-MM-DD)
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
if (!datePattern.test(versionData.releaseDate)) {
  console.error(`❌ Invalid releaseDate format: ${versionData.releaseDate}`);
  console.error('   Must be YYYY-MM-DD format');
  hasErrors = true;
} else {
  console.log(`✅ releaseDate format is valid: ${versionData.releaseDate}`);
}

if (hasErrors) {
  console.error('\n❌ Version validation failed!');
  console.error('\n📝 To fix:');
  console.error('   1. Update data/version.json with new version');
  console.error('   2. Add changelog entry: ## [X.Y.Z] - YYYY-MM-DD');
  console.error('   3. Update package.json version to match');
  console.error('   4. Ensure year is correct (current year: ' + currentYear + ')');
  process.exit(1);
} else {
  console.log('\n✅ Version validation passed!');
  process.exit(0);
}
