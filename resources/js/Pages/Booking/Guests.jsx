import React, { useMemo, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function Guests({ cartItems = [], savedGuests = [], self = {} }) {
  const { auth } = usePage().props;
  const username = auth?.user?.name || "Guest";
  const toPax = (item) => Number(item?.quantity ?? item?.pax ?? item?.participants?.length ?? 1);

  const initialGuests = useMemo(() => {
    return (Array.isArray(cartItems) ? cartItems : []).map((item, bookingIndex) => {
      const pax = Math.max(1, toPax(item));
      const saved = (savedGuests || []).find((g) => Number(g.bookingIndex) === bookingIndex);
      const fromItem = Array.isArray(item?.participants) ? item.participants : [];
      const source = saved?.list?.length ? saved.list : fromItem;

      const list = Array.from({ length: pax }).map((_, idx) => {
        const existing = source[idx] || {};
        const isSelf = idx === 0;
        return {
          is_self: isSelf,
          name: existing.name ?? (isSelf ? self?.name ?? "" : ""),
          phone: existing.phone ?? (isSelf ? self?.phone ?? "" : ""),
          email: existing.email ?? (isSelf ? self?.email ?? "" : ""),
          is_uitm_member: Boolean(existing.is_uitm_member ?? (isSelf ? self?.is_uitm_member ?? false : false)),
        };
      });

      return { bookingIndex, list };
    });
  }, [cartItems, savedGuests, self]);

  const [guests, setGuests] = useState(initialGuests);
  const [submitting, setSubmitting] = useState(false);

  const updateGuest = (bookingIndex, guestIndex, key, value) => {
    setGuests((prev) =>
      prev.map((b) => {
        if (b.bookingIndex !== bookingIndex) return b;
        return {
          ...b,
          list: b.list.map((g, idx) => (idx === guestIndex ? { ...g, [key]: value } : g)),
        };
      })
    );
  };

  const submit = () => {
    setSubmitting(true);
    router.post(route("booking.guests.save"), { guests }, {
      onFinish: () => setSubmitting(false),
    });
  };

  return (
    <CustomerLayout title="Guest Details" active="booking">

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="ui-card p-5 sm:p-7">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Guest Information</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Complete attendee details for each booking item.
          </p>

          <div className="mt-6 space-y-5">
            {guests.map((booking) => (
              <div key={booking.bookingIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-700">
                  Booking #{booking.bookingIndex + 1}
                </p>

                <div className="space-y-4">
                  {booking.list.map((g, guestIndex) => (
                    <div key={guestIndex} className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 text-sm font-bold text-slate-800">
                        {g.is_self ? "Your details" : `Guest ${guestIndex}`}
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          placeholder="Name"
                          className="ui-input"
                          value={g.name || ""}
                          onChange={(e) => updateGuest(booking.bookingIndex, guestIndex, "name", e.target.value)}
                        />

                        <input
                          placeholder="Phone"
                          className="ui-input"
                          value={g.phone || ""}
                          onChange={(e) => updateGuest(booking.bookingIndex, guestIndex, "phone", e.target.value)}
                        />

                        <input
                          placeholder="Email (optional)"
                          className="ui-input sm:col-span-2"
                          value={g.email || ""}
                          onChange={(e) => updateGuest(booking.bookingIndex, guestIndex, "email", e.target.value)}
                        />
                      </div>

                      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!g.is_uitm_member}
                          onChange={(e) => updateGuest(booking.bookingIndex, guestIndex, "is_uitm_member", e.target.checked)}
                        />
                        UiTM Member
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              href={route("booking.schedule")}
              className="ui-btn-secondary"
            >
              Back
            </Link>

            <button
              onClick={submit}
              disabled={submitting}
              className="ui-btn-primary"
            >
              {submitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
