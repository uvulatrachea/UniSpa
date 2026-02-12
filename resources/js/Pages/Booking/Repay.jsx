import React, { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import axios from "axios";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function Repay({ booking, qrUploadUrl, stripeSessionUrl, stripeMock = false }) {
  const { flash = {} } = usePage().props;
  const [loadingQr, setLoadingQr] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(flash?.error || "");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Auto-redirect to My Reservations after showing success
  useEffect(() => {
    if (!paymentSuccess) return;
    const timer = setTimeout(() => {
      router.visit("/bookings");
    }, 2500);
    return () => clearTimeout(timer);
  }, [paymentSuccess]);

  const payQr = () => {
    if (!receipt) {
      setErrorMsg("Please choose a receipt file first.");
      return;
    }

    setLoadingQr(true);
    setErrorMsg("");
    router.post(
      qrUploadUrl,
      { receipt },
      {
        forceFormData: true,
        onFinish: () => setLoadingQr(false),
        onError: (errs) => {
          const msg = Object.values(errs || {}).flat().join(" ") || "Upload failed. Please try again.";
          setErrorMsg(msg);
        },
      }
    );
  };

  const payStripe = async () => {
    try {
      setLoadingStripe(true);
      setErrorMsg("");
      const { data } = await axios.post(stripeSessionUrl, stripeMock ? { mock: true } : {});

      // Mock mode — payment confirmed instantly
      if (data?.mock) {
        setPaymentSuccess(true);
        return;
      }

      // Real Stripe — redirect to checkout
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setErrorMsg("Unable to create Stripe checkout session.");
    } catch (error) {
      const message = error?.response?.data?.error || "Payment failed. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoadingStripe(false);
    }
  };

  /* ── Payment Success Screen ── */
  if (paymentSuccess) {
    return (
      <CustomerLayout title="Payment Successful" active="reservations">
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900">Payment Successful!</h1>
          <p className="mt-3 text-lg font-semibold text-slate-600">
            Your booking has been confirmed.
          </p>
          <p className="mt-1 text-sm text-slate-500 font-semibold">
            Redirecting to My Reservations...
          </p>
          <button
            onClick={() => router.visit("/bookings")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-6 py-3 font-extrabold text-white shadow hover:opacity-95"
          >
            Go to My Reservations
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Pay Booking" active="reservations">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
          <Link
            href="/bookings"
            className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            &larr; Back to My Reservations
          </Link>

          <h1 className="mb-1 text-2xl font-black text-slate-900 sm:text-3xl">Pay for Booking</h1>
          <p className="mb-6 text-sm font-semibold text-slate-600">
            Choose your preferred payment method below.
          </p>

          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Booking details */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-extrabold text-slate-900">Booking Details</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Booking ID: {booking.booking_id}
            </p>
            <p className="text-sm font-semibold text-slate-600">
              Service: {booking.service_name}
            </p>
            {booking.slot_date && (
              <p className="text-sm font-semibold text-slate-600">
                Date: {booking.slot_date} &bull; {booking.start_time || "-"} - {booking.end_time || "-"}
              </p>
            )}
            <p className="mt-1 text-sm font-black text-slate-900">
              Amount: RM {Number(booking.final_amount).toFixed(2)}
            </p>
            <p className="text-sm font-black text-slate-900">
              Deposit (30%): RM {Number(booking.deposit_amount).toFixed(2)}
            </p>
          </div>

          {/* Option 1: Upload QR Receipt */}
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-extrabold text-slate-900">Option 1: Upload QR Payment Receipt</p>
            <img
              src="/images/unispaqr.jpg"
              alt="UniSpa QR"
              className="mb-3 w-full rounded-xl border border-slate-200 object-contain"
            />
            <p className="mb-2 text-xs font-semibold text-slate-500">
              Scan the QR above, then upload your payment proof below.
            </p>
            <input
              type="file"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            />
            {receipt && (
              <p className="mb-2 text-xs font-semibold text-emerald-700">
                Selected file: {receipt.name}
              </p>
            )}
            <button
              onClick={payQr}
              disabled={loadingQr}
              className="w-full rounded-2xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 font-extrabold text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {loadingQr ? "Uploading..." : "Upload Receipt"}
            </button>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              Staff will verify your receipt. Once approved, you'll get an email confirmation.
            </p>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase">or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Option 2: Pay with Card (Stripe) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 font-extrabold text-slate-900">Option 2: Pay with Card (Stripe)</p>
            <button
              onClick={payStripe}
              disabled={loadingStripe}
              className="w-full rounded-2xl bg-black px-5 py-3 font-extrabold text-white shadow hover:bg-slate-800 disabled:opacity-50"
            >
              {loadingStripe ? "Processing..." : `Pay RM ${Number(booking.deposit_amount).toFixed(2)} with Card`}
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
