import React from "react";
import { Link } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";

export default function StripeResult({ ok = false, message = "", draft = null }) {
  return (
    <CustomerLayout title={ok ? "Payment Successful" : "Payment"} active="booking">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div
            className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full ${
              ok ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            {ok ? (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {ok ? "Deposit paid" : "Payment cancelled"}
          </h1>
          <p className="mb-6 text-slate-600">{message}</p>
          <Link
            href={route("customer.dashboard")}
            className="inline-flex justify-center rounded-xl bg-unispa-primary px-5 py-3 font-semibold text-white transition hover:bg-unispa-primaryDark"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
}
