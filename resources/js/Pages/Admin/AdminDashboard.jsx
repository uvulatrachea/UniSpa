import { Head, Link, usePage } from "@inertiajs/react";
import AdminShell from "./Partials/AdminShell";

export default function AdminDashboard() {
  const {
    adminName,
    stats = {},
    recentBookings = [],
    recentReviews = [],
    topServices = [],
    serviceTrend = { labels: [], series: [] },
    bookingStatusBreakdown = [],
    weeklyBookingsOverview = [],
  } = usePage().props;

  const cards = [
    {
      label: "Total Staff",
      value: stats.totalStaff ?? 0,
      helper: `${stats.activeStaff ?? 0} active`,
      icon: "fa-users",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers ?? 0,
      helper: `${stats.verifiedCustomers ?? 0} verified`,
      icon: "fa-user-check",
      color: "from-violet-500 to-violet-600",
    },
    {
      label: "Today's Slots",
      value: stats.todaySlots ?? 0,
      helper: `${stats.availableSlotsToday ?? 0} available`,
      icon: "fa-calendar-day",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Today's Bookings",
      value: stats.todayBookings ?? 0,
      helper: `${stats.pendingBookings ?? 0} pending`,
      icon: "fa-calendar-check",
      color: "from-amber-500 to-orange-500",
    },
  ];

  const quickActions = [
    { label: "Manage Users", href: route("admin.users"), icon: "fa-users-cog" },
    { label: "Manage Services", href: route("admin.services"), icon: "fa-spa" },
    { label: "Manage Scheduling", href: route("admin.scheduling"), icon: "fa-calendar-days" },
    { label: "Manage Bookings", href: route("admin.bookings"), icon: "fa-calendar-alt" },
    { label: "Manage Reviews", href: route("admin.reviews"), icon: "fa-star" },
    { label: "Manage Payments", href: route("admin.payments"), icon: "fa-wallet" },
  ];

  return (
    <>
      <Head title="Admin Dashboard" />

      <AdminShell
        title="Admin Dashboard"
        subtitle={`Welcome back, ${adminName || "Admin"}. Monitor UniSpa operations securely.`}
      >
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-2xl bg-gradient-to-r ${c.color} p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold/6 opacity-90">{c.label}</p>
                <i className={`fas ${c.icon} text-lg opacity-85`} />
              </div>
              <p className="mt-2 text-3xl font-extrabold">{c.value}</p>
              <p className="mt-1 text-xs font-semibold opacity-90">{c.helper}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">Mostly Booked Services Trend</h3>
              <span className="text-xs font-semibold text-slate-500">Last 8 weeks</span>
            </div>
            <p className="mb-4 text-sm text-slate-500">Weekly trend for top booked services.</p>

            <TrendLineChart labels={serviceTrend.labels || []} series={serviceTrend.series || []} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold">Booking Status Distribution</h3>
            <p className="mt-1 text-sm text-slate-500">Current booking statuses.</p>

            <StatusDonutChart data={bookingStatusBreakdown} />
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="text-lg font-extrabold">Weekly Booking Volume</h3>
            <p className="mt-1 text-sm text-slate-500">Accepted + pending volume by week.</p>

            <div className="mt-4">
              <MiniBarChart data={weeklyBookingsOverview} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">Recent Bookings</h3>
              <Link href={route("admin.bookings")} className="text-sm font-bold text-unispa-primaryDark hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-3">Booking</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Service</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length ? (
                    recentBookings.map((b) => (
                      <tr key={b.booking_id} className="border-b border-slate-100">
                        <td className="py-3 pr-3 font-bold text-slate-700">#{b.booking_id}</td>
                        <td className="py-3 pr-3">{b.customer_name || "-"}</td>
                        <td className="py-3 pr-3">{b.service_name || "-"}</td>
                        <td className="py-3 pr-3">{formatShortDate(b.slot_date)}</td>
                        <td className="py-3 pr-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(b.status)}`}>
                            {String(b.status || "pending").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No booking records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:border-unispa-primaryDark hover:text-unispa-primaryDark"
                >
                  <i className={`fas ${a.icon} w-4 text-center`} />
                  <span>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold">Review Snapshot</h3>
            <p className="mt-1 text-sm text-slate-500">Average rating: {Number(stats.avgRating ?? 0).toFixed(1)} / 5</p>

            <div className="mt-4 space-y-3">
              {recentReviews.length ? (
                recentReviews.map((r) => (
                  <div key={r.review_id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-slate-700">{r.customer_name || "Customer"}</p>
                      <p className="text-amber-500">
                        {"★".repeat(Number(r.rating || 0))}
                        {"☆".repeat(Math.max(5 - Number(r.rating || 0), 0))}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">{r.service_name || "Service"}</p>
                    <p className="mt-1 text-sm text-slate-700">{r.comment || "No comment provided."}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold">Top Services by Bookings</h3>
            <div className="mt-4 space-y-3">
              {topServices.length ? (
                topServices.map((s, idx) => (
                  <div key={s.id || idx}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <p className="font-bold text-slate-700">{s.name || "Service"}</p>
                      <p className="font-extrabold text-unispa-primaryDark">{s.booking_count || 0}</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-unispa-primaryDark to-unispa-primary"
                        style={{ width: `${barWidth(s.booking_count, topServices)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No service booking data yet.</p>
              )}
            </div>
          </div>
        </section>
      </AdminShell>
    </>
  );
}

function TrendLineChart({ labels = [], series = [] }) {
  if (!series.length || !labels.length) {
    return <p className="text-sm text-slate-500">Not enough data to render trend yet.</p>;
  }

  const allPoints = series.flatMap((s) => (Array.isArray(s.data) ? s.data : []));
  const maxValue = Math.max(...allPoints, 0);
  const chartW = 680;
  const chartH = 240;
  const padding = 24;
  const usableW = chartW - padding * 2;
  const usableH = chartH - padding * 2;

  const colors = ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899"];

  const toXY = (v, index, total) => {
    const x = padding + (total <= 1 ? 0 : (index / (total - 1)) * usableW);
    const y = padding + (maxValue <= 0 ? usableH : usableH - (Number(v || 0) / maxValue) * usableH);
    return [x, y];
  };

  return (
    <div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-[250px] min-w-[680px] w-full">
          {[0, 1, 2, 3, 4].map((row) => {
            const y = padding + (row / 4) * usableH;
            return <line key={row} x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}

          {series.map((s, si) => {
            const points = (s.data || []).map((v, i) => toXY(v, i, labels.length));
            const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
            const color = colors[si % colors.length];

            return (
              <g key={`${s.name}-${si}`}>
                <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                {points.map((p, pi) => (
                  <circle key={pi} cx={p[0]} cy={p[1]} r="3.8" fill={color} />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-4">
        {series.map((s, i) => (
          <div key={s.name || i} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span>{s.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1 text-[11px] font-semibold text-slate-500 sm:grid-cols-8">
        {labels.map((label, i) => (
          <span key={`${label}-${i}`} className="text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniBarChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-sm text-slate-500">No weekly booking volume yet.</p>;
  }

  const max = Math.max(...data.map((d) => Number(d.count || 0)), 0);

  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const width = max > 0 ? Math.round((Number(d.count || 0) / max) * 100) : 0;
        return (
          <div key={`${d.label}-${i}`}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{d.label}</span>
              <span>{d.count || 0}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                style={{ width: `${Math.max(width, d.count ? 8 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDonutChart({ data = [] }) {
  if (!data.length) {
    return <p className="mt-4 text-sm text-slate-500">No booking status data yet.</p>;
  }

  const colors = {
    completed: "#10b981",
    accepted: "#3b82f6",
    pending: "#f59e0b",
    cancelled: "#ef4444",
    cart: "#8b5cf6",
    confirmed: "#06b6d4",
    unknown: "#94a3b8",
  };

  const total = data.reduce((sum, d) => sum + Number(d.count || 0), 0);
  let offset = 0;
  const segments = data.map((d) => {
    const pct = total > 0 ? (Number(d.count || 0) / total) * 100 : 0;
    const start = offset;
    offset += pct;
    return {
      ...d,
      pct,
      color: colors[String(d.status || "unknown").toLowerCase()] || colors.unknown,
      range: `${start}% ${offset}%`,
    };
  });

  const gradient = `conic-gradient(${segments.map((s) => `${s.color} ${s.range}`).join(", ")})`;

  return (
    <div className="mt-4">
      <div className="mx-auto grid w-full max-w-[220px] place-items-center">
        <div
          className="relative h-40 w-40 rounded-full"
          style={{ backgroundImage: gradient }}
          role="img"
          aria-label="Booking status distribution"
        >
          <div className="absolute inset-6 grid place-items-center rounded-full bg-white text-center">
            <p className="text-2xl font-extrabold text-slate-800">{total}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Bookings</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {segments.map((s, i) => (
          <div key={`${s.status}-${i}`} className="flex items-center justify-between gap-3 text-xs">
            <div className="inline-flex items-center gap-2 font-semibold text-slate-600">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{String(s.status || "unknown").toUpperCase()}</span>
            </div>
            <div className="font-bold text-slate-700">
              {s.count} <span className="text-slate-400">({s.pct.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatShortDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "bg-emerald-100 text-emerald-700";
  if (s === "accepted") return "bg-blue-100 text-blue-700";
  if (s === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function barWidth(count, list) {
  const max = Math.max(...list.map((x) => Number(x.booking_count || 0)), 0);
  if (max === 0) return 0;
  return Math.max(8, Math.round((Number(count || 0) / max) * 100));
}