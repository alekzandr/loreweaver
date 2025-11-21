# CI/CD Maintainer Guide

This guide is for project maintainers who manage the content submission and validation CI/CD pipeline.

## Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflow](#github-actions-workflow)
3. [Validation Process](#validation-process)
4. [Content Merging](#content-merging)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance Tasks](#maintenance-tasks)

---

## Overview

The LoreWeaver project uses GitHub Actions to automatically validate community content submissions. This ensures all submitted content meets quality standards before being merged into production.

### Key Components

- **GitHub Actions Workflow** (`.github/workflows/content-validation.yml`)
  - Runs on every PR that touches `content-submissions/`
  - Validates JSON syntax, schema compliance, and content quality
  - Posts results as PR comments
  - Blocks merge if validation fails

- **Validation Script** (`scripts/validate-content.js`)
  - JSON syntax validation
  - Schema validation (Ajv)
  - Quality checks (tags, weights, descriptions, DCs)
  - Production duplicate detection
  - Auto-fix capability

- **Merge Script** (`scripts/merge-content.js`)
  - Merges validated content into production data files
  - Generates IDs for new content
  - Maintains alphabetical ordering
  - Updates metadata

---

## GitHub Actions Workflow

### Workflow Triggers

The workflow runs when:
- A PR is opened targeting `main`
- A PR is updated (new commits pushed)
- Files in these paths are modified:
  - `content-submissions/**`
  - `schemas/**`
  - `scripts/validate-content.js`

### Workflow Jobs

#### 1. `validate-content`

**Steps:**
1. **Checkout repository** - Fetches full git history for diff analysis
2. **Setup Node.js** - Installs Node.js 18 with npm caching
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Run JSON linting** - Validates JSON syntax
5. **Run schema validation** - Validates against JSON schemas
6. **Run production cross-check** - Detects duplicate content
7. **Run quality report** - Generates quality improvement suggestions
8. **Post validation results to PR** - Creates/updates PR comment
9. **Check validation status** - Blocks merge if validation fails

**Output:**
- GitHub Actions summary with validation results
- PR comment with detailed feedback
- Pass/fail status that controls merge blocking

#### 2. `test-validation-suite`

**Steps:**
1. **Checkout repository**
2. **Setup Node.js**
3. **Install dependencies**
4. **Run validation tests** - Runs full test suite for validation scripts
5. **Report test results**

**Purpose:** Ensures validation scripts themselves are working correctly

### PR Comment Format

The workflow posts a comment on each PR with:

```markdown
## 🛡️ Content Validation Results

### ✅ All validations passed!
Your content submission looks great. No issues detected.

---
📚 **Resources:**
- [Content Contribution Guide](../blob/main/CONTRIBUTING_CONTENT.md)
- [Validation Schemas](../tree/main/schemas)
- [Example Templates](../tree/main/examples)
```

Or if there are issues:

```markdown
## 🛡️ Content Validation Results

### ❌ Validation Failed
Please fix the following issues before merging:

<details>
<summary>Detailed Validation Output</summary>

[validation output]

</details>

💡 **Tip:** Run `npm run validate:content -- --fix` locally to auto-fix common issues.
```

### Merge Blocking

The workflow will **block merge** if:
- JSON syntax is invalid
- Content doesn't match schemas
- Duplicate content is detected in production
- Validation script exits with error code

The workflow will **allow merge** if:
- All validations pass
- Only warnings/suggestions are present (no errors)

---

## Validation Process

### Local Validation (Contributors)

Contributors should run validation locally before submitting PRs:

```bash
# Basic validation
npm run validate:content

# With production cross-check
npm run validate:content -- --check-production

# With detailed report
npm run validate:content -- --report --check-production

# Auto-fix common issues
npm run validate:content -- --fix
```

### CI Validation (Automated)

When a PR is opened:

1. **JSON Syntax Check**
   - Ensures all JSON files are parseable
   - Catches syntax errors immediately

2. **Schema Validation**
   - Validates against appropriate schema (encounter, location, npc, etc.)
   - Checks required fields, data types, formats

3. **Production Cross-Check**
   - Loads all production data files
   - Detects duplicate content by name/ID
   - Warns about similar existing content

4. **Quality Checks**
   - **Tags**: Warns if tags aren't found in production
   - **Weights**: Suggests adjustments for extreme values
   - **Descriptions**: Checks length ranges (100-500 chars ideal)
   - **DCs**: Warns about extreme difficulty (< 8 or > 25)
   - **Resolution Details**: Ensures variety in encounter outcomes

### Validation Results

**Pass (✅)**: All checks passed, no issues
- PR can be merged immediately (after review)

**Pass with Warnings (⚠️)**: Valid but has quality suggestions
- PR can be merged (warnings are suggestions, not blockers)
- Consider implementing suggestions for better quality

**Fail (❌)**: Critical issues detected
- PR **cannot** be merged until fixed
- Contributors must address errors and push updates

---

## Content Merging

### Manual Merge Process

After a PR is approved and merged to main:

1. **Pull latest main branch**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Review merged content**
   - Check `content-submissions/` for new files
   - Verify content was validated in CI

3. **Run merge script (dry-run first)**
   ```bash
   npm run merge:content -- --dry-run --all
   ```
   
   Review output to ensure content will merge correctly.

4. **Merge content into production**
   ```bash
   npm run merge:content -- --all
   ```
   
   This will:
   - Add content to appropriate data files (`data/encounters.json`, etc.)
   - Generate IDs for content without them
   - Sort content alphabetically
   - Update metadata (lastUpdated, totalCount)

5. **Test merged content**
   - Open `index.html` in browser
   - Generate encounters/locations to verify new content loads
   - Check for any errors in browser console

6. **Commit merged content**
   ```bash
   git add data/
   git commit -m "feat: Add community content from PR #XXX"
   git push origin main
   ```

7. **Archive submissions**
   ```bash
   # Move to archive or delete
   git rm content-submissions/merged-content.json
   git commit -m "chore: Archive merged content"
   git push origin main
   ```

### Merge Script Options

```bash
# Preview merge without changes
npm run merge:content -- --dry-run --all

# Merge all submissions
npm run merge:content -- --all

# Merge specific file
npm run merge:content -- --file content-submissions/encounter-forest-ambush.json

# Dry-run for specific file
npm run merge:content -- --dry-run --file content-submissions/location-haunted-manor.json
```

### Automated Merge (Future Enhancement)

Currently merging is manual. Future enhancements could include:
- GitHub Actions workflow to auto-merge on PR approval
- Automated archival of merged submissions
- Slack/Discord notifications when content is merged

---

## Troubleshooting

### Workflow Fails to Start

**Symptom:** PR created but no workflow runs

**Possible Causes:**
- PR doesn't touch `content-submissions/` or related paths
- Workflow file has YAML syntax errors
- GitHub Actions disabled for repository

**Solutions:**
1. Check workflow triggers in `.github/workflows/content-validation.yml`
2. Validate YAML syntax (use online validator)
3. Check repository Settings → Actions → General

### Validation Fails in CI but Passes Locally

**Symptom:** Local validation succeeds but CI validation fails

**Possible Causes:**
- Different Node.js versions
- Missing dependencies
- File path differences (Windows vs Linux)
- Git line ending issues (CRLF vs LF)

**Solutions:**
1. Check Node.js version in workflow matches local (currently 18)
2. Ensure `npm ci` is used (not `npm install`)
3. Run validation in CI mode: `npm run validate:content -- --check-production`
4. Check `.gitattributes` for line ending configuration

### PR Comment Not Posted

**Symptom:** Validation runs but no PR comment appears

**Possible Causes:**
- GitHub token permissions insufficient
- `actions/github-script` step failing
- Comment body exceeds GitHub's limit (65536 chars)

**Solutions:**
1. Check workflow logs for "Post validation results" step
2. Verify token has `pull-requests: write` permission
3. Reduce validation output if too large (script truncates at 60000 chars)

### Merge Script Fails

**Symptom:** `npm run merge:content` exits with error

**Common Issues:**

1. **"Duplicate content detected"**
   - Content with same name already exists
   - Solution: Rename content or skip if truly duplicate

2. **"Failed to load production data"**
   - Production JSON file is invalid
   - Solution: Fix JSON syntax in data files first

3. **"Unknown content type"**
   - Content missing `type` field or has invalid structure
   - Solution: Ensure content matches schema

### Test Suite Failures

**Symptom:** `npm test` fails after workflow changes

**Common Issues:**

1. **Validation tests fail**
   - Changes to validation script broke tests
   - Solution: Update tests to match new behavior

2. **New dependencies missing**
   - Added package not in `package.json`
   - Solution: `npm install --save-dev <package>`

3. **File path issues**
   - Tests can't find files (Windows/Linux paths)
   - Solution: Use `path.join()` instead of string concatenation

---

## Maintenance Tasks

### Regular Maintenance

#### Weekly

- **Review open PRs with validation failures**
  - Help contributors fix issues
  - Close stale PRs (30+ days inactive)

- **Check workflow run times**
  - Ensure workflows complete in < 5 minutes
  - Optimize if getting slower

#### Monthly

- **Update dependencies**
  ```bash
  npm outdated
  npm update
  npm test  # Verify nothing broke
  ```

- **Review validation rules**
  - Are quality checks too strict/lenient?
  - Are there new patterns to detect?

- **Archive old merged content**
  - Clean up `content-submissions/` if needed

#### Quarterly

- **Update Node.js version**
  - Check LTS releases
  - Update version in workflow
  - Test locally first

- **Review CI usage**
  - Check GitHub Actions usage/billing
  - Optimize if approaching limits

### Schema Updates

When updating schemas in `schemas/`:

1. **Test locally**
   ```bash
   npm run validate:content
   npm test
   ```

2. **Update examples**
   - Ensure all examples still validate
   - Add examples for new fields

3. **Update documentation**
   - Update `CONTRIBUTING_CONTENT.md`
   - Document new fields/requirements

4. **Version bump**
   - Minor version for new fields
   - Major version for breaking changes

5. **Announce changes**
   - Update CHANGELOG.md
   - Notify contributors in README

### Workflow Updates

When modifying `.github/workflows/content-validation.yml`:

1. **Test in fork first**
   - Create fork of repository
   - Test workflow changes there
   - Avoid breaking main repository CI

2. **Check syntax**
   - Use GitHub's workflow validator
   - Or use online YAML validators

3. **Monitor first run**
   - Watch workflow execution closely
   - Check all steps complete successfully

4. **Document changes**
   - Update this guide
   - Update CHANGELOG.md

---

## Best Practices

### For Maintainers

1. **Communicate clearly with contributors**
   - Provide helpful error messages
   - Guide them to documentation
   - Be patient with first-time contributors

2. **Keep validation reasonable**
   - Don't block on style preferences
   - Use warnings for suggestions
   - Only error on critical issues

3. **Test changes thoroughly**
   - Run full test suite before committing
   - Test merge process end-to-end
   - Verify in browser after merging

4. **Document everything**
   - Update guides when process changes
   - Keep examples current
   - Document troubleshooting steps

5. **Monitor CI health**
   - Fix broken workflows immediately
   - Keep dependencies updated
   - Optimize slow workflows

### For Contributors (to communicate)

1. **Validate locally before PR**
   - Saves CI resources
   - Faster feedback
   - Better contribution experience

2. **Read validation output carefully**
   - Understand why validation failed
   - Fix all errors before re-submitting
   - Ask for help if unclear

3. **Use auto-fix when possible**
   - `npm run validate:content -- --fix`
   - Review changes before committing
   - Saves time on formatting issues

---

## Additional Resources

- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Ajv JSON Schema Validator**: https://ajv.js.org/
- **JSON Schema Documentation**: https://json-schema.org/

---

## Support

If you encounter issues not covered in this guide:

1. Check workflow logs in GitHub Actions tab
2. Run validation locally to reproduce
3. Check existing GitHub issues
4. Create new issue with:
   - Workflow run URL
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior

---

**Last Updated:** November 19, 2025 (v1.7.0 - Phase 3)
