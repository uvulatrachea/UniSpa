// resources/js/Pages/Guest/GuestServices.jsx
import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

export default function GuestServices({ services, categories }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState(null);

  const openLoginModal = (href = null) => {
    setPendingHref(href);
    setLoginModalOpen(true);
  };

  const goLogin = () => {
    // Guest app runs on :8080 (Vite) but auth pages are served by Laravel on :8000
    const authBase = `${window.location.protocol}//${window.location.hostname}:8000`;
    window.location.href = `${authBase}/customer/signup`;
  };

  // category map (id -> category)
  const catMap = useMemo(() => {
    const m = new Map();
    (Array.isArray(categories) ? categories : []).forEach((c) => {
      m.set(String(c.id ?? c.category_id), c);
    });
    return m;
  }, [categories]);

  // normalize services from DB
  const list = useMemo(() => {
    const arr = Array.isArray(services) ? services : [];
    return arr
      .filter((s) => s && (s.id || s.service_id))
      .map((s) => ({
        id: s.id ?? s.service_id,
        category_id: s.category_id,
        name: s.name ?? "Service",
        description: s.description ?? "",
        price: s.price ?? 0,
        duration_minutes: s.duration_minutes ?? 0,
        image_url:
          s.image_url ||
          "https://via.placeholder.com/800x500/5B21B6/ffffff?text=UniSpa+Service",
        is_popular: !!s.is_popular,
      }));
  }, [services]);

  // "Details" expandable section per service
  const [openDetailsId, setOpenDetailsId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* NAVBAR (same vibe as guest dashboard) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-unispa-primaryDark flex items-center justify-center text-white font-extrabold">
              U
            </div>
            <div className="font-extrabold text-slate-800">UNISPA Masmed UiTM</div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/guest/dashboard" className="navBtn">
              Dashboard
            </Link>
            <Link href="/guest/services" className="navBtn">
              Services
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openLoginModal(null)}
              className="px-4 py-2 rounded-full border-2 border-unispa-primaryDark text-unispa-primaryDark font-extrabold hover:bg-unispa-muted"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => openLoginModal("/appointment/appointment-i")}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary text-white font-extrabold shadow hover:opacity-95"
            >
              Book Now
            </button>
          </div>
        </div>
      </header>

      {/* spacer */}
      <div className="h-14" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-unispa-primaryDark">
            Services
          </h1>
          <p className="mt-2 text-slate-600 font-semibold">
            Guests can browse all services. To reserve a slot, login is required.
          </p>
        </div>

        {list.length ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {list.map((s) => {
              const cat = catMap.get(String(s.category_id));
              const isOpen = String(openDetailsId) === String(s.id);

              return (
                <div
                  key={s.id}
                  className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white flex flex-col"
                >
                  <img
                    src={s.image_url}
                    alt={s.name}
                    className="h-44 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/800x500/5B21B6/ffffff?text=UniSpa+Service";
                    }}
                  />

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-800">{s.name}</h3>
                      {s.is_popular ? (
                        <span className="text-xs font-extrabold px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                          Popular
                        </span>
                      ) : null}
                    </div>

                    {cat?.name ? (
                      <div className="mt-1 text-xs font-bold text-slate-500">{cat.name}</div>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600 font-semibold">
                      <span>
                        <i className="fas fa-clock" /> {s.duration_minutes} mins
                      </span>
                      <span>
                        <i className="fas fa-tag" /> RM{s.price}
                      </span>
                    </div>

                    {/* short preview */}
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1 line-clamp-3">
                      {s.description}
                    </p>

                    {/* DETAILS expandable (NO login required) */}
                    {isOpen ? (
                      <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
                        <div className="text-sm font-extrabold text-slate-800">Service Details</div>
                        <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                          {s.description || "No description provided."}
                        </div>
                        <div className="mt-2 text-sm text-slate-700 font-semibold">
                          Duration: {s.duration_minutes} mins • Price: RM{s.price}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {/* Details: NO login required */}
                      <button
                        type="button"
                        onClick={() => setOpenDetailsId(isOpen ? null : s.id)}
                        className="inline-flex justify-center items-center gap-2 rounded-lg border-2 border-unispa-primaryDark px-3 py-2 text-unispa-primaryDark font-bold hover:bg-unispa-muted text-sm"
                      >
                        <i className="fas fa-info-circle" /> {isOpen ? "Hide" : "Details"}
                      </button>

                      {/* Reserve: LOGIN REQUIRED */}
                      <button
                        type="button"
                        onClick={() =>
                          openLoginModal(`/appointment/appointment-i?service=${s.id}`)
                        }
                        className="inline-flex justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-3 py-2 text-white font-bold shadow text-sm"
                      >
                        <i className="fas fa-calendar-plus" /> Reserve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-xl bg-white border border-slate-100 shadow p-10 text-center">
            <div className="text-4xl text-slate-300">
              <i className="fas fa-spa" />
            </div>
            <p className="mt-3 text-slate-600 font-semibold">No services found.</p>
          </div>
        )}
      </main>

      {/* LOGIN MODAL */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setLoginModalOpen(false)}
          />
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
