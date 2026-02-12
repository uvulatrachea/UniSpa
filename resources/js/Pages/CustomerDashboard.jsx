import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function CustomerDashboard({ auth, stats, promotions, appointments, services, favoriteServices = [], goToService = null, notifications = [] }) {
  const user = auth?.user || {};
  const username = user?.name || "Guest";

  const [slide, setSlide] = useState(0);

  // ✅ Promotions STRICTLY from DB (no fallback array)
  const promoSlides = useMemo(() => {
    const list = Array.isArray(promotions) ? promotions : [];

    return list
      .filter((p) => p && p.promotion_id)
      .map((p) => ({
        id: p.promotion_id,
        title: p.title || "Promotion",
        description: p.description || "",
        image: p.banner_image || "",
        link: p.service_id
          ? `/appointment/appointment-i?service=${p.service_id}`
          : "/appointment/appointment-i",
        badge:
          String(p.discount_type).toLowerCase() === "percentage"
            ? `${p.discount_value}% OFF`
            : `RM${p.discount_value} OFF`,
      }));
  }, [promotions]);

  // ✅ Services STRICTLY from DB (no fallback array)
  const allServices = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    return list
      .filter((s) => s && (s.service_id || s.id))
      .map((s) => ({
        service_id: s.service_id ?? s.id,
        name: s.name ?? "Service",
        description: s.description ?? "",
        price: s.price ?? 0,
        duration_minutes: s.duration_minutes ?? 0,
        image:
          s.image ||
          "https://placehold.co/800x500/5B21B6/ffffff?text=UniSpa+Service",
      }));
  }, [services]);

  // ✅ Carousel auto-play only if we have promos
  useEffect(() => {
    if (!promoSlides.length) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % promoSlides.length), 5000);
    return () => clearInterval(t);
  }, [promoSlides.length]);

  // ✅ Reset slide index if list changed
  useEffect(() => {
    if (promoSlides.length && slide >= promoSlides.length) setSlide(0);
  }, [promoSlides.length, slide]);

  // Stats (fallback to 0, not fake data)
  const totalStaff = stats?.totalStaff ?? 0;
  const generalStaff = stats?.generalStaff ?? 0;
  const studentStaff = stats?.studentStaff ?? 0;
  const averageRating = stats?.avgRating ?? 0;
  const totalServices = stats?.totalServices ?? 0;
  const totalCustomers = stats?.totalCustomers ?? 0;
  const completedBookings = stats?.completedBookings ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;

  return (
    <CustomerLayout title="Dashboard" active="dashboard" className="overflow-x-hidden">

      {/* HERO / CAROUSEL */}
      <section className="relative w-full">
        {promoSlides.length ? (
          <div className="relative h-[420px] sm:h-[520px] lg:h-[600px] overflow-hidden">
            {promoSlides.map((p, i) => (
              <div
                key={p.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === slide
                    ? "opacity-100 pointer-events-auto z-10"
                    : "opacity-0 pointer-events-none z-0"
                }`}
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/1600x600/5B21B6/ffffff?text=UniSpa+Promotion";
                  }}
                />

                {/* IMPORTANT: never block clicks */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-unispa-primaryDark/80 via-unispa-primary/50 to-transparent" />

                <div className="absolute inset-0">
                  <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center">
                    <div className="max-w-2xl text-white">
                      <span className="inline-flex items-center rounded-full bg-white/80 text-unispa-primaryDark px-4 py-1 text-sm font-extrabold">
                        {p.badge}
                      </span>

                      <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow">
                        {p.title}
                      </h1>

                      <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
                        {p.description}
                      </p>

                      <Link
                        href="/reviews"
                        className="mt-7 inline-flex items-center gap-3 rounded-full bg-white text-unispa-primaryDark px-7 py-3 font-extrabold shadow-lg hover:scale-[1.02] transition"
                      >
                        <i className="fas fa-star" /> Read Reviews
                      </Link>

                      <div className="mt-6 flex items-center gap-3">
                        {promoSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSlide(idx)}
                            className={`h-3 w-3 rounded-full transition ${
                              idx === slide ? "bg-white" : "bg-white/40"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* arrows */}
            <button
              onClick={() => setSlide((s) => (s - 1 + promoSlides.length) % promoSlides.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white w-11 h-11 sm:w-14 sm:h-14 backdrop-blur flex items-center justify-center hover:bg-white/30 z-20"
              aria-label="Previous slide"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button
              onClick={() => setSlide((s) => (s + 1) % promoSlides.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white w-11 h-11 sm:w-14 sm:h-14 backdrop-blur flex items-center justify-center hover:bg-white/30 z-20"
              aria-label="Next slide"
            >
              <i className="fas fa-chevron-right" />
            </button>
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
                href="/booking/services"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-unispa-primaryDark px-6 py-3 font-extrabold shadow hover:opacity-95"
              >
                <i className="fas fa-spa" /> Browse Services
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Welcome card */}
        <section className="rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7 lg:p-10">
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

          {/* Responsive stats grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              icon="fas fa-users"
              title={totalStaff}
              subtitle="Total Staff"
              sub2={`(${generalStaff} general, ${studentStaff} student)`}
            />
            <StatCard
              icon="fas fa-star"
              title={Number(averageRating).toFixed(1)}
              subtitle="Average Rating"
              sub2="From customer reviews"
            />
            <StatCard icon="fas fa-spa" title={totalServices} subtitle="Services" sub2="Available treatments" />
            <StatCard icon="fas fa-calendar-check" title={completedBookings} subtitle="Completed" sub2="Total bookings" />
          </div>
        </section>

        {/* Appointments */}
        <section className="mt-8 sm:mt-10 rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-unispa-muted text-unispa-primaryDark flex items-center justify-center text-xl">
                <i className="fas fa-calendar-alt" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">Your Appointments</h3>
            </div>

            <Link
              href="/appointment/appointment-i"
              className="inline-flex justify-center items-center gap-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 text-white font-bold shadow hover:opacity-95"
            >
              <i className="fas fa-plus" /> Book Now
            </Link>
          </div>

          <p className="mt-4 text-slate-600 font-medium">
            View and manage your upcoming spa appointments.
          </p>

          <div className="mt-5 space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {appointments?.length ? (
              appointments.map((a) => (
                <div
                  key={a.booking_id}
                  className="flex flex-col lg:flex-row lg:items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5"
                >
                  <div className="w-full lg:w-auto flex items-center gap-4">
                    <div className="min-w-[82px] rounded-xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary text-white px-4 py-3 text-center shadow">
                      <div className="text-2xl font-extrabold">{new Date(a.slot_date).getDate()}</div>
                      <div className="text-xs font-bold tracking-widest">
                        {new Date(a.slot_date).toLocaleString("default", { month: "short" }).toUpperCase()}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-lg font-extrabold text-slate-800 truncate">{a.service_name}</div>
                      <div className="text-sm text-slate-600 font-semibold">
                        {a.start_time} - {a.end_time}
                      </div>
                      <div className="text-sm text-slate-500 italic">Therapist: {a.staff_name}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
                    <StatusBadge status={a.status} />
                    <Link
                      href={`/bookings/${a.booking_id}`}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-unispa-primaryDark px-4 py-2 text-unispa-primaryDark font-bold hover:bg-unispa-muted"
                    >
                      <i className="fas fa-eye" /> View
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-8 text-center">
                <div className="text-4xl text-slate-300">
                  <i className="fas fa-calendar-times" />
                </div>
                <p className="mt-3 text-slate-600 font-semibold">No appointments yet</p>
                <Link
                  href="/appointment/appointment-i"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 text-white font-bold shadow"
                >
                  <i className="fas fa-plus" /> Book Your First Appointment
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/bookings"
              className="inline-flex justify-center items-center gap-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 text-white font-bold shadow"
            >
              <i className="fas fa-calendar-alt" /> View All Appointments
            </Link>
            <Link
              href="/appointment/appointment-i"
              className="inline-flex justify-center items-center gap-2 rounded-full border-2 border-unispa-primaryDark px-5 py-3 text-unispa-primaryDark font-bold hover:bg-unispa-muted"
            >
              <i className="fas fa-plus-circle" /> Book New Service
            </Link>
          </div>
        </section>

        {/* Favorites + Notifications */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">Your Favourite Services</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Go-to</span>
            </div>

            {goToService ? (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm text-indigo-700 font-semibold">Most booked</p>
                <p className="text-lg font-extrabold text-indigo-900">{goToService.name}</p>
                <p className="text-sm text-indigo-700">Booked {goToService.count} time(s)</p>
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {favoriteServices.length ? favoriteServices.map((f, idx) => (
                <div key={`${f.name}-${idx}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-500">Last booked: {f.last_booked_at ? new Date(f.last_booked_at).toLocaleString("en-MY") : "-"}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700">{f.count}x</span>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">No favourites yet. Once you book more services, your go-to list appears here.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">Notifications</h3>
            <p className="mt-1 text-sm text-slate-500 font-semibold">Upcoming booking reminders</p>

            <div className="mt-4 space-y-3">
              {notifications.length ? notifications.map((n) => (
                <div key={n.booking_id} className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="font-bold text-amber-900">{n.title}</p>
                  <p className="text-sm text-amber-800">{n.message}</p>
                  <p className="text-xs text-amber-700 mt-1">{formatDate(n.slot_date)} • {n.start_time || "-"}</p>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">No new notifications.</p>
              )}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="mt-10 rounded-2xl bg-white shadow-xl border border-slate-100 p-5 sm:p-7 lg:p-10">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-unispa-primaryDark">Popular Services</h3>
            <p className="mt-1 text-slate-600 font-semibold">
              Browse services from the database
            </p>

            <Link
              href="/booking/services"
              className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-unispa-primaryDark px-5 py-3 text-unispa-primaryDark font-bold hover:bg-unispa-muted"
            >
              View All Services <i className="fas fa-arrow-right" />
            </Link>
          </div>

          {allServices.length ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {allServices.map((s) => (
                <div key={s.service_id} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white flex flex-col">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-44 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/800x500/5B21B6/ffffff?text=UniSpa+Service";
                    }}
                  />
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-extrabold text-slate-800">{s.name}</h4>
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600 font-semibold">
                      <span><i className="fas fa-clock" /> {s.duration_minutes} mins</span>
                      <span><i className="fas fa-tag" /> RM{s.price}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">{s.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/booking/services/${s.service_id}`}
                        className="inline-flex justify-center items-center gap-2 rounded-lg border-2 border-unispa-primaryDark px-3 py-2 text-unispa-primaryDark font-bold hover:bg-unispa-muted text-sm"
                      >
                        <i className="fas fa-info-circle" /> Details
                      </Link>
                      <Link
                        href={`/appointment/appointment-i?service=${s.service_id}`}
                        className="inline-flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-3 py-2 text-white font-bold shadow text-sm"
                      >
                        <i className="fas fa-calendar-plus" /> Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-8 text-center">
              <div className="text-4xl text-slate-300">
                <i className="fas fa-spa" />
              </div>
              <p className="mt-3 text-slate-600 font-semibold">
                No services found in database yet.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Add services into table <b>service</b> to display them here.
              </p>
              <Link
                href="/booking/services"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 text-white font-bold shadow"
              >
                <i className="fas fa-spa" /> Go to Services Page
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 text-white font-extrabold text-lg">
              <i className="fas fa-spa" />
              <span>UNISPA Masmed UiTM</span>
            </div>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              UiTM&apos;s student-run wellness center. Experience premium spa treatments while supporting student entrepreneurs.
            </p>
          </div>

          <div>
            <h4 className="text-white font-extrabold">Quick Links</h4>
            <div className="mt-3 space-y-2 text-sm">
              <Link className="block hover:text-white" href="/dashboard">Dashboard</Link>
              <Link className="block hover:text-white" href="/booking/services">Our Services</Link>
              <Link className="block hover:text-white" href="/appointment/appointment-i">Appointments</Link>
              <Link className="block hover:text-white" href="/about-us">About Uni-Spa</Link>
              <Link className="block hover:text-white" href="/contact-us">Contact Us</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-extrabold">Contact Info</h4>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
              <p><i className="fas fa-map-marker-alt" /> 3rd Floor, UiTM-MTDC Technopreneur Centre, UiTM Shah Alam</p>
              <p><i className="fas fa-phone" /> +603-5544 2000</p>
              <p><i className="fas fa-envelope" /> unispa@uitm.edu.my</p>
              <p><i className="fas fa-clock" /> Mon-Sat: 10AM - 6PM</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-extrabold">Student Entrepreneurship</h4>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Supporting UiTM students in becoming job creators through hands-on spa management experience.
            </p>
            <Link
              href="/about-us"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-white font-bold hover:bg-white/15"
            >
              <i className="fas fa-graduation-cap" /> Learn About Our Program
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-slate-300">
            <p>© {new Date().getFullYear()} UNISPA Masmed UiTM Shah Alam. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link className="hover:text-white" href="/privacy">Privacy Policy</Link>
              <Link className="hover:text-white" href="/terms">Terms of Service</Link>
              <Link className="hover:text-white" href="/student-program">Student Program</Link>
            </div>
          </div>
        </div>
      </footer>
    </CustomerLayout>
  );
}

/* ---- Small UI components ---- */

function StatCard({ icon, title, subtitle, sub2 }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
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

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  const base = "inline-flex rounded-full px-4 py-2 text-sm font-extrabold";
  if (s === "completed") return <span className={`${base} bg-emerald-100 text-emerald-700`}>Completed</span>;
  if (s === "accepted") return <span className={`${base} bg-sky-100 text-sky-700`}>Accepted</span>;
  if (s === "cancelled") return <span className={`${base} bg-rose-100 text-rose-700`}>Cancelled</span>;
  return <span className={`${base} bg-amber-100 text-amber-700`}>Pending</span>;
}

function formatDate(v) {
  if (!v) return "Date not set";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-MY", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}
