import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import '../../css/CustomerDashboard.css';

const AppointmentBooking = ({ auth, services, staff, stats, selectedServiceId }) => {
  const customer = auth?.user || {};
  const username = customer?.name || 'Guest';
  const { flash } = usePage().props;

  // Form states
  const [selectedService, setSelectedService] = useState(selectedServiceId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
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

  // Set initial service if selectedServiceId is provided
  useEffect(() => {
    if (selectedServiceId) {
      setSelectedService(selectedServiceId);
    }
  }, [selectedServiceId]);

  // Handle service selection
  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedSlot('');
    setBookingError('');
  };

  // Handle date selection and fetch available slots
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot('');
    setBookingError('');

    if (selectedService && date) {
      setIsLoading(true);
      try {
        const response = await fetch('/appointment/slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
          },
          body: JSON.stringify({
            service_id: selectedService,
            date: date,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setAvailableSlots(data.slots || []);
        } else {
          setBookingError(data.error || 'Failed to fetch available slots');
        }
      } catch (error) {
        console.error('Error fetching slots:', error);
        setBookingError('Failed to fetch available slots');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService || !selectedSlot) {
      setBookingError('Please select a service and time slot');
      return;
    }

    setIsLoading(true);
    setBookingError('');

    try {
      const response = await fetch('/appointment/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({
          service_id: selectedService,
          slot_id: selectedSlot,
          special_requests: specialRequests,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookingSuccess(true);
        // Reset form
        setSelectedService('');
        setSelectedDate('');
        setAvailableSlots([]);
        setSelectedSlot('');
        setSpecialRequests('');
      } else {
        setBookingError(data.error || data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setBookingError('Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected service details
  const selectedServiceData = services?.find(s => s.service_id == selectedService);

  return (
    <div style={styles.body}>
      {/* Success Message */}
      {bookingSuccess && (
        <div style={styles.successMessage}>
          <div style={styles.successContent}>
            <i className="fas fa-check-circle" style={styles.successIcon}></i>
            <h3 style={styles.successTitle}>Appointment Booked Successfully!</h3>
            <p style={styles.successText}>
              Your appointment has been scheduled. You will receive a confirmation email shortly.
            </p>
            <Link href="/dashboard" style={styles.successButton}>
              <i className="fas fa-home"></i> Back to Dashboard
            </Link>
          </div>
        </div>
      )}

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
            <Link href="/appointment/appointment-i" style={{...styles.navLink, ...styles.navLinkActive}}>
              <i className="fas fa-calendar-alt"></i> Appointments
            </Link>
            <Link href="/profile" style={styles.navLink}>
              <i className="fas fa-user"></i> Profile
            </Link>
            <div style={styles.userGreeting}>
              <i className="fas fa-user-circle" style={{marginRight: '8px'}}></i>
              Hi, {username}
              <Link href="/customer/logout" method="post" style={styles.logoutLink}>
                <i className="fas fa-sign-out-alt"></i>
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
                    style={{...styles.mobileMenuLink, ...styles.mobileMenuLinkActive}}
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
                    style={styles.mobileMenuLink}
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
                      <span style={styles.mobileUserName}>{username}</span>
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
          <h1 style={styles.pageTitle}>Book Your Appointment</h1>
          <p style={styles.pageSubtitle}>
            Schedule your wellness experience with our professional therapists
          </p>
        </div>

        {/* Booking Form */}
        <div style={styles.bookingContainer}>
          <div style={styles.bookingForm}>
            <h2 style={styles.formTitle}>Select Your Service</h2>

            {/* Service Selection */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Choose Service</label>
              <div style={styles.servicesGrid}>
                {services?.map((service) => (
                  <div
                    key={service.service_id}
                    style={{
                      ...styles.serviceCard,
                      ...(selectedService == service.service_id ? styles.serviceCardSelected : {})
                    }}
                    onClick={() => handleServiceChange(service.service_id)}
                  >
                    <div style={styles.serviceImage}>
                      <img
                        src={service.image}
                        alt={service.name}
                        style={styles.serviceImg}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/300x200/5d3a7f/ffffff?text=' + encodeURIComponent(service.name);
                        }}
                      />
                    </div>
                    <div style={styles.serviceInfo}>
                      <h4 style={styles.serviceName}>{service.name}</h4>
                      <p style={styles.serviceDescription}>{service.description}</p>
                      <div style={styles.serviceMeta}>
                        <span style={styles.serviceDuration}>
                          <i className="fas fa-clock"></i> {service.duration_minutes} mins
                        </span>
                        <span style={styles.servicePrice}>
                          <i className="fas fa-tag"></i> RM{service.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            {selectedService && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={styles.dateInput}
                />
              </div>
            )}

            {/* Time Slot Selection */}
            {selectedDate && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Available Time Slots</label>
                {isLoading ? (
                  <div style={styles.loadingSlots}>
                    <i className="fas fa-spinner fa-spin"></i> Loading available slots...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div style={styles.slotsGrid}>
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.slot_id}
                        type="button"
                        style={{
                          ...styles.slotButton,
                          ...(selectedSlot == slot.slot_id ? styles.slotButtonSelected : {})
                        }}
                        onClick={() => setSelectedSlot(slot.slot_id)}
                      >
                        <div style={styles.slotTime}>
                          {slot.start_time} - {slot.end_time}
                        </div>
                        <div style={styles.slotStaff}>
                          {slot.staff_name}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={styles.noSlots}>
                    <i className="fas fa-calendar-times"></i>
                    <p>No available slots for this date. Please select a different date.</p>
                  </div>
                )}
              </div>
            )}

            {/* Special Requests */}
            {selectedSlot && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Special Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or preferences..."
                  style={styles.textarea}
                  rows={3}
                />
              </div>
            )}

            {/* Booking Summary */}
            {selectedServiceData && selectedSlot && (
              <div style={styles.bookingSummary}>
                <h3 style={styles.summaryTitle}>Booking Summary</h3>
                <div style={styles.summaryDetails}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Service:</span>
                    <span style={styles.summaryValue}>{selectedServiceData.name}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Date:</span>
                    <span style={styles.summaryValue}>{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Duration:</span>
                    <span style={styles.summaryValue}>{selectedServiceData.duration_minutes} minutes</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Price:</span>
                    <span style={styles.summaryValue}>RM{selectedServiceData.price}</span>
                  </div>
                  {customer.is_uitm_member && (
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryLabel}>UiTM Member Discount:</span>
                      <span style={styles.summaryValue}>-20% (RM{(selectedServiceData.price * 0.2).toFixed(2)})</span>
                    </div>
                  )}
                  <hr style={styles.summaryDivider} />
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryLabel}>Total Amount:</span>
                    <span style={styles.summaryTotal}>
                      RM{customer.is_uitm_member ? (selectedServiceData.price * 0.8).toFixed(2) : selectedServiceData.price}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {bookingError && (
              <div style={styles.errorMessage}>
                <i className="fas fa-exclamation-triangle"></i>
                {bookingError}
              </div>
            )}

            {/* Submit Button */}
            {selectedSlot && (
              <button
                type="submit"
                onClick={handleBookingSubmit}
                disabled={isLoading}
                style={{
                  ...styles.bookButton,
                  ...(isLoading ? styles.bookButtonDisabled : {})
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Booking...
                  </>
                ) : (
                  <>
                    <i className="fas fa-calendar-check"></i> Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>

          {/* Statistics Sidebar */}
          <div style={styles.statsSidebar}>
            <h3 style={styles.sidebarTitle}>Uni-Spa Statistics</h3>

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
                <i className="fas fa-user-graduate"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>{studentStaff}</div>
                <div style={styles.statLabel}>Student Therapists</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <i className="fas fa-briefcase"></i>
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statNumber}>{generalStaff}</div>
                <div style={styles.statLabel}>Professional Staff</div>
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
              <h4 style={styles.infoTitle}>Why Choose Uni-Spa?</h4>
              <ul style={styles.infoList}>
                <li>Professional student therapists</li>
                <li>State-of-the-art facilities</li>
                <li>Competitive pricing</li>
                <li>UiTM student discounts</li>
                <li>Flexible scheduling</li>
              </ul>
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
              <li><Link href="/appointment/appointment-i">Appointments</Link></li>
              <li><Link href="/about-us">About Uni-Spa</Link></li>
            </ul>
          </div>
          <div style={styles.footerSection}>
            <h4 style={styles.footerHeading}>Contact Info</h4>
            <ul style={styles.footerContact}>
              <li><i className="fas fa-phone"></i> +603-5544 2000</li>
              <li><i className="fas fa-envelope"></i> unispa@uitm.edu.my</li>
              <li><i className="fas fa-clock"></i> Mon-Sat: 10AM - 6PM</li>
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

  // Success Message
  successMessage: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(93, 58, 127, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    color: 'white'
  },
  successContent: {
    textAlign: 'center',
    maxWidth: '500px',
    padding: '40px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  },
  successIcon: {
    fontSize: '4rem',
    color: '#5d3a7f',
    marginBottom: '20px'
  },
  successTitle: {
    fontSize: '2rem',
    color: '#2d3748',
    margin: '0 0 15px 0',
    fontWeight: '800'
  },
  successText: {
    fontSize: '1.1rem',
    color: '#4a5568',
    margin: '0 0 30px 0',
    lineHeight: 1.6
  },
  successButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    textDecoration: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    fontWeight: '700',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease'
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

  // Mobile Menu Button
  mobileMenuButton: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease'
  },

  // Mobile Menu Styles
  mobileMenuOverlay: {
    position: 'fixed',
    top: '70px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  mobileMenu: {
    width: '300px',
    background: 'white',
    height: '100%',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white'
  },
  mobileMenuLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.2rem',
    fontWeight: '700'
  },
  mobileMenuClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '5px'
  },
  mobileMenuContent: {
    flex: 1,
    padding: '20px 0'
  },
  mobileMenuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    color: '#374151',
    textDecoration: 'none',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.3s ease'
  },
  mobileMenuLinkActive: {
    backgroundColor: '#f3f0ff',
    color: '#5d3a7f',
    borderLeft: '4px solid #5d3a7f'
  },
  mobileMenuDivider: {
    border: 'none',
    height: '1px',
    background: '#e5e7eb',
    margin: '20px 0'
  },
  mobileMenuUser: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb'
  },
  mobileUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px'
  },
  mobileUserIcon: {
    fontSize: '1.5rem',
    color: '#5d3a7f'
  },
  mobileUserName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151'
  },
  mobileLogoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease'
  },

  // Responsive Design
  '@media (max-width: 768px)': {
    navLinks: {
      display: 'none'
    },
    mobileMenuButton: {
      display: 'block'
    },
    bookingContainer: {
      gridTemplateColumns: '1fr'
    },
    servicesGrid: {
      gridTemplateColumns: '1fr'
    },
    slotsGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
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

  // Booking Container
  bookingContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
    alignItems: 'start'
  },

  // Booking Form
  bookingForm: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 15px 40px rgba(93, 58, 127, 0.15)',
    border: '1px solid rgba(93, 58, 127, 0.1)'
  },
  formTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#2d3748',
    margin: '0 0 30px 0',
    textAlign: 'center'
  },

  // Form Elements
  formGroup: {
    marginBottom: '30px'
  },
  formLabel: {
    display: 'block',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '15px'
  },

  // Services Grid
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  serviceCard: {
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(93, 58, 127, 0.1)',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  serviceCardSelected: {
    borderColor: '#5d3a7f',
    boxShadow: '0 8px 25px rgba(93, 58, 127, 0.3)'
  },
  serviceImage: {
    height: '150px',
    overflow: 'hidden'
  },
  serviceImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  serviceInfo: {
    padding: '20px'
  },
  serviceName: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 10px 0'
  },
  serviceDescription: {
    fontSize: '0.95rem',
    color: '#4a5568',
    margin: '0 0 15px 0',
    lineHeight: 1.5
  },
  serviceMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#718096'
  },

  // Date Input
  dateInput: {
    width: '100%',
    padding: '15px 20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  // Slots
  loadingSlots: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096',
    fontSize: '1.1rem'
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px'
  },
  slotButton: {
    background: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    padding: '15px 10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  slotButtonSelected: {
    borderColor: '#5d3a7f',
    background: 'linear-gradient(135deg, #f3f0ff 0%, #e8e2ff 100%)'
  },
  slotTime: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '5px'
  },
  slotStaff: {
    fontSize: '0.9rem',
    color: '#718096'
  },
  noSlots: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#718096'
  },

  // Textarea
  textarea: {
    width: '100%',
    padding: '15px 20px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.3s ease'
  },

  // Booking Summary
  bookingSummary: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%)',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '30px'
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 20px 0'
  },
  summaryDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: '1rem',
    color: '#4a5568',
    fontWeight: '500'
  },
  summaryValue: {
    fontSize: '1rem',
    color: '#2d3748',
    fontWeight: '600'
  },
  summaryTotal: {
    fontSize: '1.3rem',
    color: '#5d3a7f',
    fontWeight: '800'
  },
  summaryDivider: {
    border: 'none',
    height: '1px',
    background: 'rgba(93, 58, 127, 0.2)',
    margin: '15px 0'
  },

  // Error Message
  errorMessage: {
    background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
    color: '#c53030',
    padding: '15px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '600'
  },

  // Book Button
  bookButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)',
    color: 'white',
    border: 'none',
    padding: '20px',
    borderRadius: '15px',
    fontSize: '1.3rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  bookButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
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
    fontSize: '1.5rem',
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
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
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
  footerContact: {
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

export default AppointmentBooking;
