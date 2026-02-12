import React from "react";
import { Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

const FALLBACK_IMG = "https://placehold.co/900x500/5B21B6/ffffff?text=UniSpa+Service";

export default function ServiceDetail({ service, reviews = [], related = [] }) {
  const rating = Number(service?.avg_rating || 0);
  const reviewCount = Number(service?.review_count || 0);

  return (
    <CustomerLayout title={service?.name || "Service"} active="services">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Back link */}
        <Link
          href="/booking/services"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 mb-6"
        >
          <i className="fas fa-arrow-left" /> Back to Services
        </Link>

        {/* Hero card */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {/* Image */}
          <div className="relative h-64 sm:h-80 bg-slate-100">
            <img
              src={service?.image_url || FALLBACK_IMG}
              alt={service?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (!e.target.src.includes("placehold.co")) e.target.src = FALLBACK_IMG;
              }}
            />
            {service?.is_popular ? (
              <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-amber-900 shadow">
                <i className="fas fa-star" /> Popular
              </span>
            ) : null}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-unispa-primary uppercase tracking-wide">
                  {service?.category_name || "Service"}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
                  {service?.name}
                </h1>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star text-sm ${i < Math.round(rating) ? "text-amber-400" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-600">
                    {rating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                  </span>
                </div>

                {/* Meta badges */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                    <i className="fas fa-clock text-slate-400" /> {service?.duration_minutes || 0} minutes
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                    <i className="fas fa-layer-group text-slate-400" /> {service?.category_name}
                  </span>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="sm:text-right flex-shrink-0">
                <p className="text-3xl font-black text-unispa-primaryDark">
                  RM {Number(service?.price || 0).toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-slate-500">per person</p>
                <Link
                  href={`/appointment/appointment-i?service=${service?.service_id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-6 py-3 font-extrabold text-white shadow hover:opacity-95"
                >
                  <i className="fas fa-calendar-plus" /> Book Now
                </Link>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h2 className="text-lg font-black text-slate-900">About this Service</h2>
              <p className="mt-3 text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                {service?.description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-900">
              Customer Reviews ({reviewCount})
            </h2>
            <div className="mt-5 space-y-4">
              {reviews.map((rev, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <i
                            key={j}
                            className={`fas fa-star text-xs ${j < Math.round(Number(rev.rating || 0)) ? "text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-extrabold text-slate-800">
                        {rev.customer_name || "Customer"}
                      </span>
                    </div>
                    {rev.created_at && (
                      <span className="text-xs font-semibold text-slate-400">
                        {new Date(rev.created_at).toLocaleDateString("en-MY", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  {rev.comment && (
                    <p className="mt-2 text-sm text-slate-600 font-semibold leading-relaxed">
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related services */}
        {related.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-xl p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-900">Related Services</h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.service_id}
                  href={`/booking/services/${r.service_id}`}
                  className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden hover:shadow-md transition group"
                >
                  <img
                    src={r.image_url || FALLBACK_IMG}
                    alt={r.name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      if (!e.target.src.includes("placehold.co")) e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <div className="p-3">
                    <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-unispa-primary transition">
                      {r.name}
                    </h4>
                    <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span><i className="fas fa-clock" /> {r.duration_minutes} mins</span>
                      <span className="text-unispa-primaryDark font-extrabold">RM {Number(r.price).toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </CustomerLayout>
  );
}
