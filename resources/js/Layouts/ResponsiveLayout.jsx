import React from 'react';
import { ResponsiveContainer, ResponsiveTitle, ResponsiveSubtitle } from '../Components/ResponsiveCard';
import { mediaQueries } from '../utils/responsive';

/**
 * Responsive Layout Component
 * Provides consistent responsive layout structure across all pages
 */
const ResponsiveLayout = ({ 
  children, 
  title, 
  subtitle, 
  maxWidth = '1400px',
  showHeader = true,
  className = '',
  style = {},
  ...props 
}) => {
  const layoutStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    ...style
  };

  const headerStyles = {
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
    [mediaQueries.up.sm]: { padding: '25px' },
    [mediaQueries.up.md]: { padding: '30px' },
    [mediaQueries.up.lg]: { padding: '40px' },
    [mediaQueries.up.xl]: { padding: '50px' },
    [mediaQueries.up.xxl]: { padding: '60px' }
  };

  const contentStyles = {
    flex: 1,
    padding: '20px',
    [mediaQueries.up.sm]: { padding: '25px' },
    [mediaQueries.up.md]: { padding: '30px' },
    [mediaQueries.up.lg]: { padding: '40px' },
    [mediaQueries.up.xl]: { padding: '50px' },
    [mediaQueries.up.xxl]: { padding: '60px' }
  };

  return (
    <div style={layoutStyles} className={`responsive-layout ${className}`} {...props}>
      {showHeader && (
        <header style={headerStyles}>
          {title && (
            <ResponsiveTitle style={{ margin: 0 }}>
              {title}
            </ResponsiveTitle>
          )}
          {subtitle && (
            <ResponsiveSubtitle style={{ margin: '10px 0 0 0' }}>
              {subtitle}
            </ResponsiveSubtitle>
          )}
        </header>
      )}
      
      <main style={contentStyles}>
        <ResponsiveContainer maxWidth={maxWidth}>
          {children}
        </ResponsiveContainer>
      </main>
      
      <footer style={{
        background: '#2d3748',
        color: '#cbd5e0',
        padding: '20px',
        textAlign: 'center',
        marginTop: 'auto',
        [mediaQueries.up.sm]: { padding: '25px' },
        [mediaQueries.up.md]: { padding: '30px' },
        [mediaQueries.up.lg]: { padding: '40px' },
        [mediaQueries.up.xl]: { padding: '50px' },
        [mediaQueries.up.xxl]: { padding: '60px' }
      }}>
        <ResponsiveContainer>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} UNISPA Masmed UiTM Shah Alam. All rights reserved.
          </p>
        </ResponsiveContainer>
      </footer>
    </div>
  );
};

export default ResponsiveLayout;