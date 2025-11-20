# Changelog

All notable changes to LoreWeaver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
