import { Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function AdminShell({ title, subtitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const modules = useMemo(
    () => [
      { label: "Dashboard", href: route("admin.dashboard"), icon: "fa-chart-line" },
      { label: "Manage Users", href: route("admin.users"), icon: "fa-users-cog" },
      { label: "Manage Services", href: route("admin.services"), icon: "fa-spa" },
      { label: "Manage Scheduling", href: route("admin.scheduling"), icon: "fa-calendar-days" },
      { label: "Manage Bookings", href: route("admin.bookings"), icon: "fa-calendar-check" },
      { label: "View Reviews", href: route("admin.reviews"), icon: "fa-star" },
    ],
    []
  );

  const currentUrl = typeof window !== "undefined" ? window.location.pathname : "";

  const isActivePath = (href) => {
    if (typeof window === "undefined") return false;
    try {
      return currentUrl === new URL(href, window.location.origin).pathname;
    } catch {
      return currentUrl === href;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white shadow-xl transition-transform lg:static lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-unispa-subtle">UniSpa</p>
              <h2 className="text-lg font-extrabold text-unispa-primaryDark">Admin Panel</h2>
            </div>
            <button onClick={() => setMenuOpen(false)} className="lg:hidden" aria-label="Close menu">
              <i className="fas fa-times text-slate-500" />
            </button>
          </div>

          <nav className="space-y-1 p-3">
            {modules.map((m) => {
              const isActive = isActivePath(m.href);

              return (
                <Link
                  key={m.label}
                  href={m.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-unispa-primaryDark text-white shadow"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={`fas ${m.icon} w-4 text-center`} />
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <Link
              href={route("admin.logout")}
              method="post"
              as="button"
              className="w-full rounded-xl bg-rose-50 px-4 py-3 text-sm font-extrabold text-rose-700 hover:bg-rose-100"
            >
              <i className="fas fa-sign-out-alt mr-2" /> Logout
            </Link>
          </div>
        </aside>

        {menuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/35 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                  >
                    <i className="fas fa-bars" />
                  </button>
                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-extrabold sm:text-xl">{title}</h1>
                    <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
                  </div>
                </div>

                <Link
                  href={route("admin.dashboard")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 sm:text-sm"
                >
                  <i className="fas fa-house" /> Home
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}