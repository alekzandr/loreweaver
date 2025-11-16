# Mobile Optimization Documentation

## Overview
LoreWeaver is now fully optimized for mobile devices with responsive design, touch gestures, and progressive web app (PWA) capabilities. This document outlines all mobile features and how to use them.

## Features Implemented

### ✅ Phase 1: Core Mobile Infrastructure

#### Viewport Optimization
- **Maximum scale**: 5.0 (allows zoom but prevents excessive zooming)
- **User scalable**: Yes (accessibility compliance)
- **iOS-specific optimizations**: Full-screen web app mode
- **Theme color**: Matches app branding (#1a1a2e)

#### Touch-Action CSS
- Prevents double-tap zoom on buttons and interactive elements
- Optimized touch handling for better responsiveness
- iOS-specific font-size: 16px on inputs to prevent auto-zoom

### ✅ Phase 2: Mobile Navigation

#### Bottom Navigation Bar
On screens < 768px, the tab navigation automatically converts to a bottom navigation bar:
- **Fixed position**: Stays at bottom of screen
- **Safe area support**: Works with iPhone notches and home indicators
- **Visual indicators**: Active tab highlighted with blue accent
- **Icon-based**: Shows icons + labels for clarity

#### Swipe Gestures
- **Swipe left**: Navigate to next tab
- **Swipe right**: Navigate to previous tab
- **Visual feedback**: Animated arrow shows swipe direction
- **Velocity detection**: Only triggers on intentional swipes

### ✅ Phase 3: Touch Targets & Buttons

#### Minimum Touch Target Size
All interactive elements meet WCAG 2.1 guidelines:
- **Minimum size**: 44x44 pixels
- **Applies to**: Buttons, nav tabs, links, form controls
- **Full-width buttons**: On mobile, primary actions span full width

#### Touch Feedback
- **Ripple effects**: Visual feedback on tap
- **Scale animation**: Buttons scale down slightly when pressed
- **Haptic feedback**: Uses device vibration when available

### ✅ Phase 4: Responsive Panels

#### Side Panels → Full-Screen Modals
On mobile devices, side panels transform into full-screen modals:
- **Location Detail Panel**: Full screen with close button
- **NPC Detail Panel**: Full screen with close button
- **Smooth transitions**: Slide in from right

#### Flow Navigator → Bottom Sheet
The flow navigator becomes a bottom sheet on mobile:
- **Swipe up**: Open navigation
- **Swipe down**: Close navigation
- **40% viewport height**: Doesn't cover entire screen
- **Floating button**: Quick access to open/close

### ✅ Phase 5: Forms & Inputs

#### Mobile-Friendly Forms
- **Full-width inputs**: All form controls span container width
- **Larger touch targets**: Easy to tap and interact with
- **16px font size**: Prevents iOS zoom on focus
- **Custom number inputs**: +/- buttons for easier adjustment
- **Better keyboard support**: Appropriate input types for mobile keyboards

#### Select Dropdowns
- **Enhanced styling**: Custom arrow, larger touch area
- **Full-width**: Easy to see options
- **Mobile-optimized**: Works well on all devices

### ✅ Phase 6: Search & Results

#### Search Interface
- **Full-width search bar**: Easy to type on mobile
- **Filter chips**: Tag-style filters instead of dropdowns
- **Vertical layout**: Filters stack vertically

#### Search Results
- **Card layout**: Each result in its own card
- **Vertical stacking**: One column on mobile
- **Touch-friendly**: Large tap areas for each result
- **Two columns on tablet**: Optimized for tablet screens

### ✅ Phase 7: PWA Setup

#### Web App Manifest
- **Installable**: Can be installed to home screen
- **Standalone mode**: Runs like a native app
- **App shortcuts**: Quick actions from home screen
- **Theme colors**: Matches app branding

#### Offline Support (Planned)
- Service worker implementation planned for future release
- Will enable offline encounter viewing
- Cache important assets for fast loading

### ✅ Phase 8: Testing

#### Comprehensive Test Suite
44 automated tests covering:
- Viewport configuration
- Mobile CSS features
- Touch gestures
- JavaScript functionality
- Touch target sizes
- Responsive layouts
- Performance optimizations
- Integration testing

## Browser Support

### Mobile Browsers
- ✅ iOS Safari 12+
- ✅ Chrome for Android 90+
- ✅ Samsung Internet 12+
- ✅ Firefox Mobile 90+
- ✅ Edge Mobile 90+

### Tablet Browsers
- ✅ iPad Safari
- ✅ Android Chrome on tablets
- ✅ Samsung tablets

### Desktop Browsers (Responsive)
- ✅ Chrome 90+
- ✅ Firefox 90+
- ✅ Safari 14+
- ✅ Edge 90+

## Breakpoints

```css
Mobile Small:   320px   (iPhone SE, small phones)
Mobile:         375px   (iPhone 12, standard phones)
Mobile Large:   425px   (iPhone 12 Pro Max, large phones)
Tablet:         768px   (iPad, tablets)
Desktop:        1024px  (Laptops, desktops)
Desktop Large:  1440px  (Large screens)
```

## Usage Examples

### Testing on Real Devices

#### iOS
1. Open Safari on iPhone/iPad
2. Navigate to LoreWeaver URL
3. Tap Share button
4. Select "Add to Home Screen"
5. App will open in standalone mode

#### Android
1. Open Chrome on Android
2. Navigate to LoreWeaver URL
3. Tap menu (⋮)
4. Select "Add to Home screen"
5. App will open in standalone mode

### Testing Gestures
- **Swipe left/right** between tabs
- **Long press** on items (future: context menus)
- **Tap** for standard interactions
- **Pinch to zoom** on flow diagrams (planned)

### Testing Responsive Design
Use browser DevTools:
1. Open DevTools (F12)
2. Click device toolbar icon
3. Select different devices
4. Test portrait and landscape
5. Verify touch targets and layouts

## Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90
- **Core Web Vitals**: All passing

### Optimizations Applied
- ✅ Touch-action CSS reduces delay
- ✅ Webkit overflow scrolling for smooth iOS scrolling
- ✅ Tap highlight removed for cleaner interactions
- ✅ Text size adjust prevented for consistent sizing
- ✅ Reduced motion support for accessibility

## Accessibility

### WCAG 2.1 Compliance
- ✅ Minimum 44x44px touch targets (Level AA)
- ✅ User-scalable viewport (Level AA)
- ✅ Reduced motion support (Level AAA)
- ✅ Keyboard navigation maintained
- ✅ Screen reader compatibility

### Accessibility Features
- High contrast text
- Clear focus indicators
- Semantic HTML
- ARIA labels where needed
- Alt text on images

## Known Limitations

1. **Service Worker**: Not yet implemented (offline support coming)
2. **Native Share API**: Only works on HTTPS
3. **Haptic Feedback**: Only on devices with vibration support
4. **Camera API**: Not yet integrated
5. **Voice Input**: Not yet implemented

## Future Enhancements

### Planned Features
- [ ] Offline mode with service worker
- [ ] Pull-to-refresh on search results
- [ ] Native share integration
- [ ] Camera for custom images
- [ ] Voice input for search
- [ ] Push notifications for reminders
- [ ] More advanced gestures
- [ ] Pinch-to-zoom on flow diagrams
- [ ] Better tablet layouts
- [ ] Split-view on large tablets

## Troubleshooting

### Common Issues

#### "Buttons are hard to tap"
- Ensure you're on the latest version
- Check that mobile.css is loading
- Verify viewport meta tag is present

#### "Swipe gestures not working"
- Ensure mobile.js is loading
- Check browser console for errors
- Verify touch events are supported

#### "Bottom navigation not showing"
- Check screen width (< 768px required)
- Verify mobile.css is loading
- Clear browser cache

#### "App not installable"
- Ensure manifest.json is loading
- Must be served over HTTPS
- Check browser compatibility

### Debug Mode

To enable debug logging:
```javascript
// In browser console
window.DEBUG_MOBILE = true;
```

## File Structure

```
loreweaver/
├── assets/
│   ├── css/
│   │   └── mobile.css          (19.5 KB - Mobile styles)
│   └── js/
│       └── mobile.js            (11.0 KB - Touch gestures)
├── tests/
│   └── test-mobile-responsive.js (44 tests)
├── manifest.json                 (PWA manifest)
└── index.html                    (Mobile meta tags)
```

## Testing Commands

```bash
# Run all tests
npm test

# Run only mobile tests
npm run test:mobile

# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Performance Tips

### For Developers
1. Use mobile-first CSS approach
2. Minimize reflows and repaints
3. Use CSS transforms instead of position
4. Lazy load images where possible
5. Test on real devices, not just emulators

### For Users
1. Install as PWA for better performance
2. Clear browser cache if issues occur
3. Use WiFi for initial load
4. Enable hardware acceleration in browser
5. Update to latest browser version

## Credits

Mobile optimization implemented following:
- Apple Human Interface Guidelines
- Material Design Guidelines
- WCAG 2.1 Standards
- Progressive Web App standards
- Touch gesture best practices

## Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Open an issue on GitHub
4. Check browser console for errors

---

**Last Updated**: November 16, 2025
**Version**: 1.0.0
**Mobile Optimization Status**: ✅ Complete
