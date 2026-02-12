import React, { useEffect, useMemo, useState } from "react";
import { Link, router } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function AppointmentI({ auth, services = [], selectedServiceId = null }) {
  const customer = auth?.user || {};
  const username = customer?.name || "Guest";
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content;

  const [selectedService, setSelectedService] = useState(selectedServiceId || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (selectedServiceId) setSelectedService(String(selectedServiceId));
  }, [selectedServiceId]);

  const normalized = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    return list.map((s) => ({
      service_id: s.service_id ?? s.id,
      name: s.name ?? "Service",
      description: s.description ?? "",
      price: Number(s.price ?? 0),
      duration_minutes: Number(s.duration_minutes ?? 0),
      image: s.image ?? s.image_url ?? "https://placehold.co/900x600/5B21B6/ffffff?text=Service",
    }));
  }, [services]);

  const selectedServiceData = normalized.find((s) => String(s.service_id) === String(selectedService));

  const handleServiceChange = (serviceId) => {
    setSelectedService(String(serviceId));
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot("");
    setBookingError("");
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    setBookingError("");

    if (!selectedService || !date) return;

    setIsLoading(true);
    try {
      const res = await fetch("/booking/slots", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf || "",
          "Accept": "application/json",
        },
        body: JSON.stringify({ service_id: Number(selectedService), date }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch slots");

      setAvailableSlots(data?.slots || []);
    } catch (e) {
      setBookingError(e.message || "Failed to fetch available slots");
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!selectedService || !selectedSlot) {
      setBookingError("Please select a service and time slot");
      return;
    }

    setIsLoading(true);
    try {
      // Create booking draft (legacy endpoint). Then send user to reservations list.
      const res = await fetch("/booking/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrf || "",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          service_id: Number(selectedService),
          slot_id: Number(selectedSlot),
          special_requests: specialRequests || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to book appointment");

      setBookingSuccess(true);
      setTimeout(() => router.visit("/bookings"), 800);
    } catch (e) {
      setBookingError(e.message || "Failed to book appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerLayout title="Book Appointment" active="reservations">
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Book Appointment</h1>
              <p className="mt-1 text-sm font-semibold text-slate-600">Hi, {username}. Choose a service, date and slot.</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/bookings"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
              >
                My Appointments
              </Link>
            </div>
          </div>

          {bookingSuccess ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              Booking created. Redirecting to My Appointments…
            </div>
          ) : null}

          <form onSubmit={handleBookingSubmit} className="mt-6 space-y-6">
            <div>
              <div className="text-sm font-black text-slate-800">1) Choose Service</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {normalized.map((s) => (
                  <button
                    type="button"
                    key={s.service_id}
                    onClick={() => handleServiceChange(s.service_id)}
                    className={`rounded-2xl border p-4 text-left shadow-sm transition hover:shadow ${
                      String(selectedService) === String(s.service_id)
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="font-extrabold truncate">{s.name}</div>
                    <div className={`mt-1 text-sm line-clamp-2 ${String(selectedService) === String(s.service_id) ? "text-white/80" : "text-slate-600"}`}>
                      {s.description}
                    </div>
                    <div className={`mt-3 flex items-center justify-between text-sm font-bold ${String(selectedService) === String(s.service_id) ? "text-white/90" : "text-slate-700"}`}>
                      <span><i className="fas fa-clock" /> {s.duration_minutes} mins</span>
                      <span>RM {s.price.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedService ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <div className="text-sm font-black text-slate-800">2) Select Date</div>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="ui-input mt-2"
                  />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800">3) Select Slot</div>
                  <div className="mt-2">
                    {isLoading ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">
                        Loading available slots…
                      </div>
                    ) : selectedDate && availableSlots.length ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {availableSlots.map((slot) => (
                          <button
                            type="button"
                            key={slot.slot_id}
                            onClick={() => setSelectedSlot(String(slot.slot_id))}
                            className={`rounded-xl border px-3 py-2 text-left text-sm font-extrabold ${
                              String(selectedSlot) === String(slot.slot_id)
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white hover:border-slate-400"
                            }`}
                          >
                            <div>
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className={`text-xs font-semibold ${String(selectedSlot) === String(slot.slot_id) ? "text-white/80" : "text-slate-500"}`}>
                              {slot.staff_name || ""}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">
                        {selectedDate ? "No slots available. Try another date." : "Pick a date to see slots."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {selectedSlot ? (
              <div>
                <div className="text-sm font-black text-slate-800">4) Special Requests (optional)</div>
                <textarea
                  rows={4}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="ui-textarea mt-2"
                  placeholder="Any preferences, allergies, etc."
                />
              </div>
            ) : null}

            {selectedServiceData && selectedSlot ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-black text-slate-900">Summary</div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">
                      {selectedServiceData.name} • {selectedDate}
                    </div>
                  </div>
                  <div className="text-lg font-black text-slate-900">RM {Number(selectedServiceData.price).toFixed(2)}</div>
                </div>

                {bookingError ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                    {bookingError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            ) : null}
          </form>
        </section>
      </main>
    </CustomerLayout>
  );
}
