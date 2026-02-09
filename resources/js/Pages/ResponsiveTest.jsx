import React from 'react';
import { 
  ResponsiveContainer, 
  ResponsiveTitle, 
  ResponsiveSubtitle, 
  ResponsiveText, 
  ResponsiveButton, 
  ResponsiveLinkButton, 
  ResponsiveGrid, 
  ResponsiveCard 
} from '@/Components/ResponsiveCard';
import { createGridStyles, createTypographyStyles, createButtonStyles, mediaQueries } from '../utils/responsive';

/**
 * Responsive Test Page
 * Demonstrates the responsive system capabilities
 */
const ResponsiveTest = () => {
  return (
    <div style={styles.body}>
      {/* Header */}
      <header style={styles.header}>
        <ResponsiveContainer>
          <ResponsiveTitle>Responsive System Test</ResponsiveTitle>
          <ResponsiveSubtitle>Testing responsive components and utilities</ResponsiveSubtitle>
        </ResponsiveContainer>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <ResponsiveContainer maxWidth="1200px">
          
          {/* Typography Test */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Typography Test</h2>
            <div style={styles.typographyGrid}>
              <ResponsiveCard>
                <ResponsiveTitle variant="title">Title Variant</ResponsiveTitle>
                <ResponsiveText variant="body">
                  This demonstrates the title typography variant with responsive scaling.
                </ResponsiveText>
              </ResponsiveCard>
              
              <ResponsiveCard>
                <ResponsiveSubtitle>Subtitle Variant</ResponsiveSubtitle>
                <ResponsiveText variant="body">
                  This demonstrates the subtitle typography variant with responsive scaling.
                </ResponsiveText>
              </ResponsiveCard>
              
              <ResponsiveCard>
                <ResponsiveText variant="body">Body Text Variant</ResponsiveText>
                <ResponsiveText variant="small">
                  This demonstrates the body and small text variants with responsive scaling.
                </ResponsiveText>
              </ResponsiveCard>
            </div>
          </section>

          {/* Grid Test */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Grid System Test</h2>
            <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
              <ResponsiveCard>
                <h3>Column 1</h3>
                <p>1 column on xs, 2 on sm, 3 on md, 4 on lg+</p>
              </ResponsiveCard>
              <ResponsiveCard>
                <h3>Column 2</h3>
                <p>Responsive grid layout demonstration</p>
              </ResponsiveCard>
              <ResponsiveCard>
                <h3>Column 3</h3>
                <p>Watch the layout change as you resize</p>
              </ResponsiveCard>
              <ResponsiveCard>
                <h3>Column 4</h3>
                <p>Perfect for service grids and galleries</p>
              </ResponsiveCard>
            </ResponsiveGrid>
          </section>

          {/* Button Test */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Button Variants Test</h2>
            <div style={styles.buttonGrid}>
              <ResponsiveCard>
                <h3>Primary Buttons</h3>
                <div style={styles.buttonRow}>
                  <ResponsiveButton variant="primary">Primary</ResponsiveButton>
                  <ResponsiveLinkButton href="#" variant="primary">Primary Link</ResponsiveLinkButton>
                </div>
              </ResponsiveCard>
              
              <ResponsiveCard>
                <h3>Secondary Buttons</h3>
                <div style={styles.buttonRow}>
                  <ResponsiveButton variant="secondary">Secondary</ResponsiveButton>
                  <ResponsiveLinkButton href="#" variant="secondary">Secondary Link</ResponsiveLinkButton>
                </div>
              </ResponsiveCard>
              
              <ResponsiveCard>
                <h3>Ghost Buttons</h3>
                <div style={styles.buttonRow}>
                  <ResponsiveButton variant="ghost">Ghost</ResponsiveButton>
                  <ResponsiveLinkButton href="#" variant="ghost">Ghost Link</ResponsiveLinkButton>
                </div>
              </ResponsiveCard>
            </div>
          </section>

          {/* Custom Styles Test */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Custom Responsive Styles</h2>
            <div style={styles.customStylesGrid}>
              <ResponsiveCard style={customCardStyles}>
                <h3>Custom Grid</h3>
                <p>Using createGridStyles utility</p>
              </ResponsiveCard>
              
              <ResponsiveCard style={customTypographyStyles}>
                <h3>Custom Typography</h3>
                <p>Using createTypographyStyles utility</p>
              </ResponsiveCard>
              
              <ResponsiveCard style={customButtonStyles}>
                <h3>Custom Button</h3>
                <p>Using createButtonStyles utility</p>
              </ResponsiveCard>
            </div>
          </section>

          {/* Breakpoint Information */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Breakpoint Information</h2>
            <ResponsiveCard>
              <h3>Current Breakpoints</h3>
              <ul style={styles.breakpointList}>
                <li><strong>xs:</strong> 320px (Extra small devices)</li>
                <li><strong>sm:</strong> 576px (Small devices)</li>
                <li><strong>md:</strong> 768px (Medium devices)</li>
                <li><strong>lg:</strong> 992px (Large devices)</li>
                <li><strong>xl:</strong> 1200px (Extra large devices)</li>
                <li><strong>xxl:</strong> 1400px (Extra extra large devices)</li>
              </ul>
              
              <h3>Testing Instructions</h3>
              <ol style={styles.instructionsList}>
                <li>Resize your browser window to test different screen sizes</li>
                <li>Use browser developer tools to simulate different devices</li>
                <li>Check that content reflows appropriately at each breakpoint</li>
                <li>Verify that touch targets are large enough on mobile</li>
                <li>Ensure text remains readable without zooming</li>
              </ol>
            </ResponsiveCard>
          </section>

        </ResponsiveContainer>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <ResponsiveContainer>
          <p style={styles.footerText}>
            &copy; {new Date().getFullYear()} Uni-Spa Responsive System Test
          </p>
        </ResponsiveContainer>
      </footer>
    </div>
  );
};

// Custom styles using responsive utilities
const customCardStyles = {
  ...createGridStyles({ xs: 1, sm: 2, md: 3, lg: 4 }),
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6'
};

const customTypographyStyles = {
  ...createTypographyStyles('title'),
  color: '#007bff',
  textAlign: 'center'
};

const customButtonStyles = {
  ...createButtonStyles('primary'),
  backgroundColor: '#28a745',
  border: 'none'
};

const styles = {
  body: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
  },
  header: {
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    padding: '40px 0',
    marginBottom: '40px'
  },
  main: {
    flex: 1,
    padding: '20px 0'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '20px',
    textAlign: 'center'
  },
  typographyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    [mediaQueries.up.md]: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    [mediaQueries.up.sm]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [mediaQueries.up.xs]: {
      gridTemplateColumns: '1fr'
    }
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    [mediaQueries.up.md]: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    [mediaQueries.up.sm]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [mediaQueries.up.xs]: {
      gridTemplateColumns: '1fr'
    }
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  customStylesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    [mediaQueries.up.md]: {
      gridTemplateColumns: 'repeat(3, 1fr)'
    },
    [mediaQueries.up.sm]: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    },
    [mediaQueries.up.xs]: {
      gridTemplateColumns: '1fr'
    }
  },
  breakpointList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px 0'
  },
  instructionsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    counterReset: 'instructions-counter'
  },
  footer: {
    background: '#2d3748',
    color: '#cbd5e0',
    padding: '20px 0',
    marginTop: '40px'
  },
  footerText: {
    margin: 0,
    textAlign: 'center',
    fontSize: '0.9rem'
  }
};

export default ResponsiveTest;