import React, { useEffect, useMemo, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function Appointments({ auth, appointments, highlightBookingId = null }) {
  const user = auth?.user || {};
  const username = user?.name || "Guest";
  const list = appointments?.data || [];
  const flash = usePage().props?.flash || {};
  const [toast, setToast] = useState({ open: false, type: "success", text: "" });

  const energeticMessage = useMemo(() => {
    const base = flash?.success || flash?.error;
    if (!base) return null;

    if (flash?.error) {
      return {
        type: "error",
        text: `Heads up, ${username}! ${base}`,
      };
    }

    const lower = String(base).toLowerCase();
    if (lower.includes("receipt") || lower.includes("upload")) {
      return {
        type: "success",
        text: `Hi, ${username}! 🎉 Your QR payment receipt has been uploaded successfully. We’ll verify it and keep you posted soon.`,
      };
    }

    return {
      type: "success",
      text: `Hi, ${username}! ${base}`,
    };
  }, [flash?.success, flash?.error, username]);

  useEffect(() => {
    if (!energeticMessage) return;
    setToast({ open: true, type: energeticMessage.type, text: energeticMessage.text });
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 5500);
    return () => clearTimeout(timer);
  }, [energeticMessage]);

  const cancelBooking = (bookingId) => {
    if (!confirm("Cancel this booking? This action cannot be undone.")) return;
    router.patch(`/bookings/${bookingId}/cancel`, {}, { preserveScroll: true });
  };

  const editDetails = (bookingId, currentDetails = "") => {
    const special_requests = prompt("Edit special requests:", currentDetails || "");
    if (special_requests === null) return;

    router.patch(
      `/bookings/${bookingId}/details`,
      { special_requests },
      { preserveScroll: true }
    );
  };

  return (
    <CustomerLayout title="My Reservations" active="reservations">

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="rounded-2xl bg-white shadow-xl border border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-unispa-primaryDark">My Reservations</h1>
              <p className="mt-1 text-slate-600 font-semibold">
                Check when to attend, payment status, and reservation details.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/booking/services"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-unispa-primaryDark px-4 py-2 font-extrabold text-unispa-primaryDark hover:bg-unispa-muted"
              >
                <i className="fas fa-spa" /> Browse Services
              </Link>
              <Link
                href="/booking/services"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-4 py-2 font-extrabold text-white shadow"
              >
                <i className="fas fa-plus" /> New Booking
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div
            className={`fixed right-4 top-24 z-50 w-[calc(100%-2rem)] max-w-md transform rounded-2xl border px-4 py-4 shadow-2xl transition-all duration-500 ${
              toast.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            } ${toast.open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-12 opacity-0"}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5 text-lg">{toast.type === "error" ? "⚠️" : "✅"}</div>
              <p className="flex-1 text-sm font-bold leading-relaxed">{toast.text}</p>
              <button
                onClick={() => setToast((prev) => ({ ...prev, open: false }))}
                className="rounded-lg px-2 py-1 text-xs font-black hover:bg-black/5"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          </div>

          {list.length ? (
            list.map((a) => {
              const isHighlighted = highlightBookingId && String(highlightBookingId) === String(a.booking_id);

              return (
                <article
                  key={a.booking_id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm ${
                    isHighlighted ? "border-unispa-primary ring-2 ring-unispa-primary/30" : "border-slate-100"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                          {a.service_name || "Spa Service"}
                        </h3>
                        <StatusBadge status={a.status} />
                      </div>

                      <div className="mt-2 text-sm font-semibold text-slate-700 flex flex-wrap gap-x-5 gap-y-1">
                        <span><i className="fas fa-calendar-day" /> {formatDate(a.slot_date)}</span>
                        <span><i className="fas fa-clock" /> {a.start_time || "-"} - {a.end_time || "-"}</span>
                        <span><i className="fas fa-users" /> {a.participants_count || 1} attendee(s)</span>
                      </div>

                      {a.participants?.length ? (
                        <p className="mt-2 text-sm text-slate-500">
                          Attendees: {a.participants.map((p) => (p?.is_self ? `You (${p?.name || "-"})` : p?.name || "Guest")).join(", ")}
                        </p>
                      ) : null}

                      {a.special_requests ? (
                        <p className="mt-2 text-sm rounded-lg bg-unispa-muted/40 px-3 py-2 text-unispa-primaryDark font-semibold">
                          <i className="fas fa-notes-medical" /> Special request: {a.special_requests}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-slate-500 font-semibold">
                        {a.manage_cutoff_label}
                      </p>
                    </div>

                    <div className="relative w-full lg:w-auto lg:text-right">
                      <div className="text-sm text-slate-500 font-bold">Payment</div>
                      <div className="font-extrabold text-slate-800 capitalize">
                        {a.payment_method || "-"} / {a.payment_status || "-"}
                      </div>
                      <div className="mt-2 text-lg font-extrabold text-unispa-primaryDark">
                        RM {Number(a.final_amount || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">
                        Deposit RM {Number(a.deposit_amount || 0).toFixed(2)}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 lg:justify-end">
                        {a.qr_receipt_url ? (
                          <a
                            href={a.qr_receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            <i className="fas fa-receipt" /> View Uploaded QR Slip
                          </a>
                        ) : null}

                        {a.booking_receipt_url ? (
                          <a
                            href={a.booking_receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            <i className="fas fa-file-invoice" /> Booking Receipt
                          </a>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-col gap-2 lg:items-end">
                        {a.google_calendar_url ? (
                          <a
                            href={a.google_calendar_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 lg:w-64"
                          >
                            📅 Add to Google Calendar
                          </a>
                        ) : (
                          <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400 lg:w-64">
                            📅 Google Calendar unavailable
                          </div>
                        )}

                        <button
                          onClick={() => editDetails(a.booking_id, a.special_requests || "")}
                          disabled={!a.can_manage}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40 lg:w-64"
                        >
                          Edit details
                        </button>

                        <button
                          onClick={() => cancelBooking(a.booking_id)}
                          disabled={!a.can_manage}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40 lg:w-64"
                        >
                          Cancel booking
                        </button>
                      </div>

                      {!a.can_manage ? (
                        <p className="mt-2 text-[11px] font-bold text-amber-700 lg:text-right">
                          Edit/cancel disabled less than 24h before slot.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="text-4xl text-slate-300"><i className="fas fa-calendar-times" /></div>
              <p className="mt-3 text-slate-700 font-extrabold">No reservations yet.</p>
              <p className="text-sm text-slate-500 mt-1">Start by choosing your preferred spa service.</p>
              <Link
                href="/booking/services"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 text-white font-extrabold"
              >
                <i className="fas fa-spa" /> Book Your First Reservation
              </Link>
            </div>
          )}
        </section>

        {appointments?.links?.length > 3 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {appointments.links.map((l, i) => (
              <Link
                key={i}
                href={l.url || "#"}
                className={`rounded-lg border px-3 py-2 text-sm font-bold ${
                  l.active
                    ? "border-unispa-primaryDark bg-unispa-primaryDark text-white"
                    : "border-slate-300 bg-white text-slate-700"
                } ${l.url ? "" : "pointer-events-none opacity-50"}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </main>
    </CustomerLayout>
  );
}

function formatDate(v) {
  if (!v) return "Date not set";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-MY", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }) {
  const s = String(status || "pending").toLowerCase();
  const cls =
    s === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : s === "accepted"
      ? "bg-sky-100 text-sky-700"
      : s === "cancelled"
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${cls}`}>{s}</span>;
}
