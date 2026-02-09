import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

/**
 * GuestNavbar
 * - Matches CustomerNavbar visual style
 * - Desktop nav + mobile hamburger drawer
 * - Provides Login / Book Now CTAs (caller can override handlers)
 */
export default function GuestNavbar({
  active = "",
  onLogin = null,
  onBook = null,
  brandHref = "/",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(
    () => [
      { key: "dashboard", href: "/guest/dashboard", icon: "fas fa-home", label: "Dashboard" },
      { key: "services", href: "/booking/services", icon: "fas fa-spa", label: "Services" },
      { key: "reviews", href: "/reviews", icon: "fas fa-star", label: "Reviews" },
    ],
    []
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const linkBase =
    "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition";
  const linkIdle = "text-white/85 hover:bg-white/10 hover:text-white";
  const linkActive = "bg-white/15 text-white shadow-sm";

  const loginAction = onLogin || (() => (window.location.href = "/customer/login"));
  const bookAction = onBook || (() => (window.location.href = "/booking/services"));

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
        <div className="flex min-h-[72px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href={brandHref} className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <i className="fas fa-spa text-sm" />
            </div>
            <span className="truncate text-base font-extrabold tracking-wide text-white sm:text-lg">
              <span className="sm:hidden">UNISPA</span>
              <span className="hidden sm:inline">UNISPA Masmed UiTM</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`${linkBase} ${active === item.key ? linkActive : linkIdle}`}
              >
                <i className={item.icon} /> {item.label}
              </Link>
            ))}

            <div className="ml-2 flex items-center gap-2">
              <button
                type="button"
                onClick={loginAction}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-white/15"
              >
                Login
              </button>
              <button
                type="button"
                onClick={bookAction}
                className="rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900"
              >
                Book Now
              </button>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white hover:bg-white/15 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen ? "true" : "false"}
            type="button"
          >
            <i className="fas fa-bars" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`${mobileOpen ? "fixed" : "hidden"} inset-0 z-[60] lg:hidden`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />

        <aside className="absolute right-0 top-0 h-full w-[min(360px,92vw)] border-l border-white/10 bg-slate-900/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <i className="fas fa-spa text-sm" />
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-wide">UNISPA</div>
                <div className="text-xs font-semibold text-white/70">Welcome</div>
              </div>
            </div>

            <button
              className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white hover:bg-white/15"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              type="button"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <nav className="space-y-2 px-4 py-4" aria-label="Mobile primary">
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active === item.key ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                  <i className={item.icon} />
                </span>
                {item.label}
              </Link>
            ))}

            <div className="mt-3 h-px bg-white/10" />

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                loginAction();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-extrabold text-white"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                bookAction();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900"
            >
              Book Now
            </button>
          </nav>
        </aside>
      </div>
    </header>
  );
}
