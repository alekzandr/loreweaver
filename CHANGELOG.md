# Changelog

All notable changes to LoreWeaver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- EventBus (Observer Pattern) for decoupled component communication
- Publish/Subscribe system for application-wide event management
- Standard event constants (Events) to prevent typos
- Event history tracking for debugging
- Comprehensive EventBus test suite with 13 tests
- Event publishing for page switching, search, filters, and theme changes

### Changed
- Integrated EventBus into app.js for better component decoupling
- Updated switchPage() to publish PAGE_SWITCHED events
- Updated performSearch() to publish SEARCH_STARTED and SEARCH_COMPLETED events  
- Updated filter functions to publish FILTERS_UPDATED and FILTERS_CLEARED events
- Updated toggleTheme() to publish THEME_TOGGLED events

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
