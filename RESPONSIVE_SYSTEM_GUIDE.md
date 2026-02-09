# Uni-Spa Responsive System Guide

This guide explains how to use the new centralized responsive system for Uni-Spa pages.

## Overview

The responsive system provides consistent breakpoints, typography, spacing, and components across all pages. It replaces the previous manual approach with a unified, maintainable solution.

## Files Structure

### Core Files
- `resources/js/utils/responsive.js` - Main responsive utilities and breakpoints
- `resources/js/Components/ResponsiveCard.jsx` - Shared responsive components
- `resources/js/Layouts/ResponsiveLayout.jsx` - Responsive layout wrapper
- `tailwind.config.js` - Updated with custom breakpoints and utilities

### Updated Pages
- `resources/js/Pages/Dashboard.jsx` - Updated to use responsive components
- `resources/js/Pages/Services.jsx` - Ready for responsive updates
- `resources/js/Pages/AppointmentBooking.jsx` - Ready for responsive updates
- `resources/js/Pages/Profile.jsx` - Ready for responsive updates

## Breakpoints

The system uses these breakpoints (in pixels):

```javascript
BREAKPOINTS = {
  xs: 320,    // Extra small devices (phones)
  sm: 576,    // Small devices (larger phones)
  md: 768,    // Medium devices (tablets)
  lg: 992,    // Large devices (small desktops)
  xl: 1200,   // Extra large devices (desktops)
  xxl: 1400   // Extra extra large devices (large desktops)
}
```

## Using Responsive Components

### 1. Import Components

```javascript
import { 
  ResponsiveContainer, 
  ResponsiveTitle, 
  ResponsiveSubtitle, 
  ResponsiveText, 
  ResponsiveButton, 
  ResponsiveLinkButton, 
  ResponsiveGrid, 
  ResponsiveCard 
} from '../Components/ResponsiveCard';
```

### 2. Use Responsive Components

#### Container
```jsx
<ResponsiveContainer maxWidth="1200px" padding={true}>
  {/* Your content */}
</ResponsiveContainer>
```

#### Typography
```jsx
<ResponsiveTitle>Page Title</ResponsiveTitle>
<ResponsiveSubtitle>Page Subtitle</ResponsiveSubtitle>
<ResponsiveText variant="body">Body text</ResponsiveText>
<ResponsiveText variant="small">Small text</ResponsiveText>
```

#### Buttons
```jsx
<ResponsiveButton variant="primary">Primary Button</ResponsiveButton>
<ResponsiveButton variant="secondary">Secondary Button</ResponsiveButton>
<ResponsiveLinkButton href="/link" variant="primary">Link Button</ResponsiveLinkButton>
```

#### Grid
```jsx
<ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</ResponsiveGrid>
```

#### Cards
```jsx
<ResponsiveCard padding={true} shadow={true} hover={true}>
  {/* Card content */}
</ResponsiveCard>
```

## Using Responsive Utilities

### 1. Import Utilities

```javascript
import { 
  createGridStyles, 
  createTypographyStyles, 
  createButtonStyles, 
  mediaQueries 
} from '../utils/responsive';
```

### 2. Create Responsive Styles

#### Grid Styles
```javascript
const gridStyles = createGridStyles({
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 4,
  xxl: 4
});
```

#### Typography Styles
```javascript
const titleStyles = createTypographyStyles('title');
const bodyStyles = createTypographyStyles('body');
```

#### Button Styles
```javascript
const primaryButtonStyles = createButtonStyles('primary');
const secondaryButtonStyles = createButtonStyles('secondary');
```

### 3. Use Media Queries

```javascript
const styles = {
  base: {
    padding: '20px',
    fontSize: '1rem'
  },
  [mediaQueries.up.md]: {
    padding: '30px',
    fontSize: '1.1rem'
  },
  [mediaQueries.up.lg]: {
    padding: '40px',
    fontSize: '1.2rem'
  }
};
```

## Layout System

### Using ResponsiveLayout

```jsx
import ResponsiveLayout from '../Layouts/ResponsiveLayout';

function MyPage() {
  return (
    <ResponsiveLayout 
      title="Page Title"
      subtitle="Page Subtitle"
      maxWidth="1200px"
    >
      {/* Page content */}
    </ResponsiveLayout>
  );
}
```

## Migration Guide

### From Inline Styles to Responsive Components

**Before:**
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '20px'
}}>
```

**After:**
```jsx
<ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
```

### From Manual Media Queries to Responsive Utilities

**Before:**
```jsx
const styles = {
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  },
  '@media (min-width: 769px)': {
    gridTemplateColumns: 'repeat(2, 1fr)'
  }
};
```

**After:**
```jsx
const gridStyles = createGridStyles({
  xs: 1,
  md: 2,
  lg: 4
});
```

## Best Practices

### 1. Use Responsive Components First
Always prefer using the responsive components over custom styles when possible.

### 2. Consistent Breakpoints
Use the defined breakpoints consistently across all pages.

### 3. Mobile-First Approach
Design for mobile first, then enhance for larger screens.

### 4. Semantic Typography
Use the appropriate typography variant (title, subtitle, body, small) for semantic meaning.

### 5. Consistent Spacing
Use the spacing scale for consistent padding and margins.

## Customization

### Adding New Breakpoints
Edit `resources/js/utils/responsive.js`:

```javascript
export const BREAKPOINTS = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
  xxxl: 1600  // New breakpoint
};
```

### Adding New Typography Variants
Edit the `typographyScale` object in `responsive.js`:

```javascript
export const typographyScale = {
  xs: {
    title: '1.8rem',
    subtitle: '1rem',
    body: '0.9rem',
    small: '0.8rem',
    caption: '0.7rem'  // New variant
  },
  // ... other breakpoints
};
```

### Adding New Button Variants
Edit the `variants` object in `createButtonStyles`:

```javascript
const variants = {
  primary: { /* styles */ },
  secondary: { /* styles */ },
  ghost: { /* styles */ },
  danger: { /* styles */ }  // New variant
};
```

## Testing Responsiveness

### Browser Developer Tools
Use Chrome DevTools to test different screen sizes:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test common breakpoints: 320px, 768px, 1024px, 1200px

### Common Test Sizes
- **Mobile**: 320px, 375px, 414px
- **Tablet**: 768px, 834px, 1024px
- **Desktop**: 1200px, 1400px, 1920px

### Visual Testing
- Check for text overflow
- Verify touch targets are large enough (44px minimum)
- Ensure content is readable without zooming
- Test form inputs and buttons

## Performance Considerations

### CSS-in-JS Optimization
- Use memoization for complex style calculations
- Avoid creating styles in render loops
- Use `useMemo` for expensive style computations

### Image Optimization
- Use responsive images with `srcSet`
- Implement lazy loading for below-the-fold content
- Compress images appropriately

### Bundle Size
- Import only needed components
- Use tree-shaking to eliminate unused code
- Consider code splitting for large pages

## Troubleshooting

### Common Issues

**1. Styles Not Applying**
- Check import paths
- Verify component props
- Ensure responsive utilities are imported

**2. Layout Breaking**
- Check breakpoint values
- Verify grid column counts
- Test with browser dev tools

**3. Typography Inconsistency**
- Use semantic typography components
- Check typography scale values
- Verify font loading

### Debug Tips

**1. Console Logging**
```javascript
console.log('Current breakpoint:', getCurrentBreakpoint());
console.log('Is mobile:', isMobile());
```

**2. Visual Debugging**
Add temporary borders to see layout structure:
```css
.debug-grid {
  border: 1px solid red;
}
```

**3. Media Query Testing**
Test media queries in browser:
```javascript
window.matchMedia('(min-width: 768px)').matches
```

## Next Steps

1. **Update Remaining Pages**: Apply responsive system to Services, Appointment, and Profile pages
2. **Test Thoroughly**: Test on various devices and screen sizes
3. **Optimize Performance**: Review bundle size and loading times
4. **Document Changes**: Update team documentation
5. **Monitor Analytics**: Track user experience improvements

## Support

For questions or issues with the responsive system:
1. Check this documentation first
2. Review the source code in `resources/js/utils/responsive.js`
3. Test with browser developer tools
4. Create an issue with specific details and reproduction steps