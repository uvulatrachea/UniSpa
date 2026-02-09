import React from 'react';
import { createCardStyles, createTypographyStyles, createButtonStyles, mediaQueries } from '../utils/responsive';

/**
 * Responsive Card Component
 * A reusable card component with consistent responsive styling
 */
const ResponsiveCard = ({ 
  children, 
  variant = 'default', 
  padding = true, 
  shadow = true, 
  border = true, 
  hover = true,
  style = {},
  className = '',
  ...props 
}) => {
  const cardStyles = {
    ...createCardStyles({ padding, shadow, border, hover }),
    ...style
  };

  return (
    <div 
      style={cardStyles}
      className={`responsive-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Title Component
 */
export const ResponsiveTitle = ({ children, variant = 'title', style = {}, className = '', ...props }) => {
  const titleStyles = {
    ...createTypographyStyles(variant),
    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
    fontWeight: '800',
    color: '#2d3748',
    margin: 0,
    ...style
  };

  return (
    <h1 
      style={titleStyles}
      className={`responsive-title ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
};

/**
 * Responsive Subtitle Component
 */
export const ResponsiveSubtitle = ({ children, style = {}, className = '', ...props }) => {
  const subtitleStyles = {
    ...createTypographyStyles('subtitle'),
    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
    color: '#718096',
    margin: 0,
    fontWeight: '500',
    ...style
  };

  return (
    <h2 
      style={subtitleStyles}
      className={`responsive-subtitle ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

/**
 * Responsive Text Component
 */
export const ResponsiveText = ({ children, variant = 'body', style = {}, className = '', ...props }) => {
  const textStyles = {
    ...createTypographyStyles(variant),
    lineHeight: 1.6,
    color: '#4a5568',
    ...style
  };

  return (
    <p 
      style={textStyles}
      className={`responsive-text ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * Responsive Button Component
 */
export const ResponsiveButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  responsive = true, 
  hover = true,
  style = {},
  className = '',
  ...props 
}) => {
  const buttonStyles = {
    ...createButtonStyles(variant, { responsive, hover }),
    ...style
  };

  return (
    <button 
      style={buttonStyles}
      className={`responsive-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Responsive Link Button Component
 */
export const ResponsiveLinkButton = ({ 
  children, 
  variant = 'primary', 
  href = '#',
  responsive = true, 
  hover = true,
  style = {},
  className = '',
  ...props 
}) => {
  const buttonStyles = {
    ...createButtonStyles(variant, { responsive, hover }),
    textDecoration: 'none',
    ...style
  };

  return (
    <a 
      href={href}
      style={buttonStyles}
      className={`responsive-link-button ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

/**
 * Responsive Grid Component
 */
export const ResponsiveGrid = ({ 
  children, 
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4, xxl: 4 },
  gap = 'medium',
  style = {},
  className = '',
  ...props 
}) => {
  const gridStyles = {
    ...createGridStyles(columns),
    ...style
  };

  return (
    <div 
      style={gridStyles}
      className={`responsive-grid ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Responsive Container Component
 */
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = '1400px',
  padding = true,
  style = {},
  className = '',
  ...props 
}) => {
  const containerStyles = {
    maxWidth: maxWidth,
    margin: '0 auto',
    ...(padding && {
      padding: '20px',
      [mediaQueries.up.sm]: { padding: '25px' },
      [mediaQueries.up.md]: { padding: '30px' },
      [mediaQueries.up.lg]: { padding: '40px' },
      [mediaQueries.up.xl]: { padding: '50px' },
      [mediaQueries.up.xxl]: { padding: '60px' }
    }),
    ...style
  };

  return (
    <div 
      style={containerStyles}
      className={`responsive-container ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { ResponsiveCard };
export default ResponsiveCard;
