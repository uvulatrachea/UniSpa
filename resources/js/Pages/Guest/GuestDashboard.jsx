import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react"; // ✅ router + usePage added

export default function GuestDashboard({ stats, promotions, services }) {
  const { auth } = usePage().props;
  const isLoggedIn = !!auth?.customer;
  const username = "Guest";

  const [slide, setSlide] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);

  const [navScrolled, setNavScrolled] = useState(false);
  const heroRef = useRef(null);

  const openLoginModal = (href = null) => {
    // If already logged in, redirect to customer dashboard (or pending action)
    if (isLoggedIn) {
      router.visit(href || '/customer/dashboard');
      return;
    }
    setPendingHref(href);
    setLoginModalOpen(true);
  };

  // ✅ FIXED LOGIN REDIRECT (Inertia-safe)
const goLogin = () => {
  const redirect = pendingHref ? `?redirect=${encodeURIComponent(pendingHref)}` : "";

  // Force Laravel (change 8000 if your Laravel port is different)
  const laravelBase = `${window.location.protocol}//${window.location.hostname}:8000`;
  window.location.assign(`${laravelBase}/customer/login${redirect}`);
};


  // Promotions from DB
  const promoSlides = useMemo(() => {
    const list = Array.isArray(promotions) ? promotions : [];
    return list
      .filter((p) => p && p.promotion_id)
      .map((p) => ({
        id: p.promotion_id,
        title: p.title || "Promotion",
        description: p.description || "",
        image: p.banner_image || "",
        badge:
          String(p.discount_type).toLowerCase() === "percentage"
            ? `${p.discount_value}% OFF`
            : `RM${p.discount_value} OFF`,
        // for guests: send to guest services (NOT customer booking services)
        link: "/guest/services",
      }));
  }, [promotions]);

  // Services from DB
  const allServices = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    return list
      .filter((s) => s && (s.id || s.service_id))
      .map((s) => ({
        service_id: s.id ?? s.service_id,
        name: s.name ?? "Service",
        description: s.description ?? "",
        price: s.price ?? 0,
        duration_minutes: s.duration_minutes ?? 0,
        image: s.image_url || "https://via.placeholder.com/800x500/5B21B6/ffffff?text=UniSpa+Service",
      }));
  }, [services]);

  // Carousel auto-play
  useEffect(() => {
    if (!promoSlides.length) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % promoSlides.length), 5000);
    return () => clearInterval(t);
  }, [promoSlides.length]);

  // Navbar shadow/blur on scroll
  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 6);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll reveal (IntersectionObserver)
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;

    // Ensure base class exists
    nodes.forEach((el) => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
      const dir = el.getAttribute("data-reveal");
      if (dir === "left") el.classList.add("reveal-left");
      if (dir === "right") el.classList.add("reveal-right");
      if (dir === "down") el.classList.add("reveal-down");

      const delay = Number(el.getAttribute("data-delay") || 0);
      if (!Number.isNaN(delay) && delay > 0) el.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // Hero parallax (subtle background motion similar to reference)
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const el = heroRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const h = Math.max(rect.height, 1);
        const progress = Math.min(1, Math.max(0, (0 - rect.top) / h));

        // 0..1 as hero scrolls out; apply small translate + scale
        el.style.setProperty("--heroParallax", String(progress));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (promoSlides.length && slide >= promoSlides.length) setSlide(0);
  }, [promoSlides.length, slide]);

  // Stats (fallback 0)
  const totalStaff = stats?.totalStaff ?? 0;
  const generalStaff = stats?.generalStaff ?? 0;
  const studentStaff = stats?.studentStaff ?? 0;
  const averageRating = stats?.avgRating ?? 0;
  const totalServices = stats?.totalServices ?? 0;
  const completedBookings = stats?.completedBookings ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-slate-100 transition ${
          navScrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-unispa-primaryDark flex items-center justify-center text-white font-extrabold">
              U
            </div>
            <div className="font-extrabold text-slate-800">UNISPA Masmed UiTM</div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/guest/dashboard" className="navBtn">Dashboard</Link>
            <Link href="/guest/services" className="navBtn">Services</Link>
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/customer/dashboard"
                  className="px-4 py-2 rounded-full border-2 border-unispa-primaryDark text-unispa-primaryDark font-extrabold hover:bg-unispa-muted"
                >
                  My Dashboard
                </Link>
                <Link
                  href="/booking/services"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary text-white font-extrabold shadow hover:opacity-95"
                >
                  Book Now
                </Link>
              </>
            ) : (
              <>
                <RequireLoginLink
                  onRequire={() => openLoginModal(null)}
                  className="px-4 py-2 rounded-full border-2 border-unispa-primaryDark text-unispa-primaryDark font-extrabold hover:bg-unispa-muted"
                >
                  Login
                </RequireLoginLink>
                <RequireLoginLink
                  onRequire={() => openLoginModal("/appointment/appointment-i")}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary text-white font-extrabold shadow hover:opacity-95"
                >
                  Book Now
                </RequireLoginLink>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="h-14" />

      {/* HERO / PROMO */}
      <section id="hero" ref={heroRef} className="relative w-full">
        {promoSlides.length ? (
          <div className="relative h-[420px] sm:h-[520px] lg:h-[600px] overflow-hidden">
            {promoSlides.map((p, i) => (
              <div
                key={p.id}
                className={`unispa-heroSlide absolute inset-0 transition-opacity duration-700 ${
                  i === slide
                    ? "opacity-100 pointer-events-auto z-10 is-active"
                    : "opacity-0 pointer-events-none z-0"
                }`}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/1600x600/5B21B6/ffffff?text=UniSpa+Promotion";
                  }}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-unispa-primaryDark/80 via-unispa-primary/50 to-transparent" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(1200px 600px at 10% 40%, rgba(255,255,255,0.14), transparent 60%)" }} />

                <div className="absolute inset-0">
                  <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="unispa-heroCopy max-w-2xl text-white">
                      <span className="inline-flex items-center rounded-full bg-white/80 text-unispa-primaryDark px-4 py-1 text-sm font-extrabold">
                        {p.badge}
                      </span>

                      <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow">
                        {p.title}
                      </h1>

                      <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Guests can browse services without login */}
                      <Link
                        href={p.link}
                        className="mt-7 inline-flex items-center gap-3 rounded-full bg-white text-unispa-primaryDark px-7 py-3 font-extrabold shadow-lg hover:scale-[1.02] transition"
                      >
                        <i className="fas fa-spa" /> Browse Services
                      </Link>

                      <div className="mt-6 flex items-center gap-3">
                        {promoSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSlide(idx)}
                            className={`h-3 w-3 rounded-full transition ${idx === slide ? "bg-white" : "bg-white/40"}`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setSlide((s) => (s - 1 + promoSlides.length) % promoSlides.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white w-11 h-11 sm:w-14 sm:h-14 backdrop-blur flex items-center justify-center hover:bg-white/30 z-20"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button
              onClick={() => setSlide((s) => (s + 1) % promoSlides.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white w-11 h-11 sm:w-14 sm:h-14 backdrop-blur flex items-center justify-center hover:bg-white/30 z-20"
            >
              <i className="fas fa-chevron-right" />
            </button>

            {/* Scroll hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-white/90">
              <button
                type="button"
                onClick={() => document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex flex-col items-center gap-2"
                aria-label="Scroll to highlights"
              >
                <span className="text-xs font-extrabold tracking-[0.18em] uppercase">Scroll</span>
                <span className="unispa-scrollHint grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <i className="fas fa-chevron-down" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[320px] sm:h-[400px] lg:h-[460px] bg-gradient-to-r from-unispa-primaryDark to-unispa-primary flex items-center justify-center text-center px-6">
            <div className="text-white max-w-xl">
              <div className="text-5xl mb-4"><i className="fas fa-bullhorn" /></div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">No Promotions Right Now</h2>
              <p className="mt-3 text-white/90 font-semibold">
                Admin hasn’t added active promotions yet. Please check again later.
              </p>
              <Link
                href="/guest/services"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-unispa-primaryDark px-6 py-3 font-extrabold shadow hover:opacity-95"
              >
                <i className="fas fa-spa" /> Browse Services
              </Link>
            </div>
          </div>
        )}
      </section>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Welcome + stats */}
        <section id="highlights" data-reveal className="rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="text-unispa-primaryDark text-5xl sm:text-6xl">
              <i className="fas fa-user-circle" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-unispa-primaryDark">
                Welcome to Uni-Spa, {username}!
              </h2>
              <p className="mt-1 text-slate-600 font-semibold">
                UiTM&apos;s premier student-run wellness center
              </p>
            </div>
          </div>

          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-unispa-primary/20 to-transparent" />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard dataDelay={0} icon="fas fa-users" title={totalStaff} subtitle="Total Staff" sub2={`(${generalStaff} general, ${studentStaff} student)`} />
            <StatCard dataDelay={80} icon="fas fa-star" title={Number(averageRating).toFixed(1)} subtitle="Average Rating" sub2="From customer reviews" />
            <StatCard dataDelay={160} icon="fas fa-spa" title={totalServices} subtitle="Services" sub2="Available treatments" />
            <StatCard dataDelay={240} icon="fas fa-calendar-check" title={completedBookings} subtitle="Completed" sub2="Total bookings" />
          </div>
        </section>

        {/* Services preview (NO appointments section) */}
        <section id="popular" data-reveal="down" className="mt-10 rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7 lg:p-10">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-unispa-primaryDark">Popular Services</h3>
            <p className="mt-1 text-slate-600 font-semibold">Browse services from the database</p>

            {/* ✅ guest services page (no login) */}
            <Link
              href="/guest/services"
              className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-unispa-primaryDark px-5 py-3 text-unispa-primaryDark font-bold hover:bg-unispa-muted"
            >
              View All Services <i className="fas fa-arrow-right" />
            </Link>
          </div>

          {allServices.length ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {allServices.slice(0, 8).map((s, idx) => (
                <div
                  key={s.service_id}
                  data-reveal={idx % 2 === 0 ? "left" : "right"}
                  data-delay={Math.min(280, idx * 60)}
                  className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white flex flex-col transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-44 w-full object-cover"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x500/5B21B6/ffffff?text=UniSpa+Service")}
                  />

                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-extrabold text-slate-800">{s.name}</h4>

                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600 font-semibold">
                      <span><i className="fas fa-clock" /> {s.duration_minutes} mins</span>
                      <span><i className="fas fa-tag" /> RM{s.price}</span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">{s.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {/* ✅ Details allowed for guests */}
                      <Link
                        href={`/booking/services/${s.service_id}`}
                        className="inline-flex justify-center items-center gap-2 rounded-lg border-2 border-unispa-primaryDark px-3 py-2 text-unispa-primaryDark font-bold hover:bg-unispa-muted text-sm"
                      >
                        <i className="fas fa-info-circle" /> Details
                      </Link>

                      {/* ✅ Book/Reserve requires login */}
                      {isLoggedIn ? (
                        <Link
                          href={`/booking/services/${s.service_id}`}
                          className="inline-flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-3 py-2 text-white font-bold shadow text-sm"
                        >
                          <i className="fas fa-calendar-plus" /> Book Now
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openLoginModal(`/appointment/appointment-i?service=${s.service_id}`)}
                          className="inline-flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-3 py-2 text-white font-bold shadow text-sm"
                        >
                          <i className="fas fa-calendar-plus" /> Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-8 text-center">
              <div className="text-4xl text-slate-300"><i className="fas fa-spa" /></div>
              <p className="mt-3 text-slate-600 font-semibold">No services found in database yet.</p>
              <p className="text-sm text-slate-500 mt-1">Add services into table <b>service</b> to display them here.</p>
              <Link
                href="/guest/services"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 text-white font-bold shadow"
              >
                <i className="fas fa-spa" /> Go to Services Page
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* LOGIN MODAL */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLoginModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
                <i className="fas fa-lock" />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-extrabold text-slate-800">Login required</h4>
                <p className="mt-1 text-sm text-slate-600 font-medium">
                  Please log in or create an account to continue.
                </p>
                {pendingHref ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Action: <span className="font-bold">{pendingHref}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="w-full rounded-full border-2 border-slate-200 px-5 py-3 font-extrabold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={goLogin}
                className="w-full rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 font-extrabold text-white shadow hover:opacity-95"
              >
                Login / Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* hero parallax via CSS variable set by JS */
        .unispa-heroSlide img {
          transform: translate3d(0, calc(var(--heroParallax, 0) * 18px), 0) scale(calc(1 + var(--heroParallax, 0) * 0.06));
          transition: transform 120ms linear;
          will-change: transform;
        }

        .navBtn {
          padding: 8px 14px;
          border-radius: 9999px;
          font-weight: 800;
          color: #0f172a;
        }
        .navBtn:hover { background: rgba(91,33,182,0.08); }
      `}</style>
    </div>
  );
}

function RequireLoginLink({ onRequire, children, className = "" }) {
  return (
    <button type="button" onClick={onRequire} className={className}>
      {children}
    </button>
  );
}

function StatCard({ icon, title, subtitle, sub2, dataDelay = 0 }) {
  return (
    <div
      data-reveal="down"
      data-delay={dataDelay}
      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5 transition hover:shadow-md"
    >
      <div className="h-14 w-14 rounded-xl bg-unispa-muted text-unispa-primaryDark flex items-center justify-center text-xl">
        <i className={icon} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold text-slate-800 leading-tight">{title}</div>
        <div className="text-sm font-bold text-unispa-primaryDark">{subtitle}</div>
        <div className="text-xs text-slate-500 font-semibold">{sub2}</div>
      </div>
    </div>
  );
}
