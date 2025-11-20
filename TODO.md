# LoreWeaver - TODO List

## 🎨 DESIGN PATTERNS (Architecture Improvements)

### ✅ Pattern #0: Changelog Display Screen (COMPLETED)
**Status:** ✅ **IMPLEMENTED** (v1.3.0, merged to main)
**Implementation:**
- Created `assets/js/changelog.js` with VersionManager and ChangelogModal
- Semantic versioning system (major.minor.patch)
- Auto-displays on major/minor version updates
- Parses CHANGELOG.md using Keep a Changelog format
- Modal with keyboard navigation and ARIA labels
- Test suite: 7/7 tests passing
- Version validation test enforces consistency across files

### ✅ Pattern #1: Observer Pattern (EventBus) - COMPLETED
**Status:** ✅ **IMPLEMENTED** (v1.3.0, feature branch pushed)
**Implementation:**
- Created `assets/js/event-bus.js` with EventBus singleton
- 20+ predefined event constants (PAGE_SWITCHED, SEARCH_COMPLETED, etc.)
- Pub/sub system for decoupled component communication
- Integrated into `app.js` for key actions
- Features: subscribe(), once(), publish(), unsubscribe(), event history
- Memory leak prevention and error handling
- Test suite: 13/13 tests passing

### ✅ Pattern #2: Command Pattern for Undo/Redo History - COMPLETED
**Status:** ✅ **IMPLEMENTED** (v1.4.0, feature branch ready to push)
**Implementation:**
- Created `assets/js/command-history.mjs` with CommandHistory class
- Implemented command classes: GenerateEncounterCommand, GenerateNPCCommand, FilterChangeCommand, SearchCommand, BatchCommand
- Context-aware undo/redo: Separate history stacks for Generate, NPC, and Search pages
- State capture system: Before/after snapshots with HTML and event listeners
- Automatic context detection via window.currentPage tracking
- Context helper functions: getActiveHistory(), undoInContext(), redoInContext(), executeInContext()
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z/Ctrl+Y (redo) - context-aware
- Removed UI buttons (History/Undo/Redo) - keyboard shortcuts only
- Test suite: 30/30 tests passing (18 command pattern + 12 context awareness)
- Browser-based test runner: tests/test-runner.html with colored output
- Memory leak prevention with max 50 commands per context
- Security: Input sanitization and XSS prevention
- Event subscription system for UI updates

**Success Metrics:**
- ✅ Users can undo/redo up to 50 actions per page context
- ✅ Keyboard shortcuts work (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y)
- ✅ Context isolation: Undo on Generate doesn't affect NPC page
- ✅ State properly captured and restored (handles randomness)
- ✅ History tracked in memory (session-based, per context)
- ✅ Memory managed with FIFO eviction after 50 commands per context

### ✅ Pattern #3: Strategy Pattern for Export Formats - COMPLETED
**Status:** ✅ **IMPLEMENTED** (v1.5.0, feature branch ready to push)
**Implementation:**
- Created `assets/js/export-strategies.js` with ExportStrategy base class
- Implemented concrete strategies: MarkdownExportStrategy, TextExportStrategy, HTMLExportStrategy, JSONExportStrategy
- Created ExportManager context class with strategy registration and execution
- Refactored export.js from 767 lines to 164 lines (78% reduction)
- Added JSON export option to encounter actions menu
- Strategy-specific options: includeMetadata, includeIcons, pretty, lineLength, printMode, colorScheme
- Filename generation with special character sanitization
- XSS protection with HTML entity encoding
- Test suite: 14/14 tests passing
- Abstract base class pattern for extensibility
- Factory pattern for strategy instantiation
- Singleton ExportManager for global access

**Success Metrics:**
- ✅ Can add new export format in <30 minutes (class extends ExportStrategy)
- ✅ All formats have consistent API (base class enforces interface)
- ✅ Export options work correctly (setOptions/getOptions methods)
- ✅ No duplicate code between formats (each strategy encapsulated)
- ✅ Security validated (XSS prevention tests passing)
- ✅ 78% code reduction in export.js

### 📋 UI Enhancement: Version Display & Manual Changelog
**Priority:** LOW | **Estimated Effort:** 1-2 hours

**Proposed Additions:**
1. **Version Display in Footer/Header:**
   - Show current version from `data/version.json`
   - Format: "v1.3.0" with subtle styling
   - Clickable to open changelog modal
   - Helps users report bugs with version info

2. **Manual Changelog Access:**
   - Add "What's New" button in Settings page
   - Add optional menu item in header
   - Opens changelog modal showing all versions
   - No localStorage check - always shows full history

**Implementation:**
- Add `displayVersion()` function in app.js
- Add `showChangelogManual()` function in ui.js
- Update footer/header HTML with version element
- Add changelog button to Settings page

---

## 📊 COMPLETED WORK

### ✅ Bugs Fixed (5/5)
All critical bugs have been resolved with test suites:

1. ✅ Memory Leak - Event Listeners (Commit: c004022)
2. ✅ localStorage Quota Error Handling (Commit: a754c5a)
3. ✅ Race Condition in Data Loading (Commit: 078a6b2)
4. ✅ Duplicate Function Export (Commit: 1af9dca)
5. ✅ Chrome Panel Closing Issue (Commit: 96b198a)

### ✅ Optimizations Implemented (4/5)
Performance improvements completed:

1. ✅ Search Input Debouncing (Commit: df143d2)
2. ✅ DOM Element Caching (Commit: 554cb75)
3. ✅ Image Preloading (Commit: 58e82cd)
4. ✅ Filter Calculation Memoization (Commit: 7455c77)
5. ⚠️ String Concatenation - DEFERRED (low priority)

### ✅ Design Patterns Implemented (2/4)
Architecture improvements:

1. ✅ Changelog Display Screen (v1.3.0, merged)
2. ✅ Observer Pattern / EventBus (v1.3.0, pushed)

---

## 📊 PROJECT STATUS

**Current Version:** v1.3.0

### Test Coverage
- 15 total assertions in CI
- 6 passing (critical structural checks)
- 1 expected fail (requires full browser module loading)
- 8 skipped (browser-specific features)

### Commits Summary
- 11 commits for bug fixes and optimizations
- Each bug fix committed separately with test suite
- Individual commits for each optimization
- Changelog and EventBus patterns on feature branches

---

## 🎯 NEXT PRIORITIES

1. **Command Pattern Implementation** (MEDIUM priority, 6-8 hours)
   - Undo/Redo functionality
   - History stack with 50 command limit
   - Keyboard shortcuts (Ctrl+Z/Shift+Ctrl+Z)
   
2. **Strategy Pattern for Exports** (LOW priority, 3-4 hours)
   - Refactor export.js to use strategy pattern
   - Add new export formats (HTML, PDF)
   - Customizable export options

3. **Version Display UI** (LOW priority, 1-2 hours)
   - Show version in footer/header
   - Manual changelog access button
   - "What's New" in Settings

---

**Last Updated:** November 19, 2025
**Status:** 3/3 design patterns implemented, all critical bugs fixed, major optimizations complete

---

## 🚀 NEW PRIORITIES (Q4 2025 - Q1 2026)

### 🔄 Pattern #4: CI Pipeline for Content Management
**Priority:** HIGH | **Estimated Effort:** 12-16 hours | **Version:** v1.6.0

**Intent:** Automate content validation and integration to prevent production JSON corruption

**Problem Statement:**
- New content (encounters, locations, NPCs) is currently added directly to production JSON files
- Manual editing of large JSON files is error-prone
- No validation before content reaches production
- Content authors have no way to test locally before submitting

**Proposed Solution:**

**Phase 1: Content Submission System (4-6 hours)**
- Create `/content-submissions/` directory structure:
  ```
  content-submissions/
    encounters/
    locations/
    npcs/
    skillchecks/
    dangers/
  ```
- Define content schemas in `/schemas/`:
  - `encounter-schema.json` - Validation rules for encounters
  - `location-schema.json` - Validation rules for locations
  - `npc-schema.json` - Validation rules for NPCs
  - `skillcheck-schema.json` - Validation rules for skill checks
  - `danger-schema.json` - Validation rules for dangers

**Phase 2: Local Validation Tools (3-4 hours)**
- Create `scripts/validate-content.js`:
  - Parse JSON submission files
  - Validate against schemas (using Ajv or similar)
  - Check for duplicate IDs
  - Verify required fields
  - Validate tag consistency
  - Check for balanced CR ratings
- Create `npm run validate:content` script
- Create content author guide (`CONTRIBUTING_CONTENT.md`)
- Example content templates in `/examples/`

**Phase 3: CI/CD Integration (3-4 hours)**
- GitHub Actions workflow (`.github/workflows/content-validation.yml`):
  - Trigger on PR to main with changes in `/content-submissions/`
  - Run schema validation
  - Run duplicate ID checks
  - Run format validation (JSON lint)
  - Comment on PR with validation results
  - Block merge if validation fails
- Auto-merge script (`scripts/merge-content.js`):
  - Parse validated submissions
  - Add to appropriate production JSON
  - Maintain alphabetical/logical ordering
  - Update content counts
  - Commit with standardized message

**Phase 4: Testing & Documentation (2-3 hours)**
- Test suite for validation logic
- Test suite for merge logic
- Documentation for content authors
- Documentation for CI maintainers

**Success Metrics:**
- ✅ Content authors can validate locally before PR
- ✅ CI blocks invalid content automatically
- ✅ Production JSONs never manually edited
- ✅ Merge conflicts eliminated through automation
- ✅ Content submission time reduced by 80%
- ✅ Zero production JSON corruption incidents

**Dependencies:**
- Ajv JSON Schema validator
- GitHub Actions knowledge
- Node.js scripting

---

### 🎭 Pattern #5: Terminology Update - Adventure System
**Priority:** MEDIUM | **Estimated Effort:** 6-8 hours | **Version:** v1.6.0

**Intent:** Align nomenclature with expanded project scope (encounters → adventures)

**Problem Statement:**
- App originally generated single encounters
- Scope has expanded to full adventure generation
- UI still says "Generate Page" and "Encounter"
- Code variables use outdated terminology
- User expectations don't match actual functionality

**Proposed Solution:**

**Phase 1: UI Text Updates (2-3 hours)**
- Update all user-facing text:
  - "Generate Page" → "Adventure Page"
  - "Generate Encounter" → "Generate Adventure"
  - "Current Encounter" → "Current Adventure"
  - "Encounter Flow" → "Adventure Flow"
  - "Saved Encounters" → "Saved Adventures"
  - "Export Encounter" → "Export Adventure"
- Update button labels and tooltips
- Update placeholder text
- Update error messages
- Update help text

**Phase 2: Code Refactoring (2-3 hours)**
- Rename variables (maintain backward compatibility):
  - `generateEncounter()` → `generateAdventure()` (keep old as alias)
  - `currentEncounter` → `currentAdventure`
  - `encounterTemplate` → `adventureTemplate`
  - `encounterFlow` → `adventureFlow`
  - `encounterDisplay` → `adventureDisplay`
- Update function names in:
  - `app.js`
  - `core.js`
  - `ui.js`
  - `storage.js`
  - `export.js`
  - `command-history.mjs`

**Phase 3: File & Module Updates (1-2 hours)**
- Update comments and documentation strings
- Update test descriptions
- Update localStorage keys (with migration)
- Update export filenames
- Update data structures

**Phase 4: Testing & Migration (1-2 hours)**
- Add backward compatibility tests
- Test localStorage migration
- Test saved adventure loading
- Update test suite descriptions
- Verify all features work with new terminology

**Success Metrics:**
- ✅ All UI text reflects "Adventure" terminology
- ✅ Code is consistent and clear
- ✅ Backward compatibility maintained (old saves load)
- ✅ No broken features from refactoring
- ✅ Documentation updated
- ✅ Users understand app scope immediately

**Breaking Changes:**
- None (backward compatible aliases maintained)

**Migration Notes:**
- Old localStorage keys automatically migrated
- Old saved encounters renamed to adventures
- Export formats remain compatible

---

### 📚 Pattern #6: GitHub Wiki & Comprehensive Documentation
**Priority:** MEDIUM | **Estimated Effort:** 16-24 hours | **Version:** v1.7.0

**Intent:** Create centralized, comprehensive documentation hub for all stakeholders

**Problem Statement:**
- Documentation scattered across multiple markdown files
- No centralized knowledge base
- Developer onboarding is slow
- Content creators have no clear guide
- API documentation is incomplete
- No versioning for documentation

**Proposed Solution:**

**Phase 1: Wiki Structure & Navigation (3-4 hours)**
Create GitHub Wiki with structure:
```
Home
├── Getting Started
│   ├── For Users
│   ├── For Developers
│   └── For Content Creators
├── User Guide
│   ├── Adventure Generation
│   ├── Search & Filters
│   ├── Saving & Loading
│   ├── Export Options
│   └── Settings & Customization
├── Developer Documentation
│   ├── Architecture Overview
│   ├── Module Reference
│   │   ├── app.js
│   │   ├── core.js
│   │   ├── ui.js
│   │   ├── storage.js
│   │   ├── export-strategies.mjs
│   │   ├── event-bus.js
│   │   ├── command-history.mjs
│   │   └── changelog.js
│   ├── Design Patterns
│   │   ├── Observer Pattern (EventBus)
│   │   ├── Command Pattern (Undo/Redo)
│   │   └── Strategy Pattern (Exports)
│   ├── State Management
│   ├── Testing Guide
│   ├── Build & Deploy
│   └── Contributing Code
├── Content Creator Guide
│   ├── Content Submission Workflow
│   ├── Schema Reference
│   │   ├── Encounter Schema
│   │   ├── Location Schema
│   │   ├── NPC Schema
│   │   ├── Skill Check Schema
│   │   └── Danger Schema
│   ├── Validation Guide
│   ├── Best Practices
│   ├── Tag System
│   └── Contributing Content
├── API Reference
│   ├── Core Functions
│   ├── UI Functions
│   ├── Storage Functions
│   ├── Export Functions
│   ├── EventBus API
│   ├── Command API
│   └── Utils
├── Version History
│   ├── v1.5.x
│   ├── v1.4.x
│   ├── v1.3.x
│   └── Migration Guides
└── FAQ & Troubleshooting
```

**Phase 2: Core Documentation Pages (6-8 hours)**
- **Home Page:** Project overview, quick links, key features
- **Getting Started:** Installation, first adventure, basic usage
- **Architecture Overview:** System design, data flow, component interaction
- **Module Reference:** Each major module documented with:
  - Purpose and responsibilities
  - Public API
  - Internal functions
  - Dependencies
  - Usage examples
  - Related modules

**Phase 3: API Documentation (4-6 hours)**
Document every public function with:
- Function signature
- Parameters (types, descriptions, defaults)
- Return values
- Exceptions/errors
- Usage examples
- Related functions
- Version introduced
- Deprecation warnings

Example template:
```markdown
### generateAdventure(environment, options)

**Description:** Generates a complete adventure for the specified environment.

**Parameters:**
- `environment` (string): The environment key (e.g., 'undercity', 'wilderness')
- `options` (object, optional): Generation options
  - `partyLevel` (number): Party level 1-20 (default: 5)
  - `numLocations` (number): Number of locations 1-5 (default: 3)
  - `seed` (string): Random seed for reproducibility (default: auto)

**Returns:** (object) Adventure data structure

**Throws:**
- `Error` if environment doesn't exist
- `Error` if data not loaded

**Example:**
\`\`\`javascript
const adventure = generateAdventure('undercity', {
  partyLevel: 8,
  numLocations: 4
});
\`\`\`

**Version:** 1.0.0  
**See Also:** selectEncounterTemplate(), selectLocationsForEncounter()
```

**Phase 4: Tutorials & Examples (3-4 hours)**
- "Your First Adventure" walkthrough
- "Creating Custom Content" tutorial
- "Adding a New Export Format" guide
- "Implementing a New Feature" guide
- "Understanding the EventBus" tutorial
- "Command Pattern Usage" examples

**Phase 5: Version Management (2-3 hours)**
- Document v1.5.x (current)
- Document v1.4.x (previous)
- Document v1.3.x (previous)
- Create migration guides between versions
- Maintain changelog integration
- Version compatibility matrix

**Guidelines for All Wiki Content:**
- **Clarity:** Plain language, active voice, concise sentences
- **Comprehensive:** Cover all features, edge cases, and gotchas
- **Up-to-date:** Regular updates with each release
- **Well-organized:** Logical hierarchy, searchable, cross-linked
- **Rich Formatting:** Use headers, lists, code blocks, tables, images
- **Practical:** Real examples, step-by-step instructions
- **Distinct from README:** README is overview; Wiki is deep-dive

**Success Metrics:**
- ✅ Complete API documentation (100% coverage)
- ✅ Developer onboarding time reduced by 60%
- ✅ Content creator success rate > 90%
- ✅ User questions answered in wiki (fewer support requests)
- ✅ Documentation covers current + 2 prior versions
- ✅ Every module fully documented
- ✅ Search functionality works well

**Tools Required:**
- GitHub Wiki
- JSDoc comments in code
- Markdown expertise
- API documentation generator (optional)

**Maintenance:**
- Update with each release
- Review quarterly for accuracy
- Incorporate user feedback
- Add FAQs from support questions

---

## 📊 PROJECT STATUS

**Current Version:** v1.5.1

