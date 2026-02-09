import { Head } from "@inertiajs/react";
import AdminShell from "./Partials/AdminShell";

export default function AdminModule({ title, description, kpis = {} }) {
  const entries = Object.entries(kpis || {});

  return (
    <>
      <Head title={title || "Admin Module"} />

      <AdminShell
        title={title || "Admin Module"}
        subtitle="Module workspace is ready. Core management workflows can be expanded here."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="inline-flex rounded-full bg-unispa-muted px-3 py-1 text-xs font-extrabold text-unispa-primaryDark">
            UCD Module
          </p>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-800">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">{description}</p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {entries.length ? (
            entries.map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{humanize(key)}</p>
                <p className="mt-2 text-3xl font-extrabold text-unispa-primaryDark">{formatValue(value)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 sm:col-span-2 xl:col-span-4">
              No KPI data configured yet.
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">Implementation note</p>
          <p className="mt-1">
            This module page is intentionally scaffolded so you can continue feature-by-feature based on your UCD
            (CRUD forms, validation flows, conflict rules, WhatsApp notifications, and audit logs).
          </p>
        </section>
      </AdminShell>
    </>
  );
}

function humanize(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatValue(value) {
  if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(1);
  return value ?? "-";
}