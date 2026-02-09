import React from 'react';
import { Link } from '@inertiajs/react';
import '../../css/CustomerDashboard.css';

const Promotions = ({ promotions, stats }) => {
  const customer = { name: 'Guest' }; // Default since no auth prop passed

  // Calculate real statistics from your database
  const totalStaff = stats?.totalStaff || 7;
  const generalStaff = stats?.generalStaff || 4;
  const studentStaff = stats?.studentStaff || 3;
  const averageRating = stats?.avgRating || 4.5;
  const totalServices = stats?.totalServices || 4;
  const totalCustomers = stats?.totalCustomers || 5;
  const completedBookings = stats?.completedBookings || 1;
  const totalBookings = stats?.totalBookings || 1;

  // Format discount display
  const formatDiscount = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}% OFF`;
    } else {
      return `RM${promotion.discount_value} OFF`;
    }
  };

  return (
    <div style={styles.body}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navLogo}>
            <i className="fas fa-spa" style={styles.navLogoIcon}></i>
            <span style={styles.navLogoText}>UNISPA Masmed UiTM</span>
          </div>

          <div style={styles.navLinks}>
            <Link href="/dashboard" style={styles.navLink}>
              <i className="fas fa-home"></i> Dashboard
            </Link>
            <Link href="/services" style={styles.navLink}>
              <i className="fas fa-spa"></i> Services
            </Link>
            <Link href="/appointment/appointment-i" style={styles.navLink}>
              <i className="fas fa-calendar-alt"></i> Book Appointment
            </Link>
            <Link href="/promotions" style={{...styles.navLink, ...styles.navLinkActive}}>
              <i className="fas fa-gift"></i> Promotions
            </Link>
            <Link href="/profile" style={styles.navLink}>
              <i className="fas fa-user"></i> Profile
            </Link>
            <div style={styles.userGreeting}>
              <i className="fas fa-user-circle" style={{marginRight: '8px'}}></i>
              Hi, {customer.name}
              <Link href="/customer/logout" method="post" style={styles.logoutLink}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent} className="main-content">
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Special Offers & Promotions</h1>
          <p style={styles.pageSubtitle}>
            Take advantage of our exclusive deals and seasonal offers
          </p>
        </div>

        {/* Promotions Container */}
        <div style={styles.promotionsContainer}>
          {promotions && promotions.length > 0 ? (
            <div style={styles.promotionsGrid}>
              {promotions.map((promotion) => (
                <div key={promotion.promotion_id} style={styles.promotionCard}>
                  <div style={styles.promotionImage}>
                    <img
                      src={promotion.banner_image || `https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80`}
                      alt={promotion.title}
                      style={styles.promotionImg}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div style={styles.discountBadge}>
                      {formatDiscount(promotion)}
                    </div>
                  </div>

                  <div style={styles.promotionContent}>
                    <h3 style={styles.promotionTitle}>{promotion.title}</h3>
                    <p style={styles.promotionDescription}>{promotion.description}</p>

                    <div style={styles.promotionMeta}>
                      {promotion.start_date && (
                        <div style={styles.metaItem}>
                          <i className="fas fa-calendar-alt"></i>
                          <span>Starts: {new Date(promotion.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {promotion.end_date && (
                        <div style={styles.metaItem}>
                          <i className="fas fa-clock"></i>
                          <span>Ends: {new Date(promotion.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div style={styles.promotionActions}>
                      <Link
                        href="/appointment/appointment-i"
                        style={styles.bookNowBtn}
                      >
                        <i className="fas fa-calendar-plus"></i> Book Now
                      </Link>
                      <Link
                        href="/services"
                        style={styles.viewServicesBtn}
                      >
                        <i className="fas fa-list"></i> View Services
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noPromotions}>
              <i className="fas fa-gift" style={{fontSize: '4rem', color: '#cbd5e0', marginBottom: '20px'}}></i>
              <h3 style={styles.noPromotionsTitle}>No Active Promotions</h3>
              <p style={styles.noPromotionsText}>
                Check back later for exciting offers and special deals!
              </p>
              <Link href="/services" style={styles.viewServicesBtn}>
                <i className="fas fa-spa"></i> View Our Services
              </Link>
            </div>
          )}

          {/* Statistics Sidebar */}
          <div style={styles.statsSidebar}>
            <h3 style={styles.sidebarTitle}>Why Choose Our Promotions?</h3>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-percent"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>Up to 50%</div>
                <div style={styles.statLabel}>Discount Savings</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>{totalCustomers}+</div>
                <div style={styles.statLabel}>Happy Customers</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-star"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>{averageRating}</div>
                <div style={styles.statLabel}>Average Rating</div>
              </div>
            </div>

            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Exclusive Benefits</h4>
              <ul style={styles.infoList}>
                <li>Student member discounts</li>
                <li>Seasonal special offers</li>
                <li>Loyalty program rewards</li>
                <li>Early access to new services</li>
                <li>Priority booking</li>
              </ul>
              <Link href="/contact-us" style={styles.contactBtn}>
                <i className="fas fa-envelope"></i> Contact for More Deals
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerSection}>
            <div style={styles.footerLogo}>
              <i className="fas fa-spa"></i>
              <span>UNISPA Masmed UiTM</span>
            </div>
            <p style={styles.footerDescription}>
              UiTM's student-run wellness center. Experience premium spa treatments while supporting student entrepreneurs.
            </p>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerHeading}>Quick Links</h4>
            <ul style={styles.footerLinks}>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li><Link href="/services">Our Services</Link></li>
              <li><Link href="/appointment/appointment-i">Book Appointment</Link></li>
              <li><Link href="/about-us">About Uni-Spa</Link></li>
            </ul>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerHeading}>Promotions</h4>
            <ul style={styles.footerLinks}>
              <li><Link href="/promotions">Current Offers</Link></li>
              <li><Link href="/services">Service Packages</Link></li>
              <li><Link href="/contact-us">Special Requests</Link></li>
            </ul>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} UNISPA Masmed UiTM Shah Alam. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    margin: 0,
    padding: 0,
    minHeight: '100vh',
    color: '#333',
    display: 'flex',
    flexDirection: 'column'
  },

  // Navbar
  navbar: {
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    padding: '0',
    boxShadow: '0 4px 20px rgba(93, 58, 127, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px'
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  navLogoIcon: {
    fontSize: '2rem',
    color: '#d4afb9',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
  },
  navLogoText: {
    background: 'linear-gradient(45deg, #d4afb9, #ffffff)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  navLinks: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  navLink: {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '1rem',
    background: 'rgba(255,255,255,0.05)'
  },
  navLinkActive: {
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  userGreeting: {
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem'
  },
  logoutLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    marginLeft: '15px',
    fontSize: '1.1rem',
    transition: 'color 0.3s ease'
  },

  // Main Content
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '50px 30px',
    flex: 1
  },

  // Page Header
  pageHeader: {
    textAlign: 'center',
    marginBottom: '50px'
  },
  pageTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#2d3748',
    margin: '0 0 15px 0',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  },
  pageSubtitle: {
    fontSize: '1.3rem',
    color: '#718096',
    margin: 0,
    fontWeight: '500'
  },

  // Promotions Container
  promotionsContainer: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
    gap: '40px',
    alignItems: 'start'
  },

  // Promotions Grid
  promotionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px'
  },
  promotionCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    transition: 'all 0.3s ease'
  },
  promotionImage: {
    position: 'relative',
    height: '250px',
    overflow: 'hidden'
  },
  promotionImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease'
  },
  discountBadge: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, #d4afb9 0%, #b896b2 100%)',
    color: '#5d3a7f',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '1.1rem',
    fontWeight: '800',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  promotionContent: {
    padding: '30px'
  },
  promotionTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#2d3748',
    margin: '0 0 15px 0'
  },
  promotionDescription: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: 1.6,
    margin: '0 0 20px 0'
  },
  promotionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '25px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: '#718096'
  },
  promotionActions: {
    display: 'flex',
    gap: '15px'
  },
  bookNowBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '15px 25px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    flex: 1,
    justifyContent: 'center'
  },
  viewServicesBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'transparent',
    color: '#5d3a7f',
    textDecoration: 'none',
    padding: '15px 25px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    border: '2px solid #5d3a7f',
    flex: 1,
    justifyContent: 'center'
  },

  // No Promotions
  noPromotions: {
    textAlign: 'center',
    padding: '80px 40px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.1)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    gridColumn: '1 / -1'
  },
  noPromotionsTitle: {
    fontSize: '2rem',
    color: '#2d3748',
    margin: '0 0 15px 0',
    fontWeight: '700'
  },
  noPromotionsText: {
    fontSize: '1.1rem',
    color: '#718096',
    margin: '0 0 30px 0',
    lineHeight: 1.6
  },

  // Statistics Sidebar
  statsSidebar: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    position: 'sticky',
    top: '100px'
  },
  sidebarTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#2d3748',
    margin: '0 0 25px 0',
    textAlign: 'center'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '12px',
    marginBottom: '15px',
    border: '1px solid rgba(93, 58, 127, 0.1)'
  },
  statIcon: {
    fontSize: '2rem',
    color: '#5d3a7f',
    background: 'linear-gradient(135deg, #f3f0ff 0%, #e8e2ff 100%)',
    padding: '15px',
    borderRadius: '10px',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statInfo: {
    flex: 1
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#2d3748',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#718096',
    marginTop: '2px'
  },

  // Info Card
  infoCard: {
    background: 'linear-gradient(135deg, #f3f0ff 0%, #e8e2ff 100%)',
    borderRadius: '15px',
    padding: '25px',
    marginTop: '20px',
    border: '1px solid rgba(93, 58, 127, 0.1)'
  },
  infoTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 15px 0'
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  contactBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '12px 20px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease'
  },

  // Footer
  footer: {
    background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
    color: '#cbd5e0',
    marginTop: '80px'
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 30px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '50px'
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '15px'
  },
  footerDescription: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    marginBottom: '20px',
    color: '#a0aec0'
  },
  footerHeading: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white',
    margin: '0 0 15px 0'
  },
  footerLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  footerBottom: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '20px 30px',
    maxWidth: '1400px',
    margin: '0 auto',
    textAlign: 'center'
  },
  copyright: {
    fontSize: '0.9rem',
    color: '#a0aec0',
    margin: 0
  }
};

export default Promotions;
