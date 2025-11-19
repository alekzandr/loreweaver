# Context-Aware Undo/Redo Tests

This directory contains comprehensive tests for the context-aware undo/redo functionality.

## Test Files

### `test-context-awareness.mjs`
Tests specifically for the context-aware functionality:
- `window.currentPage` detection
- `getActiveHistory()` returns correct history per page
- Context switching maintains separate histories
- `undoInContext()` and `redoInContext()` respect page context
- `canUndoInContext()` and `canRedoInContext()` 
- `executeInContext()` with explicit context parameter
- `clearContext()` across pages
- History isolation between pages
- Multiple page switches
- Undefined/invalid `currentPage` handling

**12 comprehensive tests** covering all context-aware scenarios.

### `test-command-history.mjs`
Core command pattern tests:
- CommandHistory construction
- Command execution
- Undo/redo functionality
- History limits
- Command chaining
- GenerateEncounterCommand
- GenerateNPCCommand
- FilterChangeCommand
- SearchCommand
- BatchCommand
- Error handling
- Memory management
- Subscription system

**18 comprehensive tests** for the command pattern implementation.

## Running Tests

### Browser-Based Testing (Recommended)

The tests require a browser environment because they test DOM manipulation and event listeners.

1. Start the development server:
   ```bash
   .\start.ps1
   ```

2. Open the test runner in your browser:
   ```
   http://localhost:8000/tests/test-runner.html
   ```

3. Click "Run All Tests" to execute both test suites.

### Test Runner Features

The HTML test runner provides:
- ✅ Colored output (pass/fail highlighting)
- 📊 Test summary with counts
- 🔘 Individual test suite execution
- 🧹 Clear output button
- 📜 Auto-scrolling output
- 🎨 Dark theme optimized for readability

### Node.js Testing (Limited)

Some tests can run in Node.js but DOM-dependent tests will fail:

```bash
wsl node tests/run-all-tests.mjs
```

**Note**: Tests for `GenerateEncounterCommand` and `GenerateNPCCommand` require a browser environment because they manipulate DOM elements.

## Test Coverage

### Context Awareness (12 tests)
- ✅ `window.currentPage` detection
- ✅ `getActiveHistory()` routing
- ✅ Context switching isolation
- ✅ `undoInContext()` per page
- ✅ `redoInContext()` per page  
- ✅ `canUndoInContext()` / `canRedoInContext()`
- ✅ Explicit context parameter
- ✅ Clear context operations
- ✅ History isolation
- ✅ Multiple page switches
- ✅ Undefined page handling
- ✅ Invalid page handling

### Command Pattern (18 tests)
- ✅ Basic construction and execution
- ✅ Undo/redo mechanics
- ✅ State management
- ✅ History limits (50 commands)
- ✅ Command chaining
- ✅ All command types
- ✅ Error handling
- ✅ Memory management
- ✅ Subscription system
- ✅ Security validation

## What's Tested

### State Capture
- Before/after state snapshots
- HTML content preservation
- Event listener restoration
- Deep cloning of complex objects

### Context Detection
- Automatic page detection via `window.currentPage`
- Fallback to 'generate' for undefined/invalid pages
- Switching between generate/npc/search contexts

### History Isolation
- Separate history stacks per page
- Undo in one context doesn't affect others
- Redo in one context doesn't affect others
- Clear context only affects target

### Integration
- Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Context helper functions
- Explicit vs implicit context
- Multiple rapid page switches

## Expected Results

**All 30 tests should pass** when run in a browser environment:
- 18 command pattern tests
- 12 context awareness tests

## Debugging Failed Tests

If tests fail:

1. **Check browser console** for detailed error messages
2. **Verify `window.currentPage` is set** in app.js switchPage()
3. **Check initialization** in app.js initApp() sets currentPage
4. **Test manually** by:
   - Generate an encounter → Undo (should work)
   - Switch to NPC page → Generate NPC → Undo (should work)
   - Switch back to Generate → Previous encounter should be in history

## Adding New Tests

To add tests for new context-aware features:

1. Add test function to `test-context-awareness.mjs`
2. Add to the `tests` array in `runContextAwarenessTests()`
3. Follow naming convention: `test[FeatureName]()`
4. Use assert helper for validation
5. Clean up with `clearContext('all')` and reset `window.currentPage`

Example:
```javascript
function testNewFeature() {
    console.log('🧪 Test: New Feature');
    
    clearContext('all');
    window.currentPage = 'generate';
    
    // Test code here
    assert(condition, 'Description');
    
    console.log('  ✅ PASS: New feature works correctly\n');
}
```
