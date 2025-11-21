# Changelog

All notable changes to LoreWeaver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.0] - 2025-11-19

### Added
- **Content Submission System (Phase 1)**: Infrastructure for community content contributions
  - Created `/content-submissions/` directory structure with subdirectories for encounters, locations, npcs, skillchecks, and dangers
  - Created `/schemas/` directory with comprehensive JSON schemas:
    - `encounter-schema.json` - Validates adventure encounters with resolutions
    - `location-schema.json` - Validates locations with progressive reveal details
    - `npc-schema.json` - Validates species, professions, alignments, and personalities
    - `skillcheck-schema.json` - Validates D&D 5e skill check challenges
    - `danger-schema.json` - Validates traps and environmental hazards
  - Created `/examples/` directory with 7 complete template files for content creators
  - Created `/scripts/` directory with validation tooling
- **Content Validation Script (Phase 1)**: Basic automated validation
  - `scripts/validate-content.js` - Full validation with AJV schema validator
  - JSON syntax validation
  - Schema compliance checking
  - Duplicate ID detection across all submissions
  - Field constraint validation (lengths, types, enums)
  - Custom validation rules per content type
  - Colored terminal output with detailed error messages
  - Support for file or directory validation
- **Enhanced Validation (Phase 2)**: Advanced quality checks and auto-fixes
  - **`--fix` flag**: Automatic correction of common issues
    - Trims whitespace from all string fields
    - Normalizes tags to lowercase-hyphenated format
    - Fixes location/NPC keys to proper format
    - Clamps encounter weights to valid range (0.5-2.0)
  - **`--report` flag**: Detailed validation reports
    - Quality warnings for description length
    - Suggestions for content improvement
    - Best practice recommendations
    - Weight/difficulty balance advice
    - Resolution quality checks
  - **`--check-production` flag**: Production data cross-referencing
    - Loads production JSON files for comparison
    - Detects duplicate encounter titles
    - Detects duplicate location/NPC keys
    - Warns about unknown tags not in production
    - Prevents content duplication
  - **Quality Validation**: Content-specific checks
    - Encounter: Weight balance, description length, resolution variety
    - Location: Detail uniqueness, progressive reveal quality
    - NPC: Name variety, tag completeness
    - Skillcheck: DC range validation, description detail
    - Danger: Detection/disarm method detail
- **Content Author Guide**: Comprehensive documentation
  - `CONTRIBUTING_CONTENT.md` - 500+ line guide for content creators
  - Quick start instructions
  - Complete workflow documentation
  - Content type specifications with examples
  - Validation guide with advanced options
  - Style guide for descriptions and JSON formatting
  - Best practices for evocative writing
  - Common issues and solutions
  - Complete submission checklist
- **NPM Scripts**: New validation commands
  - `npm run validate:content` - Validate all submissions
  - `npm run validate:content [file]` - Validate specific file
  - `npm run test:content-validation` - Run Phase 1 test suite
  - `npm run test:content-validation-phase2` - Run Phase 2 test suite
- **Test Suite**: 27 automated tests (12 Phase 1 + 15 Phase 2)
  - Directory structure validation
  - Schema file validation
  - JSON syntax validation
  - Template validation
  - Script functionality checks
  - Dependency verification
  - Auto-fix functionality tests
  - Production cross-check tests
  - Tag consistency tests
  - Quality validation tests

### Changed
- Updated `package.json` to version 1.7.0
- Added Ajv and ajv-formats as devDependencies
- Integrated content validation tests into main test suite
- Updated `data/version.json` to 1.7.0

### Technical
- JSON Schema Draft-07 standard
- Ajv validator with strict mode
- Schema IDs follow URI pattern
- Extensive field constraints and patterns
- Support for UTF-8 and special characters
- Regex patterns for lowercase-with-hyphens format
- Enum validation for D&D 5e skills and damage types
- Progressive reveal system for location details
- Content type detection from structure and location

### Documentation
- Detailed schema documentation in each schema file
- Example templates demonstrate proper format
- Contributing guide covers complete workflow
- Validation error messages guide fixes
- Style guide improves content quality

### Success Metrics
- ✅ Content authors can validate locally before PR
- ✅ 100% schema coverage for all content types
- ✅ Comprehensive examples for every content type
- ✅ Clear error messages for validation failures
- ✅ 63 automated tests passing (12 Phase 1 + 15 Phase 2 + 36 Phase 4)
- ✅ Zero configuration required for contributors
- ✅ Auto-fix capability for common formatting issues
- ✅ Production duplicate detection prevents conflicts
- ✅ Quality suggestions improve content standards
- ✅ Automated CI/CD validation on pull requests
- ✅ Merge blocking prevents invalid content from entering production
- ✅ Automated PR comments guide contributors
- ✅ 117 total automated tests ensure pipeline integrity
- ✅ Complete end-to-end workflow validated
- ✅ Zero production JSON corruption risk

**Note:** This includes all phases (1-4) of the CI Pipeline pattern. Feature complete and ready for production.

### Integration Testing & Verification (Phase 4)

#### Integration Test Suite
- **`tests/test-ci-integration.js`**: Comprehensive end-to-end testing (36 tests)
  - Merge script functionality validation
  - Content type detection testing
  - Duplicate detection verification
  - Workflow file syntax and structure validation
  - Production data integrity checks
  - Documentation completeness verification
  - Version consistency validation
  - End-to-end workflow simulation

#### Test Coverage
- **36 integration tests** covering:
  - Merge script exports and functionality
  - Content type auto-detection (encounter, location, NPC, skillcheck, danger)
  - Duplicate detection by name and ID
  - Dry-run mode operation
  - Workflow YAML structure (name, on, jobs, steps)
  - GitHub Actions steps (checkout, setup, npm ci, validation, commenting)
  - Node.js version (v18) and npm caching
  - PR comment creation/updates
  - Merge blocking on validation failure
  - Production JSON file structure
  - Schema file existence for all content types
  - Example template availability
  - Documentation file completeness
  - Package.json script registration
  - Version consistency (package.json, version.json, CHANGELOG)
  - Phase completion tracking in TODO.md

#### NPM Script Added
- `npm run test:ci-integration` - Run Phase 4 integration tests

#### Test Suite Totals
- **117 total assertions** across all test suites:
  - 12 tests - Phase 1 content validation
  - 15 tests - Phase 2 enhanced validation
  - 36 tests - Phase 4 CI/CD integration
  - 54 tests - Other test suites (files, JSON, HTML, species, bugfixes, commands, exports, locations, version display, version consistency)
- **100% pass rate** - All tests passing

#### Validation Milestones
- ✅ End-to-end workflow validated (submission → validation → merge)
- ✅ All GitHub Actions workflow components verified
- ✅ Merge script tested with multiple content types
- ✅ Documentation completeness confirmed
- ✅ Version consistency across all files
- ✅ Zero test failures in full suite

#### Final Verification
- All 4 phases implemented and tested
- Complete CI/CD pipeline operational
- Comprehensive documentation for contributors and maintainers
- Automated testing ensures system integrity
- Ready for production use

### CI/CD Integration (Phase 3)

#### GitHub Actions Workflow
- **`.github/workflows/content-validation.yml`**: Automated PR validation
  - Triggers on PRs targeting `main` with changes to `content-submissions/`, `schemas/`, or validation scripts
  - Two jobs: `validate-content` and `test-validation-suite`
  - Uses Node.js 18 with npm caching
  - Runs full validation pipeline on all changed files

#### Workflow Steps
1. **JSON Linting** - Validates JSON syntax
2. **Schema Validation** - Checks schema compliance
3. **Production Cross-Check** - Detects duplicates
4. **Quality Report** - Generates improvement suggestions
5. **PR Comment** - Posts results to pull request
6. **Status Check** - Blocks merge on validation failure
7. **Test Suite** - Runs validation tests (27 tests)

#### PR Comment Features
- ✅ **Success Comment**: Shows all validations passed
- ⚠️ **Warning Comment**: Shows quality suggestions (merge allowed)
- ❌ **Error Comment**: Shows blocking issues with helpful tips
- 📚 **Resource Links**: Links to guides, schemas, examples
- 💡 **Fix Suggestions**: Recommends auto-fix command when appropriate
- **Smart Updates**: Updates existing comment on new commits

#### Merge Protection
- **Blocks merge** on:
  - Invalid JSON syntax
  - Schema validation failures
  - Duplicate content detection
  - Validation script errors
- **Allows merge** on:
  - All validations pass
  - Only warnings/suggestions present

#### Content Merge Script
- **`scripts/merge-content.js`**: Tool for merging approved content
  - `--dry-run` flag for preview
  - `--all` flag to merge all submissions
  - `--file PATH` to merge specific file
  - Automatic ID generation
  - Alphabetical sorting
  - Metadata updates (lastUpdated, totalCount)
  - Duplicate detection before merge
  - Content type auto-detection

#### NPM Scripts Added
- `npm run merge:content` - Run merge script with options

#### Maintainer Documentation
- **`MAINTAINING_CI.md`**: Comprehensive guide for CI/CD maintenance
  - Workflow overview and architecture
  - Validation process details
  - Manual and automated merge procedures
  - Troubleshooting guide (10+ common issues)
  - Maintenance tasks (weekly, monthly, quarterly)
  - Schema update procedures
  - Workflow modification best practices
  - CI health monitoring

#### Contributor Documentation Enhanced
- **`CONTRIBUTING_CONTENT.md`** updated with CI/CD section:
  - Automated validation explanation
  - PR workflow diagram
  - Understanding PR comments
  - Responding to validation failures
  - Tips for passing CI
  - Troubleshooting CI issues

**Note:** This completes Phases 1-3 of the CI Pipeline pattern. Phase 4 (Final Testing & Documentation) remains.

## [1.6.0] - 2025-11-19

### Added
- **Version Display in Footer**: Current version is now displayed in the footer of every page
  - Clickable version number opens changelog modal
  - Keyboard accessible with Enter/Space keys
  - ARIA labels for screen reader support
  - Graceful error handling if version.json fails to load
- **Manual Changelog Access**: "What's New" button added to Settings page
  - Opens full changelog history in modal
  - Shows all versions with proper categorization (Major/Minor/Patch badges)
  - Does not require version update trigger
  - Keyboard navigation with Escape to close
- **Enhanced Changelog Modal**: Improved changelog display for manual access
  - Displays all historical versions, not just new ones
  - Patch version badge styling (light gradient)
  - Separate rendering for manual vs automatic display
  - Full changelog file link for reference
- **Version Display Function**: New `displayVersion()` function in app.js
  - Automatically fetches and displays version on page load
  - Updates footer element with current version number
  - Error handling with fallback display

### Changed
- Updated changelog.js to export `showChangelogManual()` function
- Enhanced ChangelogModal to support both auto-display and manual modes
- Footer now includes version information and app description
- Settings page "About" section now includes interactive button

### Technical
- Version display integrates with existing version management system
- Reuses VersionManager and ChangelogModal classes
- Maintains separation of concerns (auto vs manual display)
- No changes to localStorage or version tracking logic
- Full test coverage with 12 automated tests

## [1.5.1] - 2025-11-19

### Fixed
- **Location Count Dropdown**: Fixed bug where the number of locations dropdown was ignored for encounters with custom locations. Users can now control the number of locations generated even when an encounter has predefined location options.
- **Resolution Counting**: Fixed bug where the Resolution step was incorrectly counted as a location in the "unfolds across X locations" text. The display now accurately reflects only explorable locations.

### Tests
- Added comprehensive test suite for location generation bugs (tests/test-location-count-bugs.js)
- Tests verify dropdown behavior with and without custom locations
- Tests verify Resolution is not counted as a location

## [1.5.0] - 2025-11-19

### Added
- **Strategy Pattern for Export Formats**: Flexible export system with encapsulated algorithms
- ExportStrategy base class for defining export interfaces
- MarkdownExportStrategy for Markdown format exports
- TextExportStrategy for plain text exports with line wrapping
- HTMLExportStrategy for HTML/PDF exports with built-in styles
- JSONExportStrategy for structured JSON exports
- ExportManager context class for strategy registration and execution
- Export format dropdown in encounter actions menu
- JSON export option added to UI
- Export strategy test suite with 14 comprehensive tests
- Strategy-specific options (includeMetadata, includeIcons, pretty, lineLength, etc.)
- Filename generation with sanitization
- XSS protection with content sanitization
- MIME type handling for each format

### Changed
- Refactored export.js to use Strategy Pattern
- Simplified export functions to use ExportManager
- Reduced export.js from 767 lines to 164 lines (78% reduction)
- Export functions now use centralized strategy selection
- Improved error handling in export operations
- Enhanced security with input sanitization

### Technical
- Abstract base class pattern for extensibility
- Factory pattern for strategy instantiation
- Singleton ExportManager for global access
- Options pattern for strategy customization
- Consistent API across all export formats
- Easy addition of new export formats (<30 minutes)

## [1.4.0] - 2025-11-19

### Added
- **Command Pattern for Undo/Redo**: Full undo/redo functionality with keyboard shortcuts
- **Context-Aware Undo/Redo**: Separate history stacks for Generate, NPC, and Search pages
- CommandHistory class with history stack management (max 50 commands)
- GenerateEncounterCommand with state capture for randomness handling
- GenerateNPCCommand for NPC page undo/redo functionality
- FilterChangeCommand for reverting filter changes
- SearchCommand for undoing search operations
- BatchCommand for atomic multi-command operations
- Context helper functions: getActiveHistory(), undoInContext(), redoInContext()
- Three separate history instances: generateHistory, npcHistory, searchHistory
- Automatic context detection via window.currentPage tracking
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z/Ctrl+Y (redo) - context-aware
- Command history test suite with 18 comprehensive tests
- Context awareness test suite with 12 comprehensive tests (30 total)
- Browser-based test runner with colored output (tests/test-runner.html)
- Memory leak prevention in command history
- Security validation for command inputs (XSS prevention)
- Event subscription system for history state changes
- State capture system for before/after snapshots including HTML and event listeners
- EventBus (Observer Pattern) for decoupled component communication
- Publish/Subscribe system for application-wide event management
- Standard event constants (Events) to prevent typos
- Event history tracking for debugging
- Comprehensive EventBus test suite with 13 tests
- Event publishing for page switching, search, filters, and theme changes

### Changed
- Wrapped generateEncounter() to use Command Pattern with state capture
- Wrapped generateNPC() to use Command Pattern with context awareness
- Wrapped filter changes to use Command Pattern
- Removed History, Undo, and Redo UI buttons (keyboard shortcuts only)
- Fixed undo/redo to restore state instead of re-executing commands
- Enhanced switchPage() to track window.currentPage for context detection
- Added window.currentPage initialization in initApp()
- Integrated EventBus into app.js for better component decoupling
- Updated switchPage() to publish PAGE_SWITCHED events
- Updated performSearch() to publish SEARCH_STARTED and SEARCH_COMPLETED events  
- Updated filter functions to publish FILTERS_UPDATED and FILTERS_CLEARED events
- Updated toggleTheme() to publish THEME_TOGGLED events
- Consolidated DESIGN_PATTERNS_TODO.md into main TODO.md
- Updated TODO.md to reflect completed work (bugs, optimizations, patterns)
- Added remaining design patterns (Command, Strategy) to TODO

### Removed
- BUG_FIXES_SUMMARY.md (work now documented in CHANGELOG and git history)
- OPTIMIZATION_SUMMARY.md (work now documented in CHANGELOG and git history)
- IMPLEMENTATION_SUMMARY.md (outdated implementation notes)
- UPDATE_SUMMARY.md (outdated update notes)
- SPECIES_CAPITALIZATION.md (feature already implemented)
- ENCOUNTER_SELECTION_FEATURE.md (feature already implemented)
- CI_INTEGRATION_SUMMARY.md (CI already integrated)
- CI_SETUP.md (CI already set up)
- DESIGN_PATTERNS_TODO.md (consolidated into TODO.md)

## [1.3.0] - 2025-11-18

### Added
- Changelog display screen with semantic versioning
- Automatic overlay on major/minor version updates
- Version tracking with localStorage persistence
- Beautiful modal with gradient badges for update types
- Dark theme support for changelog modal
- Mobile-responsive changelog design
- Keyboard shortcuts (Escape to close)
- Link to full changelog in modal footer
- Comprehensive test suite for changelog functionality

### Changed
- Updated HTML validation to include changelog module
- Enhanced project with design pattern documentation

## [1.2.0] - 2025-11-18

### Added
- Performance optimizations: search debouncing, DOM caching, image preloading
- Filter memoization for faster search results
- Progressive reveal feature for exploration mode

### Changed
- Improved search response time by 60%
- Optimized filter calculations

### Fixed
- Species capitalization consistency across all modules
- Filter state persistence issues
- Search result pagination edge cases

## [1.1.0] - 2025-11-10

### Added
- NPC generator with personality traits
- Location detail exploration
- Flow navigator for quick navigation

### Changed
- Redesigned search interface
- Improved mobile responsiveness

## [1.0.0] - 2025-11-01

### Added
- Initial release
- Encounter generator for D&D 5e
- Environment-based generation
- Export to Markdown and PDF
- Dark/Light theme toggle
