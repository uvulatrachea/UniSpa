# How appointment availability works (Schedule page)

## Overview

- **Enabled dates** (clickable in the calendar) come from the **month availability** API.
- **Available times** (after you pick a date) come from the **slots** API.

If you see **all dates disabled** (grey), it means the month API returned no dates. If you pick a date but see **no times**, the slots API returned an empty list.

---

## 1. Which dates are **available** (enabled)?

**API:** `GET /booking/slots/month?service_id=...&month=YYYY-MM-01`  
**Controller:** `ScheduleController::monthAvailability()`

A date is **enabled** only if there is **at least one approved staff schedule** for that date:

- Tables: `schedule` + `staff`
- Staff: `staff.work_status = 'active'`
- Schedule row for that date: `schedule.schedule_date` in the month, `schedule.status = 'active'`
- If the `schedule` table has an `approval_status` column: `approval_status = 'approved'`

The API returns a list of such dates. The frontend only makes those dates clickable.  
**If the list is empty** (no schedule data or no approved rows), **all dates in the calendar are disabled**.

---

## 2. Which times are **available** for a chosen date?

**API:** `POST /booking/slots` with `service_id` and `date`  
**Controller:** `ScheduleController::slots()`

A time slot is **available** only when **all** of the following are true:

1. **Service** exists and has a duration (used for slot length).
2. **Staff:** At least one staff has an **approved, active** schedule row for that date whose time range covers this slot (and the slot length fits inside it). Existing `slot` rows with status `held` or `booked` block that staff for those times.
3. **Room:** At least one **treatment room** exists (from `treatment_room` table, not in maintenance). For each candidate time, at least one room must be free (not already used by another `slot` at that time).

Slots are generated in **30-minute steps** between **10:00 and 19:00**. Only start times where the full service duration fits and both staff and room are free are returned.

**If there are no staff schedules for that date** → no slots.  
**If the `treatment_room` table is missing or empty** → the controller returns no slots (even if staff schedule exists).

---

## 3. Why is everything disabled?

Typical causes:

| Symptom | Cause |
|--------|--------|
| **All dates grey** | No rows in `schedule` for that month, or none with `approval_status = 'approved'` (if column exists), or `staff`/`schedule` tables missing. |
| **Dates clickable but no times** | No `treatment_room` rows, or no staff schedule for that date, or all candidate times are blocked by existing bookings. |

---

## 4. Making dates and times show up

1. **Schedule data**  
   Ensure `schedule` has rows for the month you’re viewing, with:
   - `schedule_date` = the date (e.g. in Feb 2026)
   - `staff_id` = an active staff
   - `start_time` / `end_time` (e.g. 10:00–19:00)
   - `status = 'active'`
   - If the table has `approval_status`, set it to `'approved'`

2. **Staff**  
   Ensure `staff` has at least one row with `work_status = 'active'` and that `schedule` references it.

3. **Rooms (for time slots)**  
   Ensure `treatment_room` exists and has at least one row (and that it’s not filtered out by `is_active` or `status = 'maintenance'`).  
   If you prefer to run **without rooms**, the code can be changed to generate slots from staff only when there are no rooms (see controller change below).

After fixing data (and optionally relaxing the room requirement), refresh the schedule page: enabled dates and available times will follow the logic above.
