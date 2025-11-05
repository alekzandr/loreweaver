# LoreWeaver Testing Guide

This document explains the automated testing setup for LoreWeaver.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific tests
npm run test:json    # Validate JSON data files
npm run test:html    # Validate HTML structure
npm run lint         # Check JavaScript code quality

# Fix linting issues automatically
npm run lint:fix
```

## Automated CI/CD

GitHub Actions automatically runs tests on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop` branches

### What Gets Tested

1. **JSON Validation** (`test:json`)
   - Validates all JSON files in `/data` directory
   - Checks structure and required fields
   - Verifies encounters have titles, descriptions, and tags
   - Ensures NPCs have required categories

2. **JavaScript Linting** (`lint`)
   - Checks code quality with ESLint
   - Enforces consistent code style
   - Catches common errors

3. **HTML Validation** (`test:html`)
   - Verifies required page elements exist
   - Checks all JavaScript modules are loaded
   - Validates image references

4. **Build Check** (`build-check`)
   - Tests that the local server can start
   - Verifies the site is accessible

## Setting Up Branch Protection

To enforce tests before merging:

1. Go to **Settings** → **Branches** in your GitHub repository
2. Add a branch protection rule for `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Select: `test` and `build-check`
   - ✅ Require branches to be up to date before merging

## Local Development

Before committing:

```bash
# Run tests
npm test

# Fix any linting issues
npm run lint:fix

# Start local server for testing
npm start
# Then visit http://localhost:8000
```

## Troubleshooting

### Tests failing locally but passing in CI (or vice versa)
- Make sure your Node.js version matches (v18+)
- Run `npm install` to ensure dependencies are up to date

### ESLint errors
- Run `npm run lint:fix` to auto-fix many issues
- Check `.eslintrc.json` for rule configuration

### JSON validation errors
- Use a JSON validator (like jsonlint.com) to check syntax
- Verify all required fields are present

## Adding New Tests

To add new test scripts:

1. Create test file in `/tests` directory
2. Add npm script to `package.json`
3. Update `.github/workflows/ci.yml` to run the test
4. Update this README

## Continuous Improvement

Suggested future enhancements:
- Add unit tests for JavaScript functions
- Add integration tests for user workflows
- Add accessibility testing (WCAG compliance)
- Add performance testing
- Add visual regression testing
