import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";

export default function BookingFlow({ auth, categories, services, qrImageUrl }) {
  const customer = auth?.user || {};
  const username = customer?.name || "Guest";

  const [step, setStep] = useState(1);

  // category + service selection
  const [categoryId, setCategoryId] = useState("");
  const [serviceId, setServiceId] = useState("");

  // date/slots
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");

  // pax + guests
  const [pax, setPax] = useState(1);
  const [draftBooking, setDraftBooking] = useState(null);
  const [guests, setGuests] = useState([]);

  // payment
  const [paymentMethod, setPaymentMethod] = useState("qr");

  // UI states
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const extrasCount = Math.max(0, pax - 1);

  const selectedCategory = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    return list.find((c) => String(c.category_id) === String(categoryId));
  }, [categories, categoryId]);

  const servicesInCategory = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    if (!categoryId) return [];
    return list.filter((s) => String(s.category_id) === String(categoryId));
  }, [services, categoryId]);

  const selectedService = useMemo(() => {
    const list = Array.isArray(services) ? services : [];
    return list.find((s) => String(s.service_id) === String(serviceId));
  }, [services, serviceId]);

  const fmtTime = (t) => (t ? String(t).slice(0, 5) : "");

  const resetAfterServiceChange = () => {
    setSelectedDate("");
    setSlots([]);
    setSlotId("");
    setPax(1);
    setDraftBooking(null);
    setGuests([]);
    setPaymentMethod("qr");
  };

  const fetchSlots = async (date) => {
    setSelectedDate(date);
    setSlotId("");
    setErr("");

    if (!serviceId || !date) return;

    setLoading(true);
    try {
      const res = await fetch("/booking/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ service_id: serviceId, date }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load slots");
      setSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const createDraft = async () => {
    setErr("");
    if (!serviceId || !slotId) {
      setErr("Please select a service and time slot first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/booking/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({
          service_id: serviceId,
          slot_id: slotId,
          pax,
          special_requests: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create booking draft");

      setDraftBooking(data.booking);

      // init guest forms (extras only)
      const init = Array.from({ length: extrasCount }).map(() => ({
        name: "",
        email: "",
        phone: "",
        is_uitm_member: false,
      }));
      setGuests(init);

      setStep(extrasCount > 0 ? 4 : 5);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGuestsApi = async () => {
    setErr("");

    if (extrasCount === 0) {
      setStep(5);
      return;
    }

    for (const g of guests) {
      if (!g.name || !g.phone) {
        setErr("Please fill name and phone for all extra guests.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/booking/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({
          booking_id: draftBooking.booking_id,
          pax,
          service_id: serviceId,
          guests,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save guest details");
      setDraftBooking(data.booking);
      setStep(5);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // QR “I have paid” -> sets payment_method=qr + payment_status=pending (admin verify)
  const payQr = async () => {
    if (!draftBooking?.booking_id) return;

    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/payment/qr/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ booking_id: draftBooking.booking_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "QR payment update failed");

      window.location.href = "/bookings";
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Stripe -> backend creates session and returns { url }
  const payStripe = async () => {
    if (!draftBooking?.booking_id) return;

    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/payment/stripe/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ booking_id: draftBooking.booking_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Stripe session failed");

      // redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  };

  // --- UI helpers ---
  const StepBox = ({ n, label }) => (
    <div
      style={{
        flex: 1,
        padding: 10,
        borderRadius: 12,
        background: n <= step ? "#5d3a7f" : "#e5e7eb",
        color: n <= step ? "#fff" : "#111",
        textAlign: "center",
        fontWeight: 800,
        fontSize: 13,
      }}
    >
      {label}
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Book Appointment</h2>
          <div style={{ opacity: 0.8 }}>Hi, {username}</div>
        </div>
        <Link href="/dashboard">Back</Link>
      </div>

      {/* Step bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StepBox n={1} label="1. Services" />
        <StepBox n={2} label="2. Date & Time" />
        <StepBox n={3} label="3. Pax" />
        <StepBox n={4} label="4. Guests" />
        <StepBox n={5} label="5. Payment" />
      </div>

      {err && (
        <div style={{ background: "#fee2e2", padding: 12, borderRadius: 12, marginBottom: 16 }}>
          <b>Error:</b> {err}
        </div>
      )}

      {/* STEP 1: categories + services */}
      {step === 1 && (
        <div>
          <h3 style={{ marginTop: 0 }}>Select Service Category</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {(Array.isArray(categories) ? categories : []).map((c) => (
              <button
                key={c.category_id}
                onClick={() => {
                  setCategoryId(c.category_id);
                  setServiceId("");
                  resetAfterServiceChange();
                }}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: String(categoryId) === String(c.category_id) ? "2px solid #5d3a7f" : "1px solid #ddd",
                  background: String(categoryId) === String(c.category_id) ? "#f3f0ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: 900,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 18 }}>{c.icon ? <i className={`fas ${c.icon}`} /> : <i className="fas fa-spa" />}</div>
                  <div>
                    <div>{c.name}</div>
                    {c.description ? <div style={{ opacity: 0.7, fontWeight: 600, fontSize: 12 }}>{c.description}</div> : null}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {categoryId && (
            <>
              <h3 style={{ marginTop: 20 }}>
                {selectedCategory?.name || "Services"}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {servicesInCategory.map((s) => (
                  <div
                    key={s.service_id}
                    onClick={() => {
                      setServiceId(s.service_id);
                      resetAfterServiceChange();
                    }}
                    style={{
                      border: String(serviceId) === String(s.service_id) ? "3px solid #5d3a7f" : "1px solid #ddd",
                      borderRadius: 14,
                      padding: 12,
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    <img
                      src={s.image_url}
                      alt={s.name}
                      style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }}
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x350?text=Service")}
                    />
                    <div style={{ fontWeight: 900, marginTop: 8 }}>{s.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 13, minHeight: 34 }}>{s.description}</div>
                    <div style={{ marginTop: 8, fontWeight: 900 }}>
                      RM{s.price} • {s.duration_minutes} mins
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={() => { setCategoryId(""); setServiceId(""); }}>
                  Back
                </button>
                <button
                  disabled={!serviceId}
                  onClick={() => setStep(2)}
                  style={{ padding: "12px 18px", borderRadius: 12, fontWeight: 900 }}
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 2: date & slots */}
      {step === 2 && (
        <div>
          <h3 style={{ marginTop: 0 }}>Select Date & Time</h3>

          <div style={{ marginBottom: 10, opacity: 0.85 }}>
            <b>Selected service:</b> {selectedService?.name || "-"}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontWeight: 800 }}>Date: </label>{" "}
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => fetchSlots(e.target.value)}
            />
          </div>

          {loading ? (
            <div>Loading slots...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {slots.map((sl) => (
                <button
                  key={sl.slot_id}
                  onClick={() => setSlotId(sl.slot_id)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: String(slotId) === String(sl.slot_id) ? "2px solid #5d3a7f" : "1px solid #ddd",
                    background: String(slotId) === String(sl.slot_id) ? "#f3f0ff" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{fmtTime(sl.start_time)} - {fmtTime(sl.end_time)}</div>
                  <div style={{ opacity: 0.8, fontSize: 13 }}>{sl.staff_name}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(1)}>Back</button>
            <button disabled={!slotId} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: pax */}
      {step === 3 && (
        <div>
          <h3 style={{ marginTop: 0 }}>How many people?</h3>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPax(n)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: pax === n ? "2px solid #5d3a7f" : "1px solid #ddd",
                  background: pax === n ? "#f3f0ff" : "#fff",
                  fontWeight: 900,
                }}
              >
                {n} pax
              </button>
            ))}
          </div>

          <div style={{ marginTop: 12, opacity: 0.85 }}>
            If pax &gt; 1, we will ask extra guest details next.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setStep(2)}>Back</button>
            <button onClick={createDraft} disabled={loading}>
              Continue to Checkout
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: guests */}
      {step === 4 && draftBooking && (
        <div>
          <h3 style={{ marginTop: 0 }}>Extra Guest Details</h3>
          <div style={{ marginBottom: 8, opacity: 0.85 }}>
            You selected {pax} pax → Please fill {extrasCount} extra guest(s).
          </div>

          {guests.map((g, idx) => (
            <div key={idx} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Guest {idx + 2}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  placeholder="Name"
                  value={g.name}
                  onChange={(e) => {
                    const copy = [...guests];
                    copy[idx] = { ...copy[idx], name: e.target.value };
                    setGuests(copy);
                  }}
                />
                <input
                  placeholder="Phone"
                  value={g.phone}
                  onChange={(e) => {
                    const copy = [...guests];
                    copy[idx] = { ...copy[idx], phone: e.target.value };
                    setGuests(copy);
                  }}
                />
                <input
                  placeholder="Email (optional)"
                  value={g.email}
                  onChange={(e) => {
                    const copy = [...guests];
                    copy[idx] = { ...copy[idx], email: e.target.value };
                    setGuests(copy);
                  }}
                />

                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
                  <input
                    type="checkbox"
                    checked={g.is_uitm_member}
                    onChange={(e) => {
                      const copy = [...guests];
                      copy[idx] = { ...copy[idx], is_uitm_member: e.target.checked };
                      setGuests(copy);
                    }}
                  />
                  UiTM Member?
                </label>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(3)}>Back</button>
            <button onClick={saveGuestsApi} disabled={loading}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: payment */}
      {step === 5 && draftBooking && (
        <div>
          <h3 style={{ marginTop: 0 }}>Payment</h3>

          <div style={{ marginBottom: 10 }}>
            <b>Subtotal:</b> RM{Number(draftBooking.subtotal_amount || 0).toFixed(2)} <br />
            <b>Discount:</b> RM{Number(draftBooking.discount_amount || 0).toFixed(2)} <br />
            <b>Total:</b> RM{Number(draftBooking.final_amount || 0).toFixed(2)}
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => setPaymentMethod("qr")}
              style={{
                fontWeight: 900,
                padding: "10px 14px",
                borderRadius: 12,
                border: paymentMethod === "qr" ? "2px solid #5d3a7f" : "1px solid #ddd",
                background: paymentMethod === "qr" ? "#f3f0ff" : "#fff",
              }}
            >
              QR Payment
            </button>

            <button
              onClick={() => setPaymentMethod("stripe")}
              style={{
                fontWeight: 900,
                padding: "10px 14px",
                borderRadius: 12,
                border: paymentMethod === "stripe" ? "2px solid #5d3a7f" : "1px solid #ddd",
                background: paymentMethod === "stripe" ? "#f3f0ff" : "#fff",
              }}
            >
              Stripe (Card)
            </button>
          </div>

          {paymentMethod === "qr" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Scan QR to Pay</div>
              <img src={qrImageUrl} alt="QR" style={{ width: 220, borderRadius: 12 }} />

              <div style={{ marginTop: 10, opacity: 0.85 }}>
                After payment, click below. Status will be set to <b>pending verification</b>.
              </div>

              <button onClick={payQr} disabled={loading} style={{ marginTop: 10 }}>
                I Have Paid
              </button>
            </div>
          )}

          {paymentMethod === "stripe" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Pay by Card</div>
              <button onClick={payStripe} disabled={loading}>
                Pay with Stripe
              </button>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Link href="/bookings">Go to My Appointments</Link>
          </div>
        </div>
      )}
    </div>
  );
}
