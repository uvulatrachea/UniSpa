import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import '../../css/CustomerDashboard.css';

const About = ({ stats }) => {
  const customer = { name: 'Guest' }; // Default since no auth prop passed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate real statistics from your database
  const totalStaff = stats?.totalStaff || 7;
  const generalStaff = stats?.generalStaff || 4;
  const studentStaff = stats?.studentStaff || 3;
  const averageRating = stats?.avgRating || 4.5;
  const totalServices = stats?.totalServices || 4;
  const totalCustomers = stats?.totalCustomers || 5;
  const completedBookings = stats?.completedBookings || 1;
  const totalBookings = stats?.totalBookings || 1;

  return (
    <div style={styles.body}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.navLogo}>
            <i className="fas fa-spa" style={styles.navLogoIcon}></i>
            <span style={styles.navLogoText}>UNISPA Masmed UiTM</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.mobileMenuButton}
            className="mobile-menu-button"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

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
            <Link href="/about-us" style={{...styles.navLink, ...styles.navLinkActive}}>
              <i className="fas fa-info-circle"></i> About Us
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

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div style={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
              <div style={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
                <div style={styles.mobileMenuHeader}>
                  <div style={styles.mobileMenuLogo}>
                    <i className="fas fa-spa" style={styles.navLogoIcon}></i>
                    <span style={styles.navLogoText}>UNISPA</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={styles.mobileMenuClose}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div style={styles.mobileMenuContent}>
                  <Link
                    href="/dashboard"
                    style={styles.mobileMenuLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-home"></i>
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/services"
                    style={styles.mobileMenuLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-spa"></i>
                    <span>Services</span>
                  </Link>
                  <Link
                    href="/appointment/appointment-i"
                    style={styles.mobileMenuLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-calendar-alt"></i>
                    <span>Book Appointment</span>
                  </Link>
                  <Link
                    href="/bookings"
                    style={styles.mobileMenuLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-calendar-check"></i>
                    <span>My Appointments</span>
                  </Link>
                  <Link
                    href="/promotions"
                    style={styles.mobileMenuLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-gift"></i>
                    <span>Promotions</span>
                  </Link>
                  <Link
                    href="/about-us"
                    style={{...styles.mobileMenuLink, ...styles.mobileMenuLinkActive}}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-info-circle"></i>
                    <span>About Us</span>
                  </Link>
                  <Link
                    href="/profile"
                    style={styles.mobileMenuLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </Link>

                  <hr style={styles.mobileMenuDivider} />

                  <div style={styles.mobileMenuUser}>
                    <div style={styles.mobileUserInfo}>
                      <i className="fas fa-user-circle" style={styles.mobileUserIcon}></i>
                      <span style={styles.mobileUserName}>{customer.name}</span>
                    </div>
                    <Link
                      href="/customer/logout"
                      method="post"
                      style={styles.mobileLogoutButton}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent} className="main-content">
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>About Uni-Spa Masmed UiTM</h1>
          <p style={styles.pageSubtitle}>
            UiTM's premier student-run wellness center fostering entrepreneurship and wellness
          </p>
        </div>

        {/* About Container */}
        <div style={styles.aboutContainer}>
          {/* Mission Section */}
          <div style={styles.missionSection}>
            <div style={styles.missionContent}>
              <h2 style={styles.sectionTitle}>Our Mission</h2>
              <p style={styles.missionText}>
                Through a strategic alliance between Universiti Teknologi MARA (UiTM) Shah Alam and an industry partner based in Putra Heights, Subang called FMMC Sdn. Bhd., Uni-Spa Masmed UiTM Shah Alam was formally launched in June 2024.
              </p>
              <p style={styles.missionText}>
                This initiative was created as an incubator for student entrepreneurship in the fields of food & beverage (F&B), wellness, and beauty. It is located on the third floor of the UiTM-MTDC Technopreneur Centre. With an emphasis on developing job creators rather than job seekers, the initiative aligns with UiTM's JobCreator Framework and Malaysia's 2030 Entrepreneurial Nation Vision.
              </p>
              <div style={styles.missionStats}>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>2024</div>
                  <div style={styles.statLabel}>Established</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{totalStaff}</div>
                  <div style={styles.statLabel}>Student Staff</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{totalServices}</div>
                  <div style={styles.statLabel}>Services</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{totalCustomers}+</div>
                  <div style={styles.statLabel}>Happy Customers</div>
                </div>
              </div>
            </div>
            <div style={styles.missionImage}>
              <img
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80"
                alt="Uni-Spa Facility"
                style={styles.facilityImage}
              />
            </div>
          </div>

          {/* What We Offer */}
          <div style={styles.offerSection}>
            <h2 style={styles.sectionTitle}>What We Offer</h2>
            <div style={styles.offersGrid}>
              <div style={styles.offerCard}>
                <div style={styles.offerIcon}>
                  <i className="fas fa-spa"></i>
                </div>
                <h3 style={styles.offerTitle}>Premium Spa Services</h3>
                <p style={styles.offerText}>
                  Experience professional massage, facials, hair styling, manicures, pedicures, and makeup application services.
                </p>
              </div>
              <div style={styles.offerCard}>
                <div style={styles.offerIcon}>
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 style={styles.offerTitle}>Student Entrepreneurship</h3>
                <p style={styles.offerText}>
                  Hands-on training for UiTM students in business management, customer service, and wellness industry operations.
                </p>
              </div>
              <div style={styles.offerCard}>
                <div style={styles.offerIcon}>
                  <i className="fas fa-handshake"></i>
                </div>
                <h3 style={styles.offerTitle}>Industry Partnership</h3>
                <p style={styles.offerText}>
                  Strategic collaboration with FMMC Sdn. Bhd. providing real-world business experience and industry expertise.
                </p>
              </div>
              <div style={styles.offerCard}>
                <div style={styles.offerIcon}>
                  <i className="fas fa-users"></i>
                </div>
                <h3 style={styles.offerTitle}>Community Wellness</h3>
                <p style={styles.offerText}>
                  Promoting wellness and self-care within the UiTM community while supporting student entrepreneurs.
                </p>
              </div>
            </div>
          </div>

          {/* Our Team */}
          <div style={styles.teamSection}>
            <h2 style={styles.sectionTitle}>Our Student Team</h2>
            <p style={styles.teamDescription}>
              All operations at Uni-Spa are run by dedicated UiTM students under the guidance of seasoned business professionals.
              Our team combines academic excellence with practical business experience.
            </p>
            <div style={styles.teamGrid}>
              <div style={styles.teamCategory}>
                <div style={styles.teamIcon}>
                  <i className="fas fa-user-graduate"></i>
                </div>
                <h3 style={styles.teamTitle}>Student Therapists</h3>
                <p style={styles.teamText}>
                  {studentStaff} trained student therapists providing professional spa services
                </p>
              </div>
              <div style={styles.teamCategory}>
                <div style={styles.teamIcon}>
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3 style={styles.teamTitle}>Professional Staff</h3>
                <p style={styles.teamText}>
                  {generalStaff} experienced professionals overseeing operations and training
                </p>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div style={styles.locationSection}>
            <h2 style={styles.sectionTitle}>Visit Us</h2>
            <div style={styles.locationGrid}>
              <div style={styles.locationInfo}>
                <div style={styles.locationItem}>
                  <i className="fas fa-map-marker-alt" style={styles.locationIcon}></i>
                  <div>
                    <h4 style={styles.locationTitle}>Address</h4>
                    <p style={styles.locationText}>
                      3rd Floor, UiTM-MTDC Technopreneur Centre<br />
                      Universiti Teknologi MARA (UiTM)<br />
                      Shah Alam, Malaysia
                    </p>
                  </div>
                </div>
                <div style={styles.locationItem}>
                  <i className="fas fa-clock" style={styles.locationIcon}></i>
                  <div>
                    <h4 style={styles.locationTitle}>Operating Hours</h4>
                    <p style={styles.locationText}>
                      Monday - Saturday: 10:00 AM - 6:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                <div style={styles.locationItem}>
                  <i className="fas fa-phone" style={styles.locationIcon}></i>
                  <div>
                    <h4 style={styles.locationTitle}>Contact</h4>
                    <p style={styles.locationText}>
                      Phone: +603-5544 2000<br />
                      Email: unispa@uitm.edu.my
                    </p>
                  </div>
                </div>
                <Link href="/contact-us" style={styles.contactButton}>
                  <i className="fas fa-envelope"></i> Contact Us
                </Link>
              </div>
              <div style={styles.locationMap}>
                {/* Placeholder for map - you can integrate Google Maps here */}
                <div style={styles.mapPlaceholder}>
                  <i className="fas fa-map-marked-alt" style={styles.mapIcon}></i>
                  <p style={styles.mapText}>Interactive Map Coming Soon</p>
                  <small style={styles.mapSubtext}>UiTM-MTDC Technopreneur Centre</small>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Sidebar */}
          <div style={styles.statsSidebar}>
            <h3 style={styles.sidebarTitle}>Uni-Spa by Numbers</h3>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>2024</div>
                <div style={styles.statLabel}>Founded</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>{totalCustomers}+</div>
                <div style={styles.statLabel}>Customers Served</div>
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

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-spa"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>{totalServices}</div>
                <div style={styles.statLabel}>Services Offered</div>
              </div>
            </div>

            <div style={styles.infoCard}>
              <h4 style={styles.infoTitle}>Why Choose Uni-Spa?</h4>
              <ul style={styles.infoList}>
                <li>Student-run with professional oversight</li>
                <li>Affordable pricing with quality service</li>
                <li>Supporting UiTM entrepreneurship</li>
                <li>Modern facility with latest equipment</li>
                <li>Trained and certified therapists</li>
              </ul>
              <Link href="/appointment/appointment-i" style={styles.bookNowBtn}>
                <i className="fas fa-calendar-plus"></i> Book Appointment
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
            <h4 style={styles.footerHeading}>About</h4>
            <ul style={styles.footerLinks}>
              <li><Link href="/about-us">Our Mission</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
              <li><Link href="/services">Services</Link></li>
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

  // About Container
  aboutContainer: {
    display: 'grid',
    gridTemplateColumns: '3fr 1fr',
    gap: '40px',
    alignItems: 'start'
  },

  // Mission Section
  missionSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    marginBottom: '40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '50px',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#2d3748',
    margin: '0 0 25px 0'
  },
  missionText: {
    fontSize: '1.1rem',
    lineHeight: 1.7,
    color: '#4a5568',
    margin: '0 0 20px 0'
  },
  missionStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginTop: '30px'
  },
  statItem: {
    textAlign: 'center',
    padding: '20px',
    background: 'rgba(93, 58, 127, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(93, 58, 127, 0.1)'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#5d3a7f',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#718096',
    fontWeight: '600'
  },
  missionImage: {
    display: 'flex',
    justifyContent: 'center'
  },
  facilityImage: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },

  // What We Offer
  offerSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    marginBottom: '40px'
  },
  offersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    marginTop: '30px'
  },
  offerCard: {
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '15px',
    padding: '30px',
    textAlign: 'center',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    transition: 'all 0.3s ease'
  },
  offerIcon: {
    fontSize: '3rem',
    color: '#5d3a7f',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #f3f0ff 0%, #e8e2ff 100%)',
    padding: '20px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px'
  },
  offerTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 15px 0'
  },
  offerText: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: 1.6,
    margin: 0
  },

  // Team Section
  teamSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    marginBottom: '40px'
  },
  teamDescription: {
    fontSize: '1.1rem',
    color: '#4a5568',
    lineHeight: 1.6,
    marginBottom: '40px'
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px'
  },
  teamCategory: {
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '15px',
    padding: '30px',
    textAlign: 'center',
    border: '1px solid rgba(93, 58, 127, 0.1)'
  },
  teamIcon: {
    fontSize: '3rem',
    color: '#5d3a7f',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #f3f0ff 0%, #e8e2ff 100%)',
    padding: '20px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px'
  },
  teamTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 15px 0'
  },
  teamText: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: 1.6,
    margin: 0
  },

  // Location Section
  locationSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '50px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)',
    marginBottom: '40px'
  },
  locationGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '50px',
    alignItems: 'start',
    marginTop: '30px'
  },
  locationInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  locationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px'
  },
  locationIcon: {
    fontSize: '1.5rem',
    color: '#5d3a7f',
    marginTop: '5px',
    minWidth: '20px'
  },
  locationTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 8px 0'
  },
  locationText: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: 1.6,
    margin: 0
  },
  contactButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    fontWeight: '700',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    alignSelf: 'flex-start',
    marginTop: '20px'
  },
  locationMap: {
    display: 'flex',
    justifyContent: 'center'
  },
  mapPlaceholder: {
    background: 'linear-gradient(135deg, #f3f0ff 0%, #e8e2ff 100%)',
    borderRadius: '15px',
    padding: '60px 40px',
    textAlign: 'center',
    border: '2px dashed #5d3a7f',
    width: '100%',
    maxWidth: '400px'
  },
  mapIcon: {
    fontSize: '4rem',
    color: '#5d3a7f',
    marginBottom: '20px',
    opacity: 0.7
  },
  mapText: {
    fontSize: '1.3rem',
    color: '#5d3a7f',
    fontWeight: '700',
    margin: '0 0 10px 0'
  },
  mapSubtext: {
    fontSize: '0.9rem',
    color: '#718096'
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
  bookNowBtn: {
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

export default About;
