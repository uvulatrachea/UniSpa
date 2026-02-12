import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function Payment({ preview = [], totalFinal = 0, totalDeposit = 0, qrUploadUrl, stripeSessionUrl, stripeMock = false }) {
  const { auth, errors = {}, flash = {} } = usePage().props;
  const username = auth?.user?.name || "Guest";
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
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

  const payStripe = async () => {
    try {
      setLoadingStripe(true);
      setErrorMsg("");
      const { data } = await axios.post(
        stripeSessionUrl,
        stripeMock ? { mock: true } : {}
      );

      // Mock mode — payment confirmed instantly, show success screen
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
      const message =
        error?.response?.data?.error ||
        "Payment failed. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoadingStripe(false);
    }
  };

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

  /* ── Payment Success Screen ── */
  if (paymentSuccess) {
    return (
      <CustomerLayout title="Payment Successful" active="booking">
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

  /* ── Normal Payment Page ── */
  return (
    <CustomerLayout title="Payment" active="booking">

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="ui-card p-5 sm:p-7">
          <h1 className="mb-1 text-2xl font-black text-slate-900 sm:text-3xl">Payment</h1>
          <p className="mb-6 text-sm font-semibold text-slate-600">Complete deposit payment to confirm your booking.</p>

          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Booking Summary */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-extrabold text-slate-900">Booking Summary</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Items: {preview.length}</p>
            <p className="text-sm font-semibold text-slate-600">Total: RM {Number(totalFinal).toFixed(2)}</p>
            <p className="mt-1 text-sm font-black text-slate-900">Deposit (30%): RM {Number(totalDeposit).toFixed(2)}</p>
          </div>

          {/* Option 1: Upload QR Receipt */}
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-extrabold text-slate-900">Option 1: Upload QR Payment Receipt</p>
            <img
              src="/images/unispaqr.jpg"
              alt="UniSpa QR"
              className="mb-3 w-full rounded-xl border border-slate-200 object-contain"
            />
            <p className="mb-2 text-xs font-semibold text-slate-500">Scan the QR above, then upload your payment proof below.</p>
            <input
              type="file"
              onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            />
            {receipt ? <p className="mb-2 text-xs font-semibold text-emerald-700">Selected file: {receipt.name}</p> : null}
            {errors?.receipt ? <p className="mb-2 text-xs font-semibold text-rose-600">{errors.receipt}</p> : null}
            <button
              onClick={payQr}
              disabled={loadingQr}
              className="w-full rounded-xl bg-gradient-to-r from-unispa-primaryDark to-unispa-primary px-5 py-3 font-extrabold text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {loadingQr ? "Uploading..." : "Upload Receipt"}
            </button>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              Staff will verify your receipt. Once approved, you'll receive an email confirmation.
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
              className="w-full rounded-xl bg-black px-5 py-3 font-extrabold text-white shadow hover:bg-slate-800 disabled:opacity-50"
            >
              {loadingStripe ? "Processing..." : `Pay RM ${Number(totalDeposit).toFixed(2)} with Card`}
            </button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
