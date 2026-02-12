import { Head, Link, usePage } from "@inertiajs/react";
import StaffShell from "./Partials/StaffShell";

export default function StaffDashboard() {
  const {
    auth,
    staffName,
    staffType,
    stats = {},
    pendingQrProofs = [],
    upcomingAppointments = [],
    weekShifts = [],
    ranges = {},
  } = usePage().props;

  const cards = [
    {
      label: "Today's Appointments",
      value: stats.todayAppointments ?? 0,
      helper: `Date: ${formatShortDate(ranges.today)}`,
      icon: "fa-calendar-day",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Confirmed (This Month)",
      value: stats.confirmedThisMonth ?? 0,
      helper: `Total this month: ${stats.totalThisMonth ?? 0}`,
      icon: "fa-calendar-check",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Pending QR Proofs",
      value: stats.pendingQrProofs ?? 0,
      helper: "Awaiting verification",
      icon: "fa-receipt",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "My Shifts (This Week)",
      value: stats.weekShifts ?? 0,
      helper: `${formatShortDate(ranges.week_start)} - ${formatShortDate(ranges.week_end)}`,
      icon: "fa-calendar-days",
      color: "from-violet-500 to-violet-600",
    },
  ];

  const quickActions = [
    {
      label: "Refresh Dashboard",
      href: route("staff.dashboard"),
      icon: "fa-arrows-rotate",
    },
    ...(String(staffType) === "student"
      ? [
          {
            label: "Submit Availability (Student)",
            href: route("staff.availability"),
            icon: "fa-clipboard-list",
          },
        ]
      : []),
    {
      label: "Admin Scheduling (view only)",
      href: route("admin.scheduling"),
      icon: "fa-calendar-days",
      disabled: true,
    },
  ];

  return (
    <>
      <Head title="Staff Dashboard" />

      <StaffShell
        title="Staff Dashboard"
        subtitle={`Welcome back, ${staffName || auth?.staff?.name || "Staff"}. Here's your current workload overview.`}
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">Upcoming Appointments</h3>
                <p className="mt-1 text-sm text-slate-500">Next 14 days (includes pending/confirmed).</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Showing up to 10</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 pr-3">Booking</th>
                    <th className="py-2 pr-3">Customer</th>
                    <th className="py-2 pr-3">Service</th>
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Room</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.length ? (
                    upcomingAppointments.map((b) => (
                      <tr key={b.booking_id} className="border-b border-slate-100">
                        <td className="py-3 pr-3 font-bold text-slate-700">#{b.booking_id}</td>
                        <td className="py-3 pr-3">{b.customer_name || "-"}</td>
                        <td className="py-3 pr-3">{b.service_name || "-"}</td>
                        <td className="py-3 pr-3">{formatShortDate(b.slot_date)}</td>
                        <td className="py-3 pr-3">
                          {(b.start_time || "-") + " - " + (b.end_time || "-")}
                        </td>
                        <td className="py-3 pr-3">{b.room_name || b.room_type || "-"}</td>
                        <td className="py-3 pr-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(b.booking_status)}`}>
                            {String(b.booking_status || "pending").toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No upcoming appointments yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-extrabold">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    a.disabled
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-unispa-primaryDark hover:text-unispa-primaryDark"
                  }`}
                  onClick={(e) => {
                    if (a.disabled) e.preventDefault();
                  }}
                >
                  <i className={`fas ${a.icon} w-4 text-center`} />
                  <span>{a.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-extrabold">Note</p>
              <p className="mt-1 text-amber-800/90">
                QR payment confirmation is currently processed in the Admin Scheduling module.
                This dashboard shows QR proofs assigned to you for visibility.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">Pending QR Proofs</h3>
              <span className="text-xs font-semibold text-slate-500">Showing up to 8</span>
            </div>
            <div className="space-y-3">
              {pendingQrProofs.length ? (
                pendingQrProofs.map((p) => (
                  <div key={p.booking_id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-700">#{p.booking_id}</p>
                        <p className="text-xs text-slate-500">
                          {formatShortDate(p.slot_date)} · {(p.start_time || "-") + " - " + (p.end_time || "-")}
                        </p>
                        <p className="mt-1 text-sm text-slate-700">{p.customer_name || "-"}</p>
                        <p className="text-xs text-slate-500">{p.service_name || "-"}</p>
                        <p className="mt-1 text-xs text-slate-500">Room: {p.room_name || p.room_type || "-"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.proof_url ? (
                          <a
                            href={p.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100"
                          >
                            View Proof
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">No proof</span>
                        )}
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${paymentClass(p.payment_status)}`}>
                          {String(p.payment_status || "pending").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No pending QR proofs assigned to you.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">This Week Shifts</h3>
              <span className="text-xs font-semibold text-slate-500">
                {formatShortDate(ranges.week_start)} - {formatShortDate(ranges.week_end)}
              </span>
            </div>
            <div className="space-y-2">
              {weekShifts.length ? (
                weekShifts.map((s) => (
                  <div key={s.schedule_id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-700">{formatShortDate(s.schedule_date)}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {(s.start_time || "-") + " - " + (s.end_time || "-")}
                        {s.created_by ? ` · by ${String(s.created_by).toUpperCase()}` : ""}
                        {String(staffType) === "student" ? (
                          <>
                            {" "}·{" "}
                            <span className={
                              String(s.approval_status || "approved") === "approved"
                                ? "text-emerald-700"
                                : String(s.approval_status || "").toLowerCase() === "rejected"
                                  ? "text-rose-700"
                                  : "text-amber-700"
                            }>
                              {String(s.approval_status || "pending").toUpperCase()}
                            </span>
                          </>
                        ) : null}
                      </p>

                      {String(staffType) === "student" && String(s.approval_status || "").toLowerCase() === "rejected" && s.approval_notes ? (
                        <p className="mt-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
                          <span className="font-extrabold">Admin note:</span> {s.approval_notes}
                        </p>
                      ) : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${shiftStatusClass(s.status)}`}>
                      {String(s.status || "active").toUpperCase()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No shifts scheduled for this week.</p>
              )}
            </div>
          </div>
        </section>
      </StaffShell>
    </>
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
  if (s === "accepted" || s === "confirmed") return "bg-blue-100 text-blue-700";
  if (s === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function paymentClass(paymentStatus) {
  const s = String(paymentStatus || "").toLowerCase();
  if (s === "paid") return "bg-emerald-100 text-emerald-700";
  if (s === "unpaid") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

function shiftStatusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "inactive") return "bg-rose-100 text-rose-700";
  return "bg-emerald-100 text-emerald-700";
}
