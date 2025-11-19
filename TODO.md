# LoreWeaver - TODO List

## 🐛 BUGS (Critical Issues)

### 1. **Memory Leak - Event Listeners Not Cleaned Up**
**Location:** `assets/js/ui.js` (lines 512-541)
**Issue:** Every time `renderNPCStatBlock()` is called, new event listeners are added to the stat block without removing old ones. If a user generates multiple NPCs, these listeners accumulate, causing memory leaks.
**Priority:** HIGH
**Fix Required:**
- Remove old event listeners before adding new ones
- Use event delegation instead of direct element listeners
- Consider using `{ once: true }` option for one-time listeners

### 2. **localStorage Quota Exceeded Error - No Error Handling**
**Location:** `assets/js/storage.js` (lines 34-36, 134)
**Issue:** No try-catch blocks around `localStorage.setItem()` calls. If localStorage quota is exceeded (typically 5-10MB), the app will crash with an uncaught exception.
**Priority:** HIGH
**Fix Required:**
```javascript
try {
    localStorage.setItem('savedEncounters', JSON.stringify(saved));
} catch (e) {
    if (e.name === 'QuotaExceededError') {
        alert('Storage limit reached! Please delete some saved encounters.');
    }
}
```

### 3. **Race Condition in Data Loading**
**Location:** `assets/js/app.js` (initApp function)
**Issue:** The app attempts to populate NPC dropdowns and generate encounters before verifying that `window.dataLoaded` is true. If data loading is slow, functions may execute with undefined data.
**Priority:** HIGH
**Fix Required:**
- Add explicit checks for `window.dataLoaded` before using data
- Add loading spinner while data is being fetched
- Disable generate button until data is loaded

### 4. **Duplicate Function Definitions in app.js**
**Location:** `assets/js/app.js` (line 996)
**Issue:** `window.changeItemsPerPage` is exported twice (lines 961 and 996), which could cause confusion and potential bugs.
**Priority:** MEDIUM
**Fix Required:**
- Remove duplicate export on line 996

### 5. **NPC Panel Not Closing Properly on Chrome**
**Location:** `assets/js/ui.js` (lines 207-213)
**Issue:** The code includes a "force reflow" hack (`void npcPanel.offsetHeight`) specifically for Chrome, indicating a browser-specific bug with CSS transitions not applying immediately.
**Priority:** MEDIUM
**Fix Required:**
- Investigate root cause (likely CSS animation timing)
- Consider using `requestAnimationFrame()` instead of forcing reflow
- Add proper z-index management for overlapping panels

---

## ⚡ OPTIMIZATIONS (Performance & UX Improvements)

### 1. **Inefficient Search Algorithm - O(n²) Complexity**
**Location:** `assets/js/app.js` (performSearch function, lines 500-565)
**Issue:** The search iterates through all encounters AND all locations on every keystroke, then filters again in the render function. For large datasets, this causes noticeable lag.
**Priority:** HIGH
**Optimization:**
- Implement debouncing (300ms delay) on search input
- Index data by searchable fields on load
- Cache search results
- Use Web Workers for large search operations

**Example:**
```javascript
// Add debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Apply to search
const debouncedSearch = debounce(performSearch, 300);
searchInput.addEventListener('input', debouncedSearch);
```

### 2. **Redundant DOM Queries - getElementById Called Repeatedly**
**Location:** Throughout all JS files (100+ instances)
**Issue:** Elements like `partyLevel`, `environmentSelect`, etc. are queried with `document.getElementById()` on every function call instead of being cached.
**Priority:** HIGH
**Optimization:**
- Cache frequently-used DOM elements in module-level variables
- Update cache when page changes

**Example:**
```javascript
// At module top
let cachedElements = {};

function cacheElements() {
    cachedElements = {
        partyLevel: document.getElementById('partyLevel'),
        environmentSelect: document.getElementById('environmentSelect'),
        encounterSeed: document.getElementById('encounterSeed'),
        // ... etc
    };
}

// Call on page load and page switch
```

### 3. **Large HTML String Concatenation in Loops**
**Location:** `assets/js/export.js`, `assets/js/ui.js`, `index.html` (multiple locations)
**Issue:** Building HTML strings using `+=` in loops is slow because strings are immutable in JavaScript, causing repeated memory allocations.
**Priority:** MEDIUM
**Optimization:**
- Use array.push() and join() instead
- Consider template literals with map/filter

**Example:**
```javascript
// BEFORE (slow)
let html = '';
locations.forEach(loc => {
    html += `<div>${loc.name}</div>`;
});

// AFTER (fast)
const htmlParts = locations.map(loc => `<div>${loc.name}</div>`);
const html = htmlParts.join('');
```

### 4. **No Progressive Image Loading for Icons**
**Location:** `index.html` and CSS files
**Issue:** Dice and character icons (`assets/img/d20.png`, `assets/img/character.png`) are loaded on every render without caching, preloading, or lazy loading.
**Priority:** LOW
**Optimization:**
- Add `<link rel="preload">` for critical images in `<head>`
- Use CSS sprites for small icons
- Consider inline SVG for icons (eliminates HTTP requests)

**Example:**
```html
<head>
    <link rel="preload" href="assets/img/d20.png" as="image">
    <link rel="preload" href="assets/img/character.png" as="image">
</head>
```

### 5. **Filter Dropdown Recalculation on Every Change**
**Location:** `assets/js/app.js` (updateAllFilters function, lines 300-450)
**Issue:** Every time a filter changes, ALL dropdowns are recalculated by iterating through the entire dataset, even if that dropdown's options haven't changed.
**Priority:** MEDIUM
**Optimization:**
- Only recalculate affected dropdowns
- Cache filter counts and only update when data changes
- Use memoization for expensive calculations

**Example:**
```javascript
// Cache counts on data load
let filterCache = {
    environmentCounts: {},
    locationTypeCounts: {},
    settingCounts: {},
    lastUpdate: null
};

function updateAllFilters() {
    // Only recalculate if data has changed
    if (filterCache.lastUpdate !== window.dataLoaded) {
        calculateFilterCounts();
        filterCache.lastUpdate = window.dataLoaded;
    }
    // Use cached values...
}
```

---

## 📋 ADDITIONAL RECOMMENDATIONS

### Code Quality
- Add JSDoc comments to all exported functions
- Implement unit tests for core logic (encounter generation, NPC selection)
- Add TypeScript for better type safety

### Security
- Sanitize user input in seed field before using in hash function
- Add Content Security Policy (CSP) headers
- Validate JSON data files on load

### Accessibility
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works throughout the app
- Add screen reader support for dynamic content updates

### Performance Monitoring
- Add performance.now() timing to track slow functions
- Consider adding error tracking (Sentry, etc.)
- Monitor localStorage usage and warn users before quota is reached

---

**Last Updated:** November 18, 2025
**Priority Legend:** HIGH (fix immediately) | MEDIUM (fix soon) | LOW (nice to have)
