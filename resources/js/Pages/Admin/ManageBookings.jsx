import { Head, Link, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AdminShell from "./Partials/AdminShell";

export default function ManageBookings({
  kpis = {},
  filters = {},
  services = [],
  bookings = { data: [], links: [] },
  selectedDateBookings = [],
  monthBookingCounts = [],
}) {
  const { flash = {} } = usePage().props;
  const [selectedDate, setSelectedDate] = useState(filters.selected_date || toDateInput(new Date()));
  const [monthCursor, setMonthCursor] = useState(new Date((filters.selected_date || toDateInput(new Date())) + "T00:00:00"));

  const monthStatsByDate = useMemo(() => {
    const map = {};
    (monthBookingCounts || []).forEach((row) => {
      map[String(row.slot_date)] = {
        total: Number(row.total_count || 0),
        pendingPayment: Number(row.pending_payment_count || 0),
      };
    });
    return map;
  }, [monthBookingCounts]);

  const currentMonthTitle = monthCursor.toLocaleDateString("en-MY", { month: "long", year: "numeric" });
  const monthGrid = buildMonthGrid(monthCursor);
  const currentMonthIndex = monthCursor.getMonth();
  const currentYearValue = monthCursor.getFullYear();

  const yearOptions = useMemo(() => {
    const start = Math.min(2026, currentYearValue - 10);
    const end = currentYearValue + 20;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentYearValue]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const reloadBookings = (payload) => {
    router.get(route("admin.bookings"), payload, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const applyFilters = (extra = {}) => {
    reloadBookings({
      ...filters,
      ...extra,
    });
  };

  const pickDate = (dateStr) => {
    setSelectedDate(dateStr);
    setMonthCursor(new Date(dateStr + "T00:00:00"));
    applyFilters({ selected_date: dateStr });
  };

  const moveMonth = (offset) => {
    const next = new Date(monthCursor);
    next.setMonth(next.getMonth() + offset);
    setMonthCursor(next);
    const focusDate = toDateInput(new Date(next.getFullYear(), next.getMonth(), 1));
    pickDate(focusDate);
  };

  const jumpToMonthYear = (nextMonth, nextYear) => {
    const next = new Date(Number(nextYear), Number(nextMonth), 1);
    setMonthCursor(next);
    pickDate(toDateInput(next));
  };

  const approveBooking = (bookingId) => {
    router.post(route("admin.bookings.approve", bookingId), {}, { preserveScroll: true });
  };

  const updateStatus = (bookingId, status) => {
    router.patch(route("admin.bookings.status", bookingId), { status }, { preserveScroll: true });
  };

  const rejectBooking = (bookingId) => {
    if (!confirm(`Reject booking #${bookingId}?`)) return;
    updateStatus(bookingId, "cancelled");
  };

  const goToScheduling = (bookingId) => {
    router.get(route("admin.scheduling"), { booking_id: bookingId });
  };

  const removeBooking = (bookingId) => {
    if (!confirm(`Delete booking #${bookingId}? This cannot be undone.`)) return;
    router.delete(route("admin.bookings.destroy", bookingId), { preserveScroll: true });
  };

  return (
    <>
      <Head title="Manage Bookings" />

      <AdminShell
        title="Manage Bookings"
        subtitle="Calendar + smart listing to approve payments, update statuses, and control customer bookings."
      >
        {(flash.success || flash.error) && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${flash.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {flash.success || flash.error}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Kpi label="Total Bookings" value={kpis.totalBookings} />
          <Kpi label="Pending" value={kpis.pendingBookings} />
          <Kpi label="Approved" value={kpis.approvedBookings} />
          <Kpi label="Pending Payments" value={kpis.pendingPayments} />
          <Kpi label="Completed" value={kpis.completedBookings} />
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr,300px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button className="rounded-md border border-slate-300 bg-white px-3 py-1" onClick={() => moveMonth(-1)}>
                    <i className="fas fa-chevron-left" />
                  </button>
                  <h3 className="text-base font-extrabold text-slate-700">{currentMonthTitle}</h3>
                  <button className="rounded-md border border-slate-300 bg-white px-3 py-1" onClick={() => moveMonth(1)}>
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={currentMonthIndex}
                    onChange={(e) => jumpToMonthYear(e.target.value, currentYearValue)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={m} value={idx}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentYearValue}
                    onChange={(e) => jumpToMonthYear(currentMonthIndex, e.target.value)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => pickDate(toDateInput(new Date()))}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold"
                  >
                    Today
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {monthGrid.map((day, idx) => {
                  const stats = monthStatsByDate[day.date] || { total: 0, pendingPayment: 0 };
                  const isSelected = day.date === selectedDate;

                  return (
                    <button
                      key={`${day.date}-${idx}`}
                      type="button"
                      onClick={() => pickDate(day.date)}
                      className={`min-h-[92px] rounded-xl border p-2 text-left transition ${isSelected ? "border-slate-900 bg-slate-900 text-white" : day.isCurrentMonth ? "border-slate-200 bg-white hover:border-slate-300" : "border-slate-100 bg-slate-100 text-slate-400"}`}
                    >
                      <div className="text-sm font-bold">{day.day}</div>
                      <div className="mt-1 space-y-1 text-[11px]">
                        <div className={`${isSelected ? "text-white/90" : "text-slate-600"}`}>{stats.total} bookings</div>
                        {stats.pendingPayment > 0 && (
                          <div className={`inline-flex rounded-full px-2 py-0.5 font-bold ${isSelected ? "bg-amber-200 text-amber-900" : "bg-amber-100 text-amber-700"}`}>
                            {stats.pendingPayment} unpaid
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-3">
              <h3 className="mb-2 text-sm font-extrabold text-slate-700">Filter Bookings</h3>

              <div className="space-y-2">
                <input
                  defaultValue={filters.search || ""}
                  placeholder="Search booking/customer/service"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters({ search: e.currentTarget.value, page: 1 });
                  }}
                />

                <select
                  value={filters.status || "all"}
                  onChange={(e) => applyFilters({ status: e.target.value, page: 1 })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="cart">Cart</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={filters.payment || "all"}
                  onChange={(e) => applyFilters({ payment: e.target.value, page: 1 })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">All payment statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>

                <select
                  value={String(filters.service_id || "all")}
                  onChange={(e) => applyFilters({ service_id: e.target.value, page: 1 })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">All services</option>
                  {(services || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => applyFilters({ search: "", status: "all", payment: "all", service_id: "all", page: 1 })}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                >
                  Reset Filters
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Selected Day Overview</h4>
                <p className="mt-1 text-sm font-bold text-slate-700">{prettyDate(selectedDate)}</p>
                <p className="text-xs text-slate-500">{selectedDateBookings.length} bookings in this date.</p>
              </div>
            </aside>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-extrabold text-slate-700">Bookings on {prettyDate(selectedDate)}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{selectedDateBookings.length} entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateBookings.length ? (
                    selectedDateBookings.map((b) => (
                      <tr key={`daily-${b.booking_id}`} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-semibold text-slate-700">{shortTime(b.start_time)} - {shortTime(b.end_time)}</td>
                        <td className="px-3 py-2">{b.customer_name || "-"}</td>
                        <td className="px-3 py-2">{b.service_name || "-"}</td>
                        <td className="px-3 py-2"><Badge value={b.status} kind="status" /></td>
                        <td className="px-3 py-2"><Badge value={b.payment_status} kind="payment" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">No bookings on this date.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-extrabold text-slate-700">Booking Listing (All)</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{bookings?.total ?? bookings?.data?.length ?? 0} results</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Booking</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Service / Schedule</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Payment</th>
                    <th className="px-3 py-2">Proof / Receipt</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {(bookings?.data || []).length ? (
                    bookings.data.map((b) => (
                      <tr key={b.booking_id} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-3">
                          <p className="font-bold text-slate-700">#{b.booking_id}</p>
                          <p className="text-xs text-slate-500">RM {Number(b.final_amount || b.total_amount || 0).toFixed(2)}</p>
                        </td>

                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-700">{b.customer_name || "Customer"}</p>
                          <p className="text-xs text-slate-500">{b.customer_email || "-"}</p>
                        </td>

                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-700">{b.service_name || "Service"}</p>
                          <p className="text-xs text-slate-500">{prettyDate(String(b.slot_date))} • {shortTime(b.start_time)} - {shortTime(b.end_time)}</p>
                          <p className="text-xs text-slate-500">Staff: {b.staff_name || "Unassigned"}</p>
                        </td>

                        <td className="px-3 py-3">
                          <Badge value={b.status} kind="status" />
                        </td>

                        <td className="px-3 py-3">
                          <p className="text-xs font-semibold text-slate-600">{humanize(b.payment_method || "-")}</p>
                          <Badge value={b.payment_status} kind="payment" />
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            {b.proof_url ? (
                              <a href={b.proof_url} target="_blank" rel="noreferrer" className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
                                View QR Proof
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">No proof</span>
                            )}
                            {b.receipt_url ? (
                              <a href={b.receipt_url} target="_blank" rel="noreferrer" className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                                View Receipt
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">No receipt</span>
                            )}
                            {b.google_calendar_url ? (
                              <a href={b.google_calendar_url} target="_blank" rel="noreferrer" className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                                Add Calendar
                              </a>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => approveBooking(b.booking_id)}
                              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectBooking(b.booking_id)}
                              className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700"
                            >
                              Reject
                            </button>
                            <button
                              type="button"
                              onClick={() => goToScheduling(b.booking_id)}
                              className="rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700"
                            >
                              Staff
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBooking(b.booking_id)}
                              className="rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">No bookings found for the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!!bookings?.links?.length && (
              <div className="flex flex-wrap gap-2 border-t border-slate-200 px-4 py-3">
                {bookings.links.map((l, i) => (
                  <Link
                    key={i}
                    href={l.url || "#"}
                    className={`rounded-lg border px-3 py-2 text-xs font-bold ${l.active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"} ${l.url ? "" : "pointer-events-none opacity-50"}`}
                    dangerouslySetInnerHTML={{ __html: l.label }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </AdminShell>
    </>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-800">{Number(value || 0)}</p>
    </div>
  );
}

function Badge({ value, kind = "status" }) {
  const v = String(value || "-").toLowerCase();

  const cls =
    kind === "payment"
      ? v === "paid"
        ? "bg-emerald-100 text-emerald-700"
        : v === "unpaid"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700"
      : v === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : v === "accepted" || v === "confirmed"
      ? "bg-sky-100 text-sky-700"
      : v === "cancelled"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-extrabold uppercase tracking-wide ${cls}`}>{v}</span>;
}

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const firstIso = first.getDay() === 0 ? 7 : first.getDay();
  const start = new Date(first);
  start.setDate(first.getDate() - (firstIso - 1));

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date: toDateInput(d),
      day: d.getDate(),
      isCurrentMonth: d.getMonth() === month,
    };
  });
}

function toDateInput(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyDate(dateStr) {
  const d = new Date(String(dateStr) + "T00:00:00");
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

function shortTime(t) {
  if (!t) return "-";
  return String(t).slice(0, 5);
}

function humanize(value) {
  return String(value || "-").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
