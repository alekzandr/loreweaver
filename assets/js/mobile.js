// LoreWeaver - Mobile Gestures & Touch Module
// Handles touch gestures, swipes, and mobile-specific interactions

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchStartTime = 0;

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for swipe
const TAP_MAX_DISTANCE = 10; // Maximum movement for tap
const LONG_PRESS_DURATION = 500; // Duration for long press

/**
 * Check if device is mobile
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice() {
    return ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0);
}

/**
 * Initialize swipe gestures for tab navigation
 */
export function initSwipeNavigation() {
    if (!isTouchDevice()) return;
    
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    let longPressTimer = null;
    
    mainContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
        
        // Start long press timer
        longPressTimer = setTimeout(() => {
            handleLongPress();
        }, LONG_PRESS_DURATION);
    }, { passive: true });
    
    mainContent.addEventListener('touchmove', () => {
        // Cancel long press if moved
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }, { passive: true });
    
    mainContent.addEventListener('touchend', (e) => {
        // Cancel long press
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const touchDuration = Date.now() - touchStartTime;
        
        handleGesture(touchDuration);
    }, { passive: true });
    
    mainContent.addEventListener('touchcancel', () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }, { passive: true });
}

/**
 * Handle detected gesture
 */
function handleGesture(duration) {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const velocity = absDeltaX / duration;
    
    // Check if it's a tap (minimal movement)
    if (absDeltaX < TAP_MAX_DISTANCE && absDeltaY < TAP_MAX_DISTANCE) {
        return; // Let normal click handlers take care of it
    }
    
    // Check if horizontal swipe is dominant
    if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_THRESHOLD) {
        if (deltaX > 0) {
            handleSwipeRight();
        } else {
            handleSwipeLeft();
        }
    }
    
    // Check for vertical swipes (for future pull-to-refresh, etc.)
    if (absDeltaY > absDeltaX && absDeltaY > SWIPE_THRESHOLD) {
        if (deltaY > 0) {
            handleSwipeDown();
        } else {
            handleSwipeUp();
        }
    }
}

/**
 * Handle swipe left (next tab)
 */
function handleSwipeLeft() {
    const pages = ['generate', 'npc', 'search', 'settings'];
    const currentPage = getCurrentPage();
    const currentIndex = pages.indexOf(currentPage);
    
    if (currentIndex < pages.length - 1) {
        const nextPage = pages[currentIndex + 1];
        if (window.switchPage) {
            window.switchPage(nextPage);
            addSwipeFeedback('left');
        }
    }
}

/**
 * Handle swipe right (previous tab)
 */
function handleSwipeRight() {
    const pages = ['generate', 'npc', 'search', 'settings'];
    const currentPage = getCurrentPage();
    const currentIndex = pages.indexOf(currentPage);
    
    if (currentIndex > 0) {
        const prevPage = pages[currentIndex - 1];
        if (window.switchPage) {
            window.switchPage(prevPage);
            addSwipeFeedback('right');
        }
    }
}

/**
 * Handle swipe down
 */
function handleSwipeDown() {
    // Could be used for pull-to-refresh in the future
    console.log('Swipe down detected');
}

/**
 * Handle swipe up
 */
function handleSwipeUp() {
    // Could close panels or show more info
    console.log('Swipe up detected');
}

/**
 * Handle long press
 */
function handleLongPress() {
    console.log('Long press detected');
    // Could show context menu or additional options
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/**
 * Get current active page
 */
function getCurrentPage() {
    const pages = ['generatePage', 'npcPage', 'searchPage', 'settingsPage'];
    const pageNames = ['generate', 'npc', 'search', 'settings'];
    
    for (let i = 0; i < pages.length; i++) {
        const pageElement = document.getElementById(pages[i]);
        if (pageElement && pageElement.style.display !== 'none') {
            return pageNames[i];
        }
    }
    
    return 'generate'; // Default
}

/**
 * Add visual feedback for swipe
 */
function addSwipeFeedback(direction) {
    const feedback = document.createElement('div');
    feedback.className = 'swipe-feedback';
    feedback.textContent = direction === 'left' ? '→' : '←';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        ${direction === 'left' ? 'right: 20px' : 'left: 20px'};
        transform: translateY(-50%);
        font-size: 3rem;
        color: var(--accent-blue);
        opacity: 0;
        animation: swipeFeedback 0.4s ease-out;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 400);
}

/**
 * Add swipe feedback animation to document
 */
function addSwipeFeedbackStyles() {
    if (document.getElementById('swipe-feedback-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'swipe-feedback-styles';
    style.textContent = `
        @keyframes swipeFeedback {
            0% {
                opacity: 0;
                transform: translateY(-50%) scale(0.5);
            }
            50% {
                opacity: 1;
                transform: translateY(-50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50%) scale(0.5);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize double-tap-to-zoom prevention on buttons
 */
export function preventDoubleTapZoom() {
    const elements = document.querySelectorAll('button, .btn, a, .nav-tab');
    
    elements.forEach(element => {
        element.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.click();
        });
    });
}

/**
 * Add touch ripple effect to elements
 */
export function addTouchRipple(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        top: ${y}px;
        left: ${x}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

/**
 * Add ripple animation styles
 */
function addRippleStyles() {
    if (document.getElementById('ripple-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize touch ripples for buttons
 */
export function initTouchRipples() {
    if (!isTouchDevice()) return;
    
    addRippleStyles();
    
    document.addEventListener('touchstart', (e) => {
        const target = e.target.closest('button, .btn, .nav-tab');
        if (target && !target.classList.contains('no-ripple')) {
            addTouchRipple(target, e.touches[0]);
        }
    }, { passive: true });
}

/**
 * Handle orientation change
 */
export function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        // Wait for orientation change to complete
        setTimeout(() => {
            // Recalculate layouts if needed
            if (window.populateFlowNavigator && window.currentEncounterFlow) {
                window.populateFlowNavigator(window.currentEncounterFlow);
            }
            
            // Close any open panels that might not fit well
            if (window.innerWidth < window.innerHeight) {
                // Portrait mode
                console.log('Switched to portrait mode');
            } else {
                // Landscape mode
                console.log('Switched to landscape mode');
            }
        }, 100);
    });
}

/**
 * Optimize scroll performance
 */
export function optimizeScrolling() {
    // Add momentum scrolling for iOS
    const scrollableElements = document.querySelectorAll('.side-panel, .modal, #flowNavigator');
    scrollableElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
    });
}

/**
 * Initialize all mobile gestures and touch features
 */
export function initMobileGestures() {
    if (!isMobileDevice() && !isTouchDevice()) {
        console.log('Not a mobile/touch device, skipping mobile gestures');
        return;
    }
    
    console.log('Initializing mobile gestures...');
    
    addSwipeFeedbackStyles();
    addRippleStyles();
    initSwipeNavigation();
    initTouchRipples();
    handleOrientationChange();
    optimizeScrolling();
    
    // Add mobile class to body
    document.body.classList.add('is-mobile');
    if (isTouchDevice()) {
        document.body.classList.add('is-touch');
    }
    
    console.log('Mobile gestures initialized');
}

// Export to window for inline scripts
window.isMobileDevice = isMobileDevice;
window.isTouchDevice = isTouchDevice;
window.initMobileGestures = initMobileGestures;
