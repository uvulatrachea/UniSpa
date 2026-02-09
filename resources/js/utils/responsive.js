/**
 * Centralized Responsive Utilities for Uni-Spa
 * Provides consistent breakpoints and responsive helpers across all pages
 */

// Breakpoint definitions (in pixels)
export const BREAKPOINTS = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

// Breakpoint keys in order
export const BREAKPOINT_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

// Media query helpers
export const mediaQueries = {
  xs: `@media (max-width: ${BREAKPOINTS.sm - 1}px)`,
  sm: `@media (min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xl: `@media (min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS.xxl - 1}px)`,
  xxl: `@media (min-width: ${BREAKPOINTS.xxl}px)`,
  
  // Mobile-first approach
  up: {
    sm: `@media (min-width: ${BREAKPOINTS.sm}px)`,
    md: `@media (min-width: ${BREAKPOINTS.md}px)`,
    lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
    xl: `@media (min-width: ${BREAKPOINTS.xl}px)`,
    xxl: `@media (min-width: ${BREAKPOINTS.xxl}px)`
  },
  
  down: {
    sm: `@media (max-width: ${BREAKPOINTS.sm - 1}px)`,
    md: `@media (max-width: ${BREAKPOINTS.md - 1}px)`,
    lg: `@media (max-width: ${BREAKPOINTS.lg - 1}px)`,
    xl: `@media (max-width: ${BREAKPOINTS.xl - 1}px)`,
    xxl: `@media (max-width: ${BREAKPOINTS.xxl - 1}px)`
  },
  
  only: {
    xs: `@media (max-width: ${BREAKPOINTS.sm - 1}px)`,
    sm: `@media (min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
    md: `@media (min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
    lg: `@media (min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
    xl: `@media (min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS.xxl - 1}px)`
  }
};

// Grid column helpers
export const gridColumns = {
  xs: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  xxl: 4
};

// Typography scale helpers
export const typographyScale = {
  xs: {
    title: '1.8rem',
    subtitle: '1rem',
    body: '0.9rem',
    small: '0.8rem'
  },
  sm: {
    title: '2rem',
    subtitle: '1.1rem',
    body: '0.95rem',
    small: '0.85rem'
  },
  md: {
    title: '2.2rem',
    subtitle: '1.2rem',
    body: '1rem',
    small: '0.9rem'
  },
  lg: {
    title: '2.5rem',
    subtitle: '1.3rem',
    body: '1.1rem',
    small: '0.95rem'
  },
  xl: {
    title: '2.8rem',
    subtitle: '1.4rem',
    body: '1.15rem',
    small: '1rem'
  },
  xxl: {
    title: '3rem',
    subtitle: '1.5rem',
    body: '1.2rem',
    small: '1.05rem'
  }
};

// Spacing scale helpers
export const spacingScale = {
  xs: {
    small: '10px',
    medium: '15px',
    large: '20px',
    xlarge: '25px'
  },
  sm: {
    small: '12px',
    medium: '18px',
    large: '24px',
    xlarge: '30px'
  },
  md: {
    small: '15px',
    medium: '22px',
    large: '30px',
    xlarge: '38px'
  },
  lg: {
    small: '18px',
    medium: '26px',
    large: '36px',
    xlarge: '46px'
  },
  xl: {
    small: '20px',
    medium: '30px',
    large: '42px',
    xlarge: '54px'
  },
  xxl: {
    small: '22px',
    medium: '34px',
    large: '48px',
    xlarge: '62px'
  }
};

// Card padding helpers
export const cardPadding = {
  xs: '20px',
  sm: '25px',
  md: '30px',
  lg: '35px',
  xl: '40px',
  xxl: '45px'
};

// Button sizing helpers
export const buttonSize = {
  xs: {
    padding: '8px 16px',
    fontSize: '0.8rem'
  },
  sm: {
    padding: '10px 20px',
    fontSize: '0.85rem'
  },
  md: {
    padding: '12px 24px',
    fontSize: '0.9rem'
  },
  lg: {
    padding: '14px 28px',
    fontSize: '0.95rem'
  },
  xl: {
    padding: '16px 32px',
    fontSize: '1rem'
  },
  xxl: {
    padding: '18px 36px',
    fontSize: '1.05rem'
  }
};

// Create responsive styles helper
export const createResponsiveStyles = (styles) => {
  const baseStyles = { ...styles.base };
  
  // Add responsive overrides
  Object.keys(styles).forEach(key => {
    if (key !== 'base' && mediaQueries.up[key]) {
      baseStyles[mediaQueries.up[key]] = styles[key];
    }
  });
  
  return baseStyles;
};

// Create grid styles helper
export const createGridStyles = (columns) => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns.xs || 1}, 1fr)`,
    gap: spacingScale.xs.medium,
    
    [mediaQueries.up.sm]: {
      gridTemplateColumns: `repeat(${columns.sm || columns.xs || 1}, 1fr)`,
      gap: spacingScale.sm.medium
    },
    
    [mediaQueries.up.md]: {
      gridTemplateColumns: `repeat(${columns.md || columns.sm || columns.xs || 1}, 1fr)`,
      gap: spacingScale.md.medium
    },
    
    [mediaQueries.up.lg]: {
      gridTemplateColumns: `repeat(${columns.lg || columns.md || columns.sm || columns.xs || 1}, 1fr)`,
      gap: spacingScale.lg.medium
    },
    
    [mediaQueries.up.xl]: {
      gridTemplateColumns: `repeat(${columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1}, 1fr)`,
      gap: spacingScale.xl.medium
    },
    
    [mediaQueries.up.xxl]: {
      gridTemplateColumns: `repeat(${columns.xxl || columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1}, 1fr)`,
      gap: spacingScale.xxl.medium
    }
  };
};

// Create typography styles helper
export const createTypographyStyles = (type = 'body') => {
  return {
    fontSize: typographyScale.xs[type],
    
    [mediaQueries.up.sm]: {
      fontSize: typographyScale.sm[type]
    },
    
    [mediaQueries.up.md]: {
      fontSize: typographyScale.md[type]
    },
    
    [mediaQueries.up.lg]: {
      fontSize: typographyScale.lg[type]
    },
    
    [mediaQueries.up.xl]: {
      fontSize: typographyScale.xl[type]
    },
    
    [mediaQueries.up.xxl]: {
      fontSize: typographyScale.xxl[type]
    }
  };
};

// Create card styles helper
export const createCardStyles = (options = {}) => {
  const {
    padding = true,
    shadow = true,
    border = true,
    hover = true
  } = options;
  
  const styles = {
    borderRadius: '16px',
    ...(padding && { padding: cardPadding.xs }),
    ...(shadow && { 
      boxShadow: '0 4px 12px rgba(93, 58, 127, 0.15)',
      border: '1px solid rgba(93, 58, 127, 0.1)'
    }),
    ...(hover && {
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(93, 58, 127, 0.25)'
      }
    }),
    
    [mediaQueries.up.sm]: {
      ...(padding && { padding: cardPadding.sm })
    },
    
    [mediaQueries.up.md]: {
      ...(padding && { padding: cardPadding.md })
    },
    
    [mediaQueries.up.lg]: {
      ...(padding && { padding: cardPadding.lg })
    },
    
    [mediaQueries.up.xl]: {
      ...(padding && { padding: cardPadding.xl })
    },
    
    [mediaQueries.up.xxl]: {
      ...(padding && { padding: cardPadding.xxl })
    }
  };
  
  return styles;
};

// Create button styles helper
export const createButtonStyles = (variant = 'primary', options = {}) => {
  const {
    responsive = true,
    hover = true
  } = options;
  
  const baseStyles = {
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...(responsive && { ...buttonSize.xs })
  };
  
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
      color: 'white',
      ...(hover && {
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(93, 58, 127, 0.4)'
        }
      })
    },
    secondary: {
      background: 'transparent',
      color: '#5d3a7f',
      border: '2px solid #5d3a7f',
      ...(hover && {
        '&:hover': {
          background: '#5d3a7f',
          color: 'white'
        }
      })
    },
    ghost: {
      background: 'transparent',
      color: '#374151',
      border: '1px solid #e5e7eb',
      ...(hover && {
        '&:hover': {
          background: '#f3f4f6',
          borderColor: '#d1d5db'
        }
      })
    }
  };
  
  const styles = {
    ...baseStyles,
    ...variants[variant]
  };
  
  if (responsive) {
    styles[mediaQueries.up.sm] = buttonSize.sm;
    styles[mediaQueries.up.md] = buttonSize.md;
    styles[mediaQueries.up.lg] = buttonSize.lg;
    styles[mediaQueries.up.xl] = buttonSize.xl;
    styles[mediaQueries.up.xxl] = buttonSize.xxl;
  }
  
  return styles;
};

// Utility to get current breakpoint
export const getCurrentBreakpoint = () => {
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS.xxl) return 'xl';
  return 'xxl';
};

// Utility to check if screen is mobile
export const isMobile = () => {
  return window.innerWidth < BREAKPOINTS.md;
};

// Utility to check if screen is tablet
export const isTablet = () => {
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
};

// Utility to check if screen is desktop
export const isDesktop = () => {
  return window.innerWidth >= BREAKPOINTS.lg;
};

// Export default theme for easy import
export const theme = {
  breakpoints: BREAKPOINTS,
  mediaQueries,
  gridColumns,
  typographyScale,
  spacingScale,
  cardPadding,
  buttonSize
};

export default theme;