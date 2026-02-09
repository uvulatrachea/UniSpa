import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AdminShell from "./Partials/AdminShell";

export default function ManageReviews({ kpis = {}, filters = {}, reviews = { data: [], links: [] } }) {
  const { flash = {} } = usePage().props;
  const [search, setSearch] = useState(filters.search || "");
  const [rating, setRating] = useState(filters.rating || "all");
  const [perPage, setPerPage] = useState(String(filters.per_page || 10));

  const params = useMemo(
    () => ({
      search,
      rating,
      per_page: perPage,
    }),
    [search, rating, perPage]
  );

  const applyFilters = () => {
    router.get(route("admin.reviews"), params, { preserveState: true, replace: true });
  };

  const onPaginate = (url) => {
    if (!url) return;
    router.visit(url, { preserveState: true, preserveScroll: true });
  };

  return (
    <>
      <Head title="Manage Reviews" />

      <AdminShell title="Manage Reviews" subtitle="View customer ratings and comments (read-only).">
        {(flash.success || flash.error) && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${flash.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {flash.success || flash.error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Total Reviews" value={kpis.totalReviews} />
          <KpiCard label="Average Rating" value={Number(kpis.avgRating || 0).toFixed(1)} />
          <KpiCard label="5-Star Reviews" value={kpis.fiveStarReviews} />
          <KpiCard label="Low Reviews (≤2)" value={kpis.lowReviews} />
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Search by review ID, booking, customer, service, comment..."
              />

              <select value={rating} onChange={(e) => setRating(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select value={perPage} onChange={(e) => setPerPage(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="8">8 / page</option>
                <option value="10">10 / page</option>
                <option value="15">15 / page</option>
                <option value="20">20 / page</option>
              </select>

              <button onClick={applyFilters} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                Apply
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Review</th>
                  <th className="px-3 py-2 font-semibold">Customer</th>
                  <th className="px-3 py-2 font-semibold">Service</th>
                  <th className="px-3 py-2 font-semibold">Rating</th>
                  <th className="px-3 py-2 font-semibold">Comment</th>
                  <th className="px-3 py-2 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews?.data?.length ? (
                  reviews.data.map((r) => (
                    <tr key={r.review_id} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-700">#{r.review_id}</p>
                        <p className="text-xs text-slate-500">Booking: {r.booking_id || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-700">{r.customer_name || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{r.customer_email || "-"}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{r.service_name || "-"}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                          {"★".repeat(Number(r.rating || 0))}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-700 max-w-[360px]">
                        {r.comment || <span className="text-slate-400 italic">No comment</span>}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{formatDate(r.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!!reviews?.links?.length && (
            <div className="mt-3 flex flex-wrap gap-1">
              {reviews.links.map((l, i) => (
                <button
                  key={`${l.label}-${i}`}
                  disabled={!l.url}
                  onClick={() => onPaginate(l.url)}
                  className={`rounded px-2 py-1 text-xs ${l.active ? "bg-slate-900 text-white" : "border border-slate-200"} disabled:opacity-40`}
                  dangerouslySetInnerHTML={{ __html: l.label }}
                />
              ))}
            </div>
          )}
        </section>
      </AdminShell>
    </>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-800">{value ?? 0}</p>
    </div>
  );
}

function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}
