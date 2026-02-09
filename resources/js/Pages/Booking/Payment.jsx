import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function Payment({ preview = [], totalFinal = 0, totalDeposit = 0, qrUploadUrl, stripeSessionUrl, stripeMock = false }) {
  const { auth, errors = {} } = usePage().props;
  const username = auth?.user?.name || "Guest";
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const payStripe = async () => {
    try {
      setLoadingStripe(true);
      const { data } = await axios.post(
        stripeSessionUrl,
        stripeMock ? { mock: true } : {}
      );
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      alert("Unable to create Stripe checkout session.");
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        "Stripe setup failed. Please try again.";
      alert(message);
    } finally {
      setLoadingStripe(false);
    }
  };

  const payQr = () => {
    if (!receipt) {
      alert("Please choose a receipt file first.");
      return;
    }

    setLoadingQr(true);
    router.post(
      qrUploadUrl,
      { receipt },
      {
        forceFormData: true,
        onFinish: () => setLoadingQr(false),
      }
    );
  };

  return (
    <CustomerLayout title="Payment" active="booking">

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <div className="ui-card p-5 sm:p-7">
          <h1 className="mb-1 text-2xl font-black text-slate-900 sm:text-3xl">Payment</h1>
          <p className="mb-6 text-sm font-semibold text-slate-600">Complete deposit payment to confirm your booking.</p>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-extrabold text-slate-900">Booking Summary</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">Items: {preview.length}</p>
            <p className="text-sm font-semibold text-slate-600">Total: RM {Number(totalFinal).toFixed(2)}</p>
            <p className="mt-1 text-sm font-black text-slate-900">Deposit (30%): RM {Number(totalDeposit).toFixed(2)}</p>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-extrabold text-slate-900">Pay with QR (upload receipt)</p>
            <img
              src="/images/unispaqr.jpg"
              alt="UniSpa QR"
              className="mb-3 w-full rounded-xl border border-slate-200 object-contain"
            />
            <p className="mb-2 text-xs font-semibold text-slate-500">Scan this QR and upload your payment proof below.</p>
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
              className="ui-btn-secondary w-full"
            >
              {loadingQr ? "Uploading..." : "Confirm Payment (Upload QR Receipt)"}
            </button>
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              After upload, you will be redirected to My Reservations with a confirmation notice.
            </p>
          </div>

          <button
            onClick={payStripe}
            disabled={loadingStripe}
            className="ui-btn-primary w-full"
          >
            {loadingStripe ? "Redirecting..." : "Pay with Card (Stripe)"}
          </button>

          {stripeMock && (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Mock mode is enabled: Stripe checkout page is skipped and payment is marked as successful directly.
            </p>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
