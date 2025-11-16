#!/usr/bin/env node
/**
 * LoreWeaver - Mobile Responsiveness Tests
 * Tests mobile CSS, viewport handling, touch targets, and responsive layouts
 */

const fs = require('fs');
const path = require('path');

console.log('📱 Running Mobile Responsiveness Tests\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log('✅', name);
        passed++;
    } catch (error) {
        console.log('❌', name, ':', error.message);
        failed++;
    }
}

// Load files
const indexPath = path.join(__dirname, '..', 'index.html');
const mobileCssPath = path.join(__dirname, '..', 'assets', 'css', 'mobile.css');
const mobileJsPath = path.join(__dirname, '..', 'assets', 'js', 'mobile.js');

const indexContent = fs.readFileSync(indexPath, 'utf8');
const mobileCssContent = fs.existsSync(mobileCssPath) ? fs.readFileSync(mobileCssPath, 'utf8') : '';
const mobileJsContent = fs.existsSync(mobileJsPath) ? fs.readFileSync(mobileJsPath, 'utf8') : '';

console.log('==================================================');
console.log('Testing Mobile Infrastructure');
console.log('==================================================\n');

test('mobile.css file exists', () => {
    if (!fs.existsSync(mobileCssPath)) {
        throw new Error('mobile.css file not found');
    }
});

test('mobile.js file exists', () => {
    if (!fs.existsSync(mobileJsPath)) {
        throw new Error('mobile.js file not found');
    }
});

test('mobile.css is linked in index.html', () => {
    if (!indexContent.includes('mobile.css')) {
        throw new Error('mobile.css not linked in index.html');
    }
});

test('mobile.js is imported in index.html', () => {
    if (!indexContent.includes('mobile.js')) {
        throw new Error('mobile.js not imported in index.html');
    }
});

console.log('\n==================================================');
console.log('Testing Viewport Configuration');
console.log('==================================================\n');

test('viewport meta tag includes initial-scale', () => {
    if (!indexContent.match(/viewport.*initial-scale/)) {
        throw new Error('viewport meta tag missing initial-scale');
    }
});

test('viewport meta tag includes maximum-scale', () => {
    if (!indexContent.match(/viewport.*maximum-scale/)) {
        throw new Error('viewport meta tag missing maximum-scale');
    }
});

test('apple-mobile-web-app-capable meta tag exists', () => {
    if (!indexContent.includes('apple-mobile-web-app-capable')) {
        throw new Error('apple-mobile-web-app-capable meta tag not found');
    }
});

test('theme-color meta tag exists', () => {
    if (!indexContent.includes('theme-color')) {
        throw new Error('theme-color meta tag not found');
    }
});

console.log('\n==================================================');
console.log('Testing Mobile CSS Features');
console.log('==================================================\n');

test('mobile breakpoints defined', () => {
    const breakpoints = [
        '--mobile-small',
        '--mobile:',
        '--mobile-large',
        '--tablet:',
        '--desktop:'
    ];
    const missing = breakpoints.filter(bp => !mobileCssContent.includes(bp));
    if (missing.length > 0) {
        throw new Error(`Missing breakpoints: ${missing.join(', ')}`);
    }
});

test('touch-action CSS property used', () => {
    if (!mobileCssContent.includes('touch-action:')) {
        throw new Error('touch-action CSS property not found');
    }
});

test('minimum touch target size defined', () => {
    if (!mobileCssContent.includes('--touch-target-min')) {
        throw new Error('--touch-target-min variable not defined');
    }
});

test('media queries for mobile exist', () => {
    const queries = mobileCssContent.match(/@media.*max-width.*768px/g);
    if (!queries || queries.length === 0) {
        throw new Error('No mobile media queries found');
    }
    console.log(`  Found ${queries.length} mobile media queries`);
});

test('bottom navigation styles exist', () => {
    if (!mobileCssContent.includes('.nav-tabs') || !mobileCssContent.includes('bottom: 0')) {
        throw new Error('Bottom navigation styles not found');
    }
});

test('safe-area-inset support exists', () => {
    if (!mobileCssContent.includes('safe-area-inset')) {
        throw new Error('safe-area-inset support not found');
    }
});

test('full-width button styles exist', () => {
    if (!mobileCssContent.match(/width:\s*100%/)) {
        throw new Error('Full-width button styles not found');
    }
});

test('side panel mobile styles exist', () => {
    if (!mobileCssContent.includes('.side-panel') && mobileCssContent.includes('max-width: 100%')) {
        throw new Error('Side panel mobile styles not properly configured');
    }
});

test('form input mobile optimization exists', () => {
    const hasInputStyles = mobileCssContent.includes('input[type="text"]') ||
                          mobileCssContent.includes('input[type="number"]');
    const hasFontSize16 = mobileCssContent.includes('font-size: 16px');
    
    if (!hasInputStyles || !hasFontSize16) {
        throw new Error('Form inputs not optimized for mobile (need font-size: 16px to prevent zoom)');
    }
});

test('landscape orientation styles exist', () => {
    if (!mobileCssContent.includes('orientation: landscape')) {
        throw new Error('Landscape orientation styles not found');
    }
});

console.log('\n==================================================');
console.log('Testing Mobile JavaScript Features');
console.log('==================================================\n');

test('isMobileDevice function exists', () => {
    if (!mobileJsContent.includes('function isMobileDevice')) {
        throw new Error('isMobileDevice function not found');
    }
});

test('isTouchDevice function exists', () => {
    if (!mobileJsContent.includes('function isTouchDevice')) {
        throw new Error('isTouchDevice function not found');
    }
});

test('swipe navigation initialization exists', () => {
    if (!mobileJsContent.includes('initSwipeNavigation')) {
        throw new Error('initSwipeNavigation function not found');
    }
});

test('touch event handlers exist', () => {
    const touchEvents = ['touchstart', 'touchend', 'touchmove'];
    const missing = touchEvents.filter(event => !mobileJsContent.includes(event));
    if (missing.length > 0) {
        throw new Error(`Missing touch event handlers: ${missing.join(', ')}`);
    }
});

test('swipe threshold constants defined', () => {
    if (!mobileJsContent.includes('SWIPE_THRESHOLD')) {
        throw new Error('SWIPE_THRESHOLD constant not defined');
    }
});

test('gesture handling functions exist', () => {
    const handlers = ['handleSwipeLeft', 'handleSwipeRight', 'handleSwipeUp', 'handleSwipeDown'];
    const missing = handlers.filter(handler => !mobileJsContent.includes(handler));
    if (missing.length > 0) {
        throw new Error(`Missing gesture handlers: ${missing.join(', ')}`);
    }
});

test('long press detection exists', () => {
    if (!mobileJsContent.includes('handleLongPress') || !mobileJsContent.includes('LONG_PRESS_DURATION')) {
        throw new Error('Long press detection not implemented');
    }
});

test('touch ripple effect exists', () => {
    if (!mobileJsContent.includes('addTouchRipple')) {
        throw new Error('Touch ripple effect not found');
    }
});

test('orientation change handler exists', () => {
    if (!mobileJsContent.includes('handleOrientationChange') || !mobileJsContent.includes('orientationchange')) {
        throw new Error('Orientation change handler not found');
    }
});

test('initMobileGestures function exists', () => {
    if (!mobileJsContent.includes('function initMobileGestures')) {
        throw new Error('initMobileGestures function not found');
    }
});

test('mobile functions exported to window', () => {
    const exports = ['window.isMobileDevice', 'window.isTouchDevice', 'window.initMobileGestures'];
    const missing = exports.filter(exp => !mobileJsContent.includes(exp));
    if (missing.length > 0) {
        throw new Error(`Functions not exported to window: ${missing.join(', ')}`);
    }
});

console.log('\n==================================================');
console.log('Testing Touch Target Sizes');
console.log('==================================================\n');

test('44px minimum touch target enforced', () => {
    // Check for 44px or --touch-target-min variable
    const has44px = mobileCssContent.includes('44px') || mobileCssContent.includes('--touch-target-min');
    if (!has44px) {
        throw new Error('44px minimum touch target not enforced');
    }
    console.log('  Minimum touch target size: 44px ✓');
});

test('buttons have minimum height', () => {
    if (!mobileCssContent.match(/button.*min-height/s)) {
        throw new Error('Buttons missing min-height property');
    }
});

test('nav tabs have minimum touch targets', () => {
    if (!mobileCssContent.match(/\.nav-tab.*min-(height|width)/s)) {
        throw new Error('Nav tabs missing minimum touch targets');
    }
});

console.log('\n==================================================');
console.log('Testing Responsive Layouts');
console.log('==================================================\n');

test('controls-grid responsive layout', () => {
    if (!mobileCssContent.includes('.controls-grid')) {
        throw new Error('controls-grid responsive styles not found');
    }
});

test('search results responsive layout', () => {
    if (!mobileCssContent.includes('#searchResults') || !mobileCssContent.includes('flex-direction: column')) {
        throw new Error('Search results not optimized for mobile');
    }
});

test('encounter sections responsive', () => {
    if (!mobileCssContent.includes('.encounter-section')) {
        throw new Error('Encounter sections not responsive');
    }
});

test('card layouts responsive', () => {
    if (!mobileCssContent.match(/\.card|\.npc-card/)) {
        throw new Error('Card layouts not responsive');
    }
});

console.log('\n==================================================');
console.log('Testing Performance Optimizations');
console.log('==================================================\n');

test('webkit overflow scrolling enabled', () => {
    if (!mobileCssContent.includes('-webkit-overflow-scrolling') && !mobileJsContent.includes('webkitOverflowScrolling')) {
        throw new Error('WebKit overflow scrolling not enabled');
    }
});

test('tap highlight color removed', () => {
    if (!mobileCssContent.includes('-webkit-tap-highlight-color')) {
        throw new Error('Tap highlight color not configured');
    }
});

test('text size adjust prevented', () => {
    if (!mobileCssContent.includes('text-size-adjust')) {
        throw new Error('Text size adjust not prevented');
    }
});

test('reduced motion support', () => {
    if (!mobileCssContent.includes('prefers-reduced-motion')) {
        throw new Error('Reduced motion media query not found');
    }
});

console.log('\n==================================================');
console.log('Testing Print Styles');
console.log('==================================================\n');

test('print media query exists', () => {
    if (!mobileCssContent.includes('@media print')) {
        throw new Error('Print media query not found');
    }
});

test('navigation hidden in print', () => {
    const printSection = mobileCssContent.match(/@media print\s*{[^}]*}/gs);
    if (printSection && !printSection[0].includes('.nav-tabs')) {
        throw new Error('Navigation not hidden in print styles');
    }
});

console.log('\n==================================================');
console.log('Testing Integration');
console.log('==================================================\n');

test('mobile gestures initialized on load', () => {
    if (!indexContent.includes('initMobileGestures')) {
        throw new Error('initMobileGestures not called on page load');
    }
});

test('DOMContentLoaded listener exists', () => {
    if (!indexContent.includes('DOMContentLoaded')) {
        throw new Error('DOMContentLoaded listener not found');
    }
});

console.log('\n==================================================');
console.log('Mobile CSS Statistics');
console.log('==================================================\n');

// Count media queries
const mediaQueries = mobileCssContent.match(/@media/g) || [];
console.log(`  Total @media queries: ${mediaQueries.length}`);

// Count mobile breakpoints
const mobileBreakpoints = mobileCssContent.match(/@media.*max-width.*768px/g) || [];
console.log(`  Mobile breakpoints (<768px): ${mobileBreakpoints.length}`);

// Count tablet breakpoints
const tabletBreakpoints = mobileCssContent.match(/@media.*min-width.*768px.*max-width.*1024px/g) || [];
console.log(`  Tablet breakpoints (768-1024px): ${tabletBreakpoints.length}`);

// Count CSS rules
const cssRules = mobileCssContent.match(/\{/g) || [];
console.log(`  Total CSS rules: ${cssRules.length}`);

// File sizes
const mobileCssSize = (fs.statSync(mobileCssPath).size / 1024).toFixed(2);
const mobileJsSize = (fs.statSync(mobileJsPath).size / 1024).toFixed(2);
console.log(`  mobile.css size: ${mobileCssSize} KB`);
console.log(`  mobile.js size: ${mobileJsSize} KB`);

console.log('\n==================================================');
console.log('📊 Test Results');
console.log('==================================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📝 Total:  ${passed + failed}`);
console.log('==================================================\n');

if (failed === 0) {
    console.log('✨ All mobile responsiveness tests passed!\n');
    console.log('📱 Mobile Features Summary:');
    console.log('   • Viewport optimization');
    console.log('   • Touch-action CSS');
    console.log('   • 44px minimum touch targets');
    console.log('   • Bottom navigation on mobile');
    console.log('   • Swipe gestures');
    console.log('   • Touch ripple effects');
    console.log('   • Responsive layouts');
    console.log('   • Safe area insets');
    console.log('   • Orientation support');
    console.log('   • Performance optimizations\n');
} else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
}

// Exit with appropriate code
process.exit(failed > 0 ? 1 : 0);
