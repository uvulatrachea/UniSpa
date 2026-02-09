// resources/js/Pages/Services.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
import CustomerNavbar from "@/Components/CustomerNavbar";

const MAX_PEOPLE = 3;

// ✅ Use ONLY placehold.co (more reliable than via.placeholder.com)
const FALLBACK_IMG = "https://placehold.co/900x600/5B21B6/ffffff?text=UniSpa+Service";
const FALLBACK_DRAWER_IMG = "https://placehold.co/600x400/5B21B6/ffffff?text=UniSpa";

// ✅ Prevent infinite onError loop if fallback also fails
function setImgFallback(e, fallbackUrl) {
  const img = e.currentTarget;
  if (!img?.src) return;
  if (img.src.includes("placehold.co")) return; // already fallback
  img.src = fallbackUrl;
}

export default function ServicesPage({ auth, services = [], categories = [] }) {
  const user = auth?.user || {};
  const username = user?.name || "Guest";

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const dropdownRef = useRef(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState(1); // 1: confirm service, 2: who/guests, 3: details, 4: review
  const [selectedService, setSelectedService] = useState(null);

  // Booking form (in drawer)
  const [bookingFor, setBookingFor] = useState("self"); // self | others | both
  const [peopleCount, setPeopleCount] = useState(1); // 1..3 total
  const [guests, setGuests] = useState([
    // index 0 represents the account owner (self) (we auto fill name/phone/email if available)
    { is_self: true, name: user?.name || "", phone: user?.phone || "", email: user?.email || "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [drawerError, setDrawerError] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close drawer on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  // Lock background scroll when drawer open
  useEffect(() => {
    if (drawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [drawerOpen]);

  // ✅ Normalize DB services to UI shape
  const normalizedServices = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    return list.map((s) => {
      const service_id = s.service_id ?? s.id ?? s.serviceId;
      return {
        service_id,
        name: s.name ?? "Service",
        description: s.description ?? "",
        price: Number(s.price ?? 0),
        duration_minutes: Number(s.duration_minutes ?? 0),

        // ✅ IMPORTANT: no via.placeholder.com anywhere
        image: s.image ?? s.image_url ?? s.imageUrl ?? FALLBACK_IMG,

        category_name: s.category_name ?? s.category?.name ?? "Service",
        avg_rating: Number(s.avg_rating ?? s.rating ?? 0),
        review_count: Number(s.review_count ?? s.reviews ?? 0),
        tags: Array.isArray(s.tags) ? s.tags : [],
        popular: Boolean(s.is_popular) || Number(s.avg_rating ?? 0) >= 4.8,
        category_id: s.category_id ?? s.categoryId ?? null,
      };
    });
  }, [services]);

  // ✅ Normalize categories
  const normalizedCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const mapped = list.map((c) => ({
      id: String(c.id),
      name: c.name ?? "Category",
      count: Number(c.services_count ?? 0),
      gender: c.gender ?? null,
    }));
    return [{ id: "all", name: "All Services", count: normalizedServices.length, gender: null }, ...mapped];
  }, [categories, normalizedServices.length]);

  const priceFilters = [
    { id: "all", name: "All Prices", range: null },
    { id: "budget", name: "Budget (RM 0-50)", range: [0, 50] },
    { id: "mid", name: "Mid-range (RM 51-100)", range: [51, 100] },
    { id: "premium", name: "Premium (RM 101+)", range: [101, Infinity] },
  ];

  const sortOptions = [
    { id: "name", name: "Name A-Z" },
    { id: "price-low", name: "Price: Low to High" },
    { id: "price-high", name: "Price: High to Low" },
    { id: "rating", name: "Highest Rated" },
    { id: "popular", name: "Most Popular" },
  ];

  const selectedCategoryInfo =
    normalizedCategories.find((c) => c.id === selectedCategory) || normalizedCategories[0];

  // ✅ Filter + sort
  const filteredServices = useMemo(() => {
    const out = normalizedServices
      .filter((service) => {
        const matchesSearch =
          searchTerm.trim() === "" ||
          String(service.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(service.description).toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" ||
          String(service.category_id) === String(selectedCategory) ||
          String(service.category_name).toLowerCase() ===
            String(normalizedCategories.find((c) => c.id === selectedCategory)?.name || "").toLowerCase();

        const pf = priceFilters.find((p) => p.id === priceFilter);
        const matchesPrice =
          priceFilter === "all" || (pf?.range && service.price >= pf.range[0] && service.price <= pf.range[1]);

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
          case "popular":
            return Number(b.popular) - Number(a.popular);
          default:
            return String(a.name).localeCompare(String(b.name));
        }
      });

    return out;
  }, [normalizedServices, searchTerm, selectedCategory, priceFilter, sortBy, normalizedCategories]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceFilter("all");
    setSortBy("name");
  };

  // ===== Drawer helpers =====
  const openDrawerForService = (service) => {
    setSelectedService(service);
    setDrawerError("");
    setDrawerStep(1);

    // Reset booking fields
    setBookingFor("self");
    setPeopleCount(1);
    setGuests([{ is_self: true, name: user?.name || "", phone: user?.phone || "", email: user?.email || "" }]);

    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSubmitting(false);
    setDrawerError("");
    // keep selectedService for a moment (optional)
    setTimeout(() => {
      setSelectedService(null);
      setDrawerStep(1);
    }, 150);
  };

  const ensureGuestsLength = (count) => {
    // count is total people including self
    const next = [...guests];

    // Ensure self at index 0
    if (!next[0] || !next[0].is_self) {
      next.unshift({ is_self: true, name: user?.name || "", phone: user?.phone || "", email: user?.email || "" });
    }

    // If need more guests, append blanks
    while (next.length < count) {
      next.push({ is_self: false, name: "", phone: "", email: "" });
    }

    // If too many, trim
    while (next.length > count) next.pop();

    setGuests(next);
  };

  const onChangePeopleCount = (val) => {
    const n = Math.max(1, Math.min(MAX_PEOPLE, Number(val || 1)));
    setPeopleCount(n);
    ensureGuestsLength(n);

    if (n === 1) setBookingFor("self");
    else setBookingFor("both");
  };

  const updateGuest = (idx, key, value) => {
    setGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, [key]: value } : g)));
  };

  const validateDrawer = () => {
    if (!selectedService?.service_id) return "Service not selected.";

    const self = guests[0];
    if (!self?.name?.trim()) return "Please make sure your name is filled.";
    if (!self?.phone?.trim()) return "Please make sure your phone number is filled.";

    for (let i = 1; i < guests.length; i++) {
      const g = guests[i];
      if (!g?.name?.trim()) return `Guest ${i} name is required.`;
      if (!g?.phone?.trim()) return `Guest ${i} phone is required.`;
    }

    return "";
  };

  const addToCart = () => {
    const err = validateDrawer();
    if (err) {
      setDrawerError(err);
      return;
    }

    setSubmitting(true);
    setDrawerError("");

    const payload = {
      service_id: selectedService.service_id,
      quantity: peopleCount,
      participants: guests.map((g) => ({
        is_self: !!g.is_self,
        name: g.name,
        phone: g.phone,
        email: g.email || null,
      })),
    };

    router.post(route("booking.cart.add"), payload, {
      preserveScroll: true,
      onSuccess: () => {
        closeDrawer();
        router.visit(route("booking.cart"));
      },
      onError: (errors) => {
        const first = errors ? Object.values(errors)[0] : null;
        setDrawerError(first ? String(first) : "Failed to add to cart. Please try again.");
        setSubmitting(false);
      },
      onFinish: () => setSubmitting(false),
    });
  };

  // ===== UI =====
  return (
    <div style={styles.body}>
      <CustomerNavbar username={username} active="services" />

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Premium Spa Services</h1>
          <p style={styles.heroSubtitle}>Pick a service, then book for yourself or up to 2 guests (max 3 total)</p>

          <button
            style={styles.heroCta}
            onClick={() => {
              setSelectedService(null);
              setDrawerStep(1);
              setDrawerError("");
              setDrawerOpen(true);
            }}
            type="button"
          >
            <i className="fas fa-calendar-plus"></i> Reserve Now
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.mainContent}>
        {/* Search */}
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <i className="fas fa-search" style={styles.searchIcon}></i>
            <input
              type="text"
              placeholder="Search services by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} style={styles.clearSearchButton} aria-label="Clear search">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={styles.advancedFilters}>
          <div style={styles.filterRow}>
            {/* Category */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <div style={styles.dropdownContainer} ref={dropdownRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  style={{
                    ...styles.dropdownButton,
                    borderColor: isCategoryDropdownOpen ? "#5d3a7f" : "#d1d5db",
                  }}
                  type="button"
                >
                  {selectedCategoryInfo.name}
                  <span style={styles.dropdownCount}>({selectedCategoryInfo.count})</span>
                  <i
                    className={`fas fa-chevron-${isCategoryDropdownOpen ? "up" : "down"}`}
                    style={styles.dropdownArrow}
                  ></i>
                </button>

                {isCategoryDropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    {normalizedCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: selectedCategory === category.id ? "#f3f0ff" : "white",
                          color: selectedCategory === category.id ? "#5d3a7f" : "#374151",
                        }}
                        type="button"
                      >
                        <span style={styles.dropdownItemText}>{category.name}</span>
                        <span style={styles.dropdownItemCount}>({category.count})</span>
                        {selectedCategory === category.id && <i className="fas fa-check" style={styles.checkIcon}></i>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Price Range</label>
              <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} style={styles.selectInput}>
                {priceFilters.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.selectInput}>
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear */}
            {(searchTerm || selectedCategory !== "all" || priceFilter !== "all" || sortBy !== "name") && (
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>&nbsp;</label>
                <button onClick={clearAllFilters} style={styles.clearFiltersBtn} type="button">
                  <i className="fas fa-times"></i> Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div style={styles.resultsBar}>
          <div style={styles.resultsCount}>
            <i className="fas fa-list" style={styles.resultsIcon}></i>
            Showing {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div style={styles.servicesGrid}>
            {filteredServices.map((service) => {
              const id = service.service_id ?? service.id;
              const rating = Number(service.avg_rating ?? 0);
              const reviews = Number(service.review_count ?? 0);

              return (
                <div key={id} style={styles.serviceCard}>
                  {service.popular && (
                    <div style={styles.popularBadge}>
                      <i className="fas fa-star"></i> Popular
                    </div>
                  )}

                  <img
                    src={service.image}
                    alt={service.name}
                    style={styles.cardImage}
                    onError={(e) => setImgFallback(e, FALLBACK_IMG)}
                  />

                  <div style={styles.serviceHeader}>
                    <h3 style={styles.serviceName}>{service.name}</h3>
                    <p style={styles.serviceCategory}>{service.category_name}</p>
                  </div>

                  <p style={styles.serviceDescription}>{service.description}</p>

                  <div style={styles.serviceRating}>
                    <div style={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.floor(rating) ? "filled" : ""}`}
                          style={styles.star}
                        ></i>
                      ))}
                    </div>
                    <span style={styles.ratingText}>
                      {rating.toFixed(1)} ({reviews} reviews)
                    </span>
                  </div>

                  <div style={styles.serviceMeta}>
                    <span style={styles.serviceDuration}>
                      <i className="fas fa-clock"></i> {service.duration_minutes} mins
                    </span>
                    <span style={styles.servicePrice}>RM {Number(service.price).toFixed(2)}</span>
                  </div>

                  <div style={styles.serviceActions}>
                    <button type="button" style={styles.bookButton} onClick={() => openDrawerForService(service)}>
                      <i className="fas fa-calendar-plus"></i> Reserve
                    </button>

                    <button
                      style={styles.detailsButton}
                      type="button"
                      onClick={() => alert(`Service: ${service.name}\n\n${service.description}`)}
                    >
                      <i className="fas fa-info-circle"></i> Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.noResults}>
            <i className="fas fa-search" style={styles.noResultsIcon}></i>
            <h3 style={styles.noResultsTitle}>No services found</h3>
            <p style={styles.noResultsText}>
              {searchTerm ? `No services match "${searchTerm}"` : "No services match your filters"}
            </p>
            <button onClick={clearAllFilters} style={styles.clearFiltersButton} type="button">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} UNISPA Masmed UiTM Shah Alam. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ==============================
          RIGHT SLIDE-IN RESERVE DRAWER
         ============================== */}
      <div
        aria-hidden={!drawerOpen}
        style={{
          ...drawerStyles.overlay,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) closeDrawer();
        }}
      >
        <aside
          style={{
            ...drawerStyles.panel,
            transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div style={drawerStyles.header}>
            <div style={{ minWidth: 0 }}>
              <div style={drawerStyles.kicker}>Reserve</div>
              <div style={drawerStyles.title} title={selectedService?.name || "Choose a service"}>
                {selectedService?.name || "Choose a service"}
              </div>
            </div>

            <button type="button" onClick={closeDrawer} style={drawerStyles.closeBtn} aria-label="Close">
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Body */}
          <div style={drawerStyles.body}>
            {/* Stepper */}
            <div style={drawerStyles.stepper}>
              <StepDot active={drawerStep >= 1} label="Service" />
              <StepLine />
              <StepDot active={drawerStep >= 2} label="Guests" />
              <StepLine />
              <StepDot active={drawerStep >= 3} label="Details" />
              <StepLine />
              <StepDot active={drawerStep >= 4} label="Confirm" />
            </div>

            {drawerError ? <div style={drawerStyles.errorBox}>{drawerError}</div> : null}

            {/* STEP 1: pick service if none selected */}
            {drawerStep === 1 && (
              <div>
                {!selectedService ? (
                  <>
                    <p style={drawerStyles.help}>
                      Select a service to continue. (All participants will receive the same service.)
                    </p>

                    <div style={drawerStyles.pickList}>
                      {normalizedServices.slice(0, 12).map((sv) => (
                        <button
                          key={sv.service_id}
                          type="button"
                          style={drawerStyles.pickItem}
                          onClick={() => {
                            setSelectedService(sv);
                            setDrawerError("");
                            setDrawerStep(2);
                          }}
                        >
                          <div style={{ fontWeight: 800 }}>{sv.name}</div>
                          <div style={{ fontSize: 12, opacity: 0.8 }}>
                            RM {Number(sv.price).toFixed(2)} • {sv.duration_minutes} mins
                          </div>
                        </button>
                      ))}
                    </div>

                    <div style={drawerStyles.note}>Tip: open the drawer from a service card to preselect the service.</div>
                  </>
                ) : (
                  <>
                    <div style={drawerStyles.summaryCard}>
                      <img
                        src={selectedService.image}
                        alt={selectedService.name}
                        style={drawerStyles.summaryImg}
                        onError={(e) => setImgFallback(e, FALLBACK_DRAWER_IMG)}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={drawerStyles.summaryTitle}>{selectedService.name}</div>
                        <div style={drawerStyles.summaryMeta}>
                          RM {Number(selectedService.price).toFixed(2)} • {selectedService.duration_minutes} mins
                        </div>
                        <div style={drawerStyles.summaryText}>{selectedService.description || "No description."}</div>
                      </div>
                    </div>

                    <button type="button" style={drawerStyles.primaryBtn} onClick={() => setDrawerStep(2)}>
                      Continue <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: who + count */}
            {drawerStep === 2 && (
              <div>
                <h3 style={drawerStyles.h3}>Who is this booking for?</h3>

                <div style={drawerStyles.radioRow}>
                  <label style={drawerStyles.radioCard}>
                    <input
                      type="radio"
                      name="for"
                      value="self"
                      checked={bookingFor === "self"}
                      onChange={() => {
                        setBookingFor("self");
                        onChangePeopleCount(1);
                      }}
                    />
                    <div>
                      <div style={drawerStyles.radioTitle}>Me</div>
                      <div style={drawerStyles.radioSub}>Only your appointment</div>
                    </div>
                  </label>

                  <label style={drawerStyles.radioCard}>
                    <input
                      type="radio"
                      name="for"
                      value="both"
                      checked={bookingFor === "both"}
                      onChange={() => {
                        setBookingFor("both");
                        if (peopleCount < 2) onChangePeopleCount(2);
                      }}
                    />
                    <div>
                      <div style={drawerStyles.radioTitle}>Me + Others</div>
                      <div style={drawerStyles.radioSub}>Book for friends/family too</div>
                    </div>
                  </label>

                  <label style={drawerStyles.radioCard}>
                    <input
                      type="radio"
                      name="for"
                      value="others"
                      checked={bookingFor === "others"}
                      onChange={() => {
                        setBookingFor("others");
                        if (peopleCount < 2) onChangePeopleCount(2);
                      }}
                    />
                    <div>
                      <div style={drawerStyles.radioTitle}>Others</div>
                      <div style={drawerStyles.radioSub}>You book on behalf of others</div>
                    </div>
                  </label>
                </div>

                <div style={drawerStyles.field}>
                  <label style={drawerStyles.label}>Number of people (max 3 total)</label>
                  <select value={peopleCount} onChange={(e) => onChangePeopleCount(e.target.value)} style={drawerStyles.select}>
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "person" : "people"}
                      </option>
                    ))}
                  </select>

                  <div style={drawerStyles.miniNote}>
                    All {peopleCount} will receive the <b>same service</b>. If you want different services, make a separate booking.
                  </div>
                </div>

                <div style={drawerStyles.footerRow}>
                  <button type="button" style={drawerStyles.ghostBtn} onClick={() => setDrawerStep(1)}>
                    <i className="fas fa-arrow-left" /> Back
                  </button>
                  <button type="button" style={drawerStyles.primaryBtn} onClick={() => setDrawerStep(3)}>
                    Next <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: details */}
            {drawerStep === 3 && (
              <div>
                <h3 style={drawerStyles.h3}>Details</h3>

                {/* Self details */}
                <div style={drawerStyles.block}>
                  <div style={drawerStyles.blockTitle}>
                    <i className="fas fa-user" /> Your details
                  </div>
                  <div style={drawerStyles.grid2}>
                    <div>
                      <label style={drawerStyles.label}>Name *</label>
                      <input
                        value={guests[0]?.name || ""}
                        onChange={(e) => updateGuest(0, "name", e.target.value)}
                        style={drawerStyles.input}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label style={drawerStyles.label}>Phone *</label>
                      <input
                        value={guests[0]?.phone || ""}
                        onChange={(e) => updateGuest(0, "phone", e.target.value)}
                        style={drawerStyles.input}
                        placeholder="e.g. 0123456789"
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={drawerStyles.label}>Email (optional)</label>
                      <input
                        value={guests[0]?.email || ""}
                        onChange={(e) => updateGuest(0, "email", e.target.value)}
                        style={drawerStyles.input}
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Other guests */}
                {peopleCount > 1 && (
                  <div style={drawerStyles.block}>
                    <div style={drawerStyles.blockTitle}>
                      <i className="fas fa-users" /> Guests details
                    </div>

                    {Array.from({ length: peopleCount - 1 }).map((_, i) => {
                      const idx = i + 1;
                      const g = guests[idx] || { name: "", phone: "", email: "" };

                      return (
                        <div key={idx} style={drawerStyles.guestCard}>
                          <div style={drawerStyles.guestHeader}>Guest {idx}</div>

                          <div style={drawerStyles.grid2}>
                            <div>
                              <label style={drawerStyles.label}>Name *</label>
                              <input
                                value={g.name}
                                onChange={(e) => updateGuest(idx, "name", e.target.value)}
                                style={drawerStyles.input}
                                placeholder="Guest name"
                              />
                            </div>
                            <div>
                              <label style={drawerStyles.label}>Phone *</label>
                              <input
                                value={g.phone}
                                onChange={(e) => updateGuest(idx, "phone", e.target.value)}
                                style={drawerStyles.input}
                                placeholder="Guest phone"
                              />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <label style={drawerStyles.label}>Email (optional)</label>
                              <input
                                value={g.email || ""}
                                onChange={(e) => updateGuest(idx, "email", e.target.value)}
                                style={drawerStyles.input}
                                placeholder="guest@email.com"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={drawerStyles.footerRow}>
                  <button type="button" style={drawerStyles.ghostBtn} onClick={() => setDrawerStep(2)}>
                    <i className="fas fa-arrow-left" /> Back
                  </button>
                  <button type="button" style={drawerStyles.primaryBtn} onClick={() => setDrawerStep(4)}>
                    Review <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: confirm */}
            {drawerStep === 4 && (
              <div>
                <h3 style={drawerStyles.h3}>Confirm & Add to Cart</h3>

                <div style={drawerStyles.summaryBox}>
                  <div style={drawerStyles.summaryRow}>
                    <div style={drawerStyles.summaryKey}>Service</div>
                    <div style={drawerStyles.summaryVal}>{selectedService?.name || "-"}</div>
                  </div>
                  <div style={drawerStyles.summaryRow}>
                    <div style={drawerStyles.summaryKey}>People</div>
                    <div style={drawerStyles.summaryVal}>{peopleCount}</div>
                  </div>
                  <div style={drawerStyles.summaryRow}>
                    <div style={drawerStyles.summaryKey}>Price (per person)</div>
                    <div style={drawerStyles.summaryVal}>RM {Number(selectedService?.price || 0).toFixed(2)}</div>
                  </div>
                  <div style={drawerStyles.summaryRow}>
                    <div style={drawerStyles.summaryKey}>Estimated total</div>
                    <div style={{ ...drawerStyles.summaryVal, fontWeight: 900 }}>
                      RM {(Number(selectedService?.price || 0) * peopleCount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={drawerStyles.miniNote}>Next you’ll choose date & time on the schedule step.</div>

                <div style={drawerStyles.footerRow}>
                  <button type="button" style={drawerStyles.ghostBtn} onClick={() => setDrawerStep(3)}>
                    <i className="fas fa-arrow-left" /> Back
                  </button>

                  <button
                    type="button"
                    style={{
                      ...drawerStyles.primaryBtn,
                      opacity: submitting ? 0.8 : 1,
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}
                    onClick={addToCart}
                    disabled={submitting}
                  >
                    {submitting ? "Adding..." : "Add to Cart"} <i className="fas fa-shopping-cart" style={{ marginLeft: 8 }} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer (persistent) */}
          <div style={drawerStyles.bottomBar}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              <i className="fas fa-lock" /> Secure booking • Press ESC to close
            </div>
            <div style={{ fontWeight: 900 }}>
              {selectedService ? `RM ${(Number(selectedService.price || 0) * peopleCount).toFixed(2)}` : ""}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* Small stepper components */
function StepDot({ active, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: active ? "#3b82f6" : "#e5e7eb",
        }}
      />
      <div style={{ fontSize: 11, fontWeight: 800, color: active ? "#111827" : "#6b7280" }}>{label}</div>
    </div>
  );
}
function StepLine() {
  return <div style={{ flex: 1, height: 2, background: "#e5e7eb", marginTop: 6 }} />;
}

/* Existing styles + small upgrades */
const styles = {
  body: {
    fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
    backgroundColor: "#f9fafb",
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    color: "#1f2937",
  },

  navbar: {
    background: "linear-gradient(135deg, #5d3a7f 0%, #8a6dad 100%)",
    color: "white",
    padding: "0",
    boxShadow: "0 4px 20px rgba(93, 58, 127, 0.3)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "70px",
  },
  navLogo: { display: "flex", alignItems: "center", gap: "12px", fontSize: "1.5rem", fontWeight: "700" },
  navLogoIcon: { fontSize: "2rem", color: "#d4afb9", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" },
  navLogoText: {
    background: "linear-gradient(45deg, #d4afb9, #ffffff)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontWeight: "800",
    letterSpacing: "0.5px",
  },
  navLinks: { display: "flex", gap: "10px", alignItems: "center" },
  navLink: {
    color: "rgba(255, 255, 255, 0.9)",
    textDecoration: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    fontSize: "1rem",
    background: "rgba(255,255,255,0.05)",
  },
  navLinkActive: {
    background: "rgba(255, 255, 255, 0.15)",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  userGreeting: {
    display: "flex",
    alignItems: "center",
    color: "white",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "1rem",
  },
  logoutLink: { color: "rgba(255,255,255,0.8)", textDecoration: "none", marginLeft: "15px", fontSize: "1.1rem" },

  hero: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #3b82f6 100%)",
    color: "white",
    padding: "46px 20px",
    textAlign: "center",
  },
  heroContent: { maxWidth: "900px", margin: "0 auto" },
  heroTitle: {
    fontSize: "2.6rem",
    fontWeight: "900",
    margin: "0 0 12px 0",
    textShadow: "1px 1px 3px rgba(0,0,0,0.25)",
  },
  heroSubtitle: { fontSize: "1.05rem", opacity: 0.92, margin: 0, lineHeight: 1.6 },
  heroCta: {
    marginTop: 18,
    border: "none",
    cursor: "pointer",
    background: "white",
    color: "#0f172a",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 12px 30px rgba(0,0,0,0.20)",
  },

  mainContent: { maxWidth: "1200px", margin: "0 auto", padding: "30px 20px" },

  searchSection: { marginBottom: "30px" },
  searchContainer: { position: "relative", maxWidth: "800px", margin: "0 auto" },
  searchIcon: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    fontSize: "1.1rem",
  },
  searchInput: {
    width: "100%",
    padding: "16px 20px 16px 50px",
    fontSize: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "white",
    outline: "none",
  },
  clearSearchButton: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "4px",
  },

  advancedFilters: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  filterRow: { display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "end" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "8px", minWidth: "180px", flex: 1 },
  filterLabel: { fontSize: "0.9rem", fontWeight: "600", color: "#374151" },

  dropdownContainer: { position: "relative" },
  dropdownButton: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "white",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#374151",
  },
  dropdownCount: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
    fontSize: "0.8rem",
    padding: "2px 8px",
    borderRadius: "12px",
    marginLeft: "8px",
  },
  dropdownArrow: { color: "#9ca3af", fontSize: "0.9rem" },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    zIndex: 1000,
    maxHeight: "300px",
    overflowY: "auto",
    marginTop: "4px",
  },
  dropdownItem: {
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
  },
  dropdownItemText: { flex: 1, fontSize: "0.95rem", color: "#374151" },
  dropdownItemCount: { backgroundColor: "#f3f4f6", color: "#6b7280", fontSize: "0.8rem", padding: "2px 8px", borderRadius: "12px" },
  checkIcon: { color: "#10b981", fontSize: "0.9rem" },

  selectInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    color: "#374151",
    backgroundColor: "white",
    cursor: "pointer",
    outline: "none",
  },

  clearFiltersBtn: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  resultsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "16px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  resultsCount: { fontSize: "0.95rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "8px" },
  resultsIcon: { color: "#9ca3af" },

  servicesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", marginBottom: "40px" },
  serviceCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: 180, objectFit: "cover" },
  popularBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    backgroundColor: "#fbbf24",
    color: "#78350f",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    zIndex: 1,
    pointerEvents: "none",
  },

  serviceHeader: { padding: "18px 18px 0 18px" },
  serviceName: { fontSize: "1.2rem", fontWeight: "900", color: "#0f172a", margin: "0 0 8px 0" },
  serviceCategory: { fontSize: "0.85rem", color: "#6b7280", fontWeight: "700", margin: 0 },

  serviceDescription: { padding: "12px 18px 0 18px", fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, flex: 1 },

  serviceRating: { padding: "12px 18px 0 18px", display: "flex", alignItems: "center", gap: "8px" },
  stars: { display: "flex", gap: "2px" },
  star: { fontSize: "0.9rem", color: "#fbbf24" },
  ratingText: { fontSize: "0.85rem", color: "#6b7280", fontWeight: 700 },

  serviceMeta: { padding: "12px 18px 14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  serviceDuration: { fontSize: "0.9rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 },
  servicePrice: { fontSize: "1.15rem", fontWeight: "900", color: "#1e40af" },

  serviceActions: { padding: 18, display: "flex", gap: "12px", flexWrap: "wrap" },
  bookButton: {
    flex: 2,
    backgroundColor: "#111827",
    color: "white",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "900",
    fontSize: "0.95rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    cursor: "pointer",
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#111827",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "900",
    fontSize: "0.95rem",
    border: "1.5px solid #111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
  },

  noResults: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "12px",
    marginBottom: "40px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  noResultsIcon: { fontSize: "3rem", color: "#d1d5db", marginBottom: "20px" },
  noResultsTitle: { fontSize: "1.5rem", fontWeight: "900", color: "#0f172a", margin: "0 0 12px 0" },
  noResultsText: { fontSize: "1rem", color: "#6b7280", marginBottom: "24px", fontWeight: 700 },
  clearFiltersButton: { backgroundColor: "#111827", color: "white", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: "900", cursor: "pointer" },

  footer: { backgroundColor: "#0f172a", color: "#f9fafb", marginTop: "40px" },
  footerBottom: { borderTop: "1px solid #1f2937", padding: "24px 20px", textAlign: "center" },
  copyright: { fontSize: "0.9rem", color: "#9ca3af", margin: 0, fontWeight: 700 },
};

/* Drawer styles (RIGHT slide-in) */
const drawerStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(6px)",
    zIndex: 2000,
    transition: "opacity 180ms ease",
    display: "flex",
    justifyContent: "flex-end",
  },
  panel: {
    height: "100%",
    width: "min(520px, 96vw)",
    background: "white",
    boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
    transition: "transform 220ms ease",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "18px 18px 14px 18px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
  },
  kicker: { fontSize: 12, fontWeight: 900, letterSpacing: 1, color: "#64748b", textTransform: "uppercase" },
  title: { fontSize: 18, fontWeight: 900, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  closeBtn: {
    border: "none",
    background: "#f1f5f9",
    width: 38,
    height: 38,
    borderRadius: 12,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "#0f172a",
  },
  body: { padding: 18, overflowY: "auto", flex: 1 },
  stepper: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 },

  help: { marginTop: 0, color: "#475569", fontWeight: 700, lineHeight: 1.6 },
  pickList: { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 12 },
  pickItem: { textAlign: "left", border: "1px solid #e5e7eb", background: "white", padding: 12, borderRadius: 14, cursor: "pointer" },
  note: { marginTop: 10, fontSize: 12, color: "#64748b", fontWeight: 700 },

  summaryCard: { display: "flex", gap: 12, border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" },
  summaryImg: { width: 120, height: 100, objectFit: "cover", flexShrink: 0 },
  summaryTitle: { fontWeight: 900, color: "#0f172a", paddingTop: 10, paddingRight: 10 },
  summaryMeta: { fontSize: 12, fontWeight: 900, color: "#1e40af", marginTop: 4 },
  summaryText: { fontSize: 12, color: "#475569", marginTop: 6, paddingRight: 10, lineHeight: 1.5 },

  h3: { margin: "10px 0 12px 0", color: "#0f172a", fontWeight: 900 },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: 12,
    marginBottom: 12,
    fontWeight: 900,
    fontSize: 13,
  },

  radioRow: { display: "grid", gridTemplateColumns: "1fr", gap: 10, marginBottom: 14 },
  radioCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    gap: 12,
    alignItems: "center",
    cursor: "pointer",
    background: "white",
  },
  radioTitle: { fontWeight: 900, color: "#0f172a" },
  radioSub: { fontSize: 12, color: "#64748b", fontWeight: 700, marginTop: 2 },

  field: { marginTop: 10 },
  label: { display: "block", fontSize: 12, fontWeight: 900, color: "#334155", marginBottom: 6 },
  select: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, fontWeight: 800, outline: "none" },
  input: { width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, fontWeight: 800, outline: "none" },
  miniNote: { marginTop: 8, fontSize: 12, color: "#64748b", fontWeight: 700, lineHeight: 1.5 },

  block: { marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#ffffff" },
  blockTitle: { fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 },

  guestCard: { marginTop: 10, borderTop: "1px dashed #e5e7eb", paddingTop: 10 },
  guestHeader: { fontWeight: 900, color: "#0f172a", marginBottom: 8 },

  summaryBox: { border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#f8fafc" },
  summaryRow: { display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px dashed #e5e7eb" },
  summaryKey: { fontSize: 12, color: "#64748b", fontWeight: 900 },
  summaryVal: { fontSize: 13, color: "#0f172a", fontWeight: 800, textAlign: "right" },

  footerRow: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14 },
  primaryBtn: {
    border: "none",
    background: "#111827",
    color: "white",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  ghostBtn: {
    border: "1px solid #e5e7eb",
    background: "white",
    color: "#111827",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  bottomBar: {
    borderTop: "1px solid #e5e7eb",
    padding: "12px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
