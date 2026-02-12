import { Head, Link, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import StaffShell from "./Partials/StaffShell";

export default function StaffAvailability({
  staffName,
  requiredHours = 12,
  officeHours = { start: "10:00", end: "19:00" },
  filters = {},
  existing = [],
  draftEntries = [],
}) {
  const { flash = {} } = usePage().props;

  const [weekStart, setWeekStart] = useState(filters.week_start || todayISO());

  const defaultEntries = useMemo(() => {
    if ((draftEntries || []).length) return draftEntries;
    return [
      { schedule_date: filters.week_start || todayISO(), start_time: "10:00", end_time: "13:00" },
      { schedule_date: filters.week_start || todayISO(), start_time: "14:00", end_time: "17:00" },
    ];
  }, [draftEntries, filters.week_start]);

  const [entries, setEntries] = useState(defaultEntries);

  const weekDays = useMemo(() => {
    const start = new Date(weekStart + "T00:00:00");
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return toDateInput(d);
    });
  }, [weekStart]);

  const existingByDate = useMemo(() => {
    const map = {};
    (existing || []).forEach((r) => {
      const d = String(r.schedule_date);
      map[d] = map[d] || [];
      map[d].push(r);
    });
    return map;
  }, [existing]);

  const totalMinutes = useMemo(() => {
    return entries.reduce((acc, e) => acc + diffMinutes(e.start_time, e.end_time), 0);
  }, [entries]);

  const uniqueDays = useMemo(() => new Set(entries.map((e) => e.schedule_date)).size, [entries]);

  const remainingMinutes = useMemo(
    () => Math.max(0, requiredHours * 60 - totalMinutes),
    [requiredHours, totalMinutes]
  );

  const progressPct = useMemo(() => {
    if (!requiredHours) return 0;
    return Math.min(100, Math.round((totalMinutes / (requiredHours * 60)) * 100));
  }, [requiredHours, totalMinutes]);

  const validation = useMemo(() => {
    const errors = [];
    if (uniqueDays < 2) errors.push("Minimum 2 different days per week.");
    if (totalMinutes < requiredHours * 60) errors.push(`Minimum ${requiredHours} hours per week.`);

    // Office hours check.
    const outOfOffice = entries.some((e) => e.start_time < officeHours.start || e.end_time > officeHours.end);
    if (outOfOffice) errors.push(`Office hours only (${officeHours.start} - ${officeHours.end}).`);

    // End after start.
    const invalidRange = entries.some((e) => toMinutes(e.end_time) <= toMinutes(e.start_time));
    if (invalidRange) errors.push("End time must be after start time.");

    // Must be inside the chosen week (Mon-Sun) on UI too.
    const allowed = new Set(weekDays);
    const outOfWeek = entries.some((e) => !allowed.has(String(e.schedule_date)));
    if (outOfWeek) errors.push("All entries must be within this week (Mon-Sun).");

    // Local overlap within entries for same date.
    const byDate = new Map();
    entries.forEach((e, idx) => {
      const d = String(e.schedule_date);
      if (!byDate.has(d)) byDate.set(d, []);
      byDate.get(d).push({ ...e, idx });
    });
    for (const [d, list] of byDate.entries()) {
      const sorted = list.slice().sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (overlap(toMinutes(sorted[i].start_time), toMinutes(sorted[i].end_time), toMinutes(sorted[j].start_time), toMinutes(sorted[j].end_time))) {
            errors.push(`Overlapping entries on ${prettyDate(d)}.`);
            i = sorted.length;
            break;
          }
        }
      }
    }

    const ok = errors.length === 0;
    return { ok, errors };
  }, [entries, totalMinutes, uniqueDays, requiredHours, officeHours.start, officeHours.end, weekDays]);

  const draftValidation = useMemo(() => {
    const errors = [];

    // Office hours check.
    const outOfOffice = entries.some((e) => e.start_time < officeHours.start || e.end_time > officeHours.end);
    if (outOfOffice) errors.push(`Office hours only (${officeHours.start} - ${officeHours.end}).`);

    // End after start.
    const invalidRange = entries.some((e) => toMinutes(e.end_time) <= toMinutes(e.start_time));
    if (invalidRange) errors.push("End time must be after start time.");

    // Must be inside the chosen week (Mon-Sun) on UI too.
    const allowed = new Set(weekDays);
    const outOfWeek = entries.some((e) => !allowed.has(String(e.schedule_date)));
    if (outOfWeek) errors.push("All entries must be within this week (Mon-Sun).");

    // Local overlap within entries for same date.
    const byDate = new Map();
    entries.forEach((e, idx) => {
      const d = String(e.schedule_date);
      if (!byDate.has(d)) byDate.set(d, []);
      byDate.get(d).push({ ...e, idx });
    });
    for (const [d, list] of byDate.entries()) {
      const sorted = list.slice().sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (
            overlap(
              toMinutes(sorted[i].start_time),
              toMinutes(sorted[i].end_time),
              toMinutes(sorted[j].start_time),
              toMinutes(sorted[j].end_time)
            )
          ) {
            errors.push(`Overlapping entries on ${prettyDate(d)}.`);
            i = sorted.length;
            break;
          }
        }
      }
    }

    return { ok: errors.length === 0, errors };
  }, [entries, officeHours.start, officeHours.end, weekDays]);

  const reloadWeek = (newWeekStart) => {
    router.get(route("staff.availability"), { week_start: newWeekStart }, { preserveState: false });
  };

  const moveWeek = (offsetWeeks) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + offsetWeeks * 7);
    const next = toDateInput(startOfWeekISO(toDateInput(d)));
    setWeekStart(next);
    reloadWeek(next);
  };

  const addEntry = () => {
    setEntries((prev) => [
      ...prev,
      { schedule_date: weekDays[0], start_time: "10:00", end_time: "13:00" },
    ]);
  };

  const removeEntry = (idx) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const setEntry = (idx, key, value) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [key]: value } : e)));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!validation.ok) {
      alert("Please fix validation issues before submitting.");
      return;
    }

    const ok = window.confirm(
      "Submit availability to admin for approval? You cannot edit submitted slots unless admin rejects or you submit another draft for a different week."
    );
    if (!ok) return;

    router.post(
      route("staff.availability.store"),
      { week_start: weekStart, mode: "submit", entries },
      {
        preserveScroll: true,
        onSuccess: () => {
          // flash message will also appear, but user requested immediate feedback
          alert("Submitted! Waiting for admin approval. An email confirmation will be sent if mail is configured.");
        },
      }
    );
  };

  const saveDraft = () => {
    if (!draftValidation.ok) {
      alert("Please fix draft validation issues first.");
      return;
    }
    router.post(
      route("staff.availability.store"),
      { week_start: weekStart, mode: "draft", entries },
      {
        preserveScroll: true,
        onSuccess: () => {
          alert("Draft saved.");
        },
      }
    );
  };

  const totalHoursLabel = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  return (
    <>
      <Head title="My Availability" />
      <StaffShell
        title="My Availability"
        subtitle={`Hi ${staffName || "Student Staff"} — submit your weekly availability (min ${requiredHours} hours, min 2 days).`}
      >
        {(flash.success || flash.error) && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
              flash.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {flash.success || flash.error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Week</p>
              <p className="text-lg font-extrabold text-slate-800">
                {prettyDate(weekDays[0])} - {prettyDate(weekDays[6])}
              </p>
              <p className="text-sm text-slate-500">
                Office hours: <b>{officeHours.start}</b> - <b>{officeHours.end}</b> · Weekly minimum: <b>{requiredHours}h</b>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => moveWeek(-1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold">
                <i className="fas fa-chevron-left" />
              </button>
              <button type="button" onClick={() => moveWeek(1)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold">
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Kpi label="Selected days" value={uniqueDays} />
            <Kpi label="Total hours" value={totalHoursLabel} />
            <Kpi label="Status" value={validation.ok ? "Ready to submit" : "Fix errors"} tone={validation.ok ? "ok" : "warn"} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-extrabold text-slate-700">Weekly hours progress</p>
              <p className="text-sm font-bold text-slate-700">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m / {requiredHours}h
                {remainingMinutes > 0 ? (
                  <span className="ml-2 text-xs font-extrabold text-amber-700">
                    ({Math.floor(remainingMinutes / 60)}h {remainingMinutes % 60}m remaining)
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-extrabold text-emerald-700">(Reached)</span>
                )}
              </p>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white">
              <div
                className={`h-full rounded-full ${progressPct >= 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tip: you can <b>Save Draft</b> anytime. You can only <b>Submit for Approval</b> once you reach
              minimum hours and at least 2 different days.
            </p>
          </div>

          {!draftValidation.ok && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-extrabold">Please fix:</p>
              <ul className="mt-1 list-disc pl-5">
                {draftValidation.errors.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={submit} className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-700">Availability Entries</h3>
              <button type="button" onClick={addEntry} className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700">
                + Add
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-7">
              {weekDays.map((d) => (
                <div key={`day-${d}`} className="rounded-xl border border-slate-200 bg-white p-3 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-700">{prettyDate(d)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      existingByDate[d]?.some((x) => String(x.approval_status || '').toLowerCase() === 'pending')
                        ? 'bg-amber-100 text-amber-800'
                        : existingByDate[d]?.some((x) => String(x.approval_status || '').toLowerCase() === 'approved')
                          ? 'bg-emerald-100 text-emerald-700'
                          : existingByDate[d]?.some((x) => String(x.approval_status || '').toLowerCase() === 'draft')
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                    >
                      {existingByDate[d]?.some((x) => String(x.approval_status || '').toLowerCase() === 'pending')
                        ? 'PENDING'
                        : existingByDate[d]?.some((x) => String(x.approval_status || '').toLowerCase() === 'approved')
                          ? 'APPROVED'
                          : existingByDate[d]?.some((x) => String(x.approval_status || '').toLowerCase() === 'draft')
                            ? 'DRAFT'
                            : '—'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {entries
                      .map((e, idx) => ({ ...e, idx }))
                      .filter((e) => String(e.schedule_date) === String(d))
                      .map((e) => (
                        <div key={`entry-${d}-${e.idx}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-600">Start</label>
                              <input
                                type="time"
                                value={e.start_time}
                                onChange={(ev) => setEntry(e.idx, "start_time", ev.target.value)}
                                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-extrabold text-slate-600">End</label>
                              <input
                                type="time"
                                value={e.end_time}
                                onChange={(ev) => setEntry(e.idx, "end_time", ev.target.value)}
                                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                                required
                              />
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-500">
                              {Math.floor(diffMinutes(e.start_time, e.end_time) / 60)}h {diffMinutes(e.start_time, e.end_time) % 60}m
                            </p>
                            <button
                              type="button"
                              onClick={() => removeEntry(e.idx)}
                              className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] font-extrabold text-rose-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                    <button
                      type="button"
                      onClick={() => setEntries((prev) => ([
                        ...prev,
                        { schedule_date: d, start_time: "10:00", end_time: "13:00" },
                      ]))}
                      className="w-full rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700"
                    >
                      + Add slot
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Link href={route("staff.dashboard")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold">
                Back
              </Link>
              <button
                type="button"
                onClick={saveDraft}
                disabled={!draftValidation.ok}
                className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-extrabold text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                disabled={!validation.ok}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-700">This Week — Submitted Entries</h3>
          <div className="mt-3 space-y-2">
            {weekDays.map((d) => (
              <div key={d} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-800">{prettyDate(d)}</p>
                  <span className="text-xs font-bold text-slate-500">{(existingByDate[d] || []).length} item(s)</span>
                </div>
                {(existingByDate[d] || []).length ? (
                  <div className="mt-2 space-y-1">
                    {(existingByDate[d] || [])
                      .slice()
                      .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time))
                      .map((r) => (
                        <div key={r.schedule_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                          <div>
                            <p className="font-bold text-slate-700">
                              {String(r.start_time).slice(0, 5)} - {String(r.end_time).slice(0, 5)}
                            </p>
                            <p className="text-xs text-slate-500">by {String(r.created_by || "staff").toUpperCase()}</p>

                            {String(r.approval_status || "").toLowerCase() === "rejected" && r.approval_notes ? (
                              <p className="mt-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800">
                                <span className="font-extrabold">Admin note:</span> {r.approval_notes}
                              </p>
                            ) : null}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${approvalClass(r.approval_status)}`}>
                            {String(r.approval_status || "approved").toUpperCase()}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No submissions.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </StaffShell>
    </>
  );
}

function Kpi({ label, value, tone = "normal" }) {
  const cls =
    tone === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-slate-50 text-slate-800";
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-lg font-extrabold">{value}</p>
    </div>
  );
}

function approvalClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return "bg-emerald-100 text-emerald-700";
  if (s === "rejected") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-800";
}

function todayISO() {
  return toDateInput(new Date());
}

function toDateInput(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

function toMinutes(t) {
  const [h, m] = String(t || "00:00").slice(0, 5).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function diffMinutes(start, end) {
  return Math.max(0, toMinutes(end) - toMinutes(start));
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

function startOfWeekISO(dateString) {
  const d = new Date(dateString + "T00:00:00");
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (day - 1));
  return d;
}
