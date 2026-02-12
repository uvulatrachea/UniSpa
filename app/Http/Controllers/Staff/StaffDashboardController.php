<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class StaffDashboardController extends Controller
{
    public function index(Request $request)
    {
        $staff = Auth::guard('staff')->user();
        abort_unless($staff, 403);

        $tz = config('app.timezone', 'Asia/Kuala_Lumpur');
        $now = now($tz);
        $today = $now->toDateString();

        $monthStart = $now->copy()->startOfMonth()->toDateString();
        $monthEnd = $now->copy()->endOfMonth()->toDateString();
        $weekStart = $now->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
        $weekEnd = $now->copy()->endOfWeek(Carbon::SUNDAY)->toDateString();

        // Pending QR payment proofs that require verification.
        // (In current system, QR confirmation is done via Admin scheduling module.
        // This list is still useful for staff awareness + future staff verification module.)
        $pendingQrProofs = DB::table('booking as b')
            ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
            ->leftJoin('customers as c', 'c.customer_id', '=', 'b.customer_id')
            ->leftJoin('service as sv', 'sv.id', '=', 'sl.service_id')
            ->leftJoin('treatment_room as tr', 'tr.room_id', '=', 'sl.room_id')
            ->where('sl.staff_id', (int) $staff->staff_id)
            ->where('b.payment_method', 'qr')
            ->where('b.payment_status', 'pending')
            ->whereNotNull('b.depo_qr_pic')
            ->select([
                'b.booking_id',
                'b.status as booking_status',
                'b.payment_status',
                'b.depo_qr_pic',
                'c.name as customer_name',
                'sv.name as service_name',
                'sl.slot_date',
                'sl.start_time',
                'sl.end_time',
                'tr.room_name',
                'tr.room_type',
            ])
            ->orderBy('sl.slot_date')
            ->orderBy('sl.start_time')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                $row->proof_url = $row->depo_qr_pic ? Storage::url($row->depo_qr_pic) : null;
                return $row;
            });

        $pendingQrProofCount = (int) DB::table('booking as b')
            ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
            ->where('sl.staff_id', (int) $staff->staff_id)
            ->where('b.payment_method', 'qr')
            ->where('b.payment_status', 'pending')
            ->whereNotNull('b.depo_qr_pic')
            ->count();

        // Upcoming appointments (next 14 days)
        $upcomingAppointmentsQuery = DB::table('booking as b')
            ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
            ->leftJoin('customers as c', 'c.customer_id', '=', 'b.customer_id')
            ->leftJoin('service as sv', 'sv.id', '=', 'sl.service_id')
            ->leftJoin('treatment_room as tr', 'tr.room_id', '=', 'sl.room_id')
            ->where('sl.staff_id', (int) $staff->staff_id)
            ->whereDate('sl.slot_date', '>=', $today)
            ->whereDate('sl.slot_date', '<=', $now->copy()->addDays(14)->toDateString())
            ->whereIn('b.status', ['pending', 'accepted', 'confirmed', 'completed']);

        // Student staff can only see appointments on days they are working (approved shifts only).
        if (($staff->staff_type ?? null) === 'student' && Schema::hasTable('schedule')) {
            $approvedDates = DB::table('schedule')
                ->where('staff_id', (int) $staff->staff_id)
                ->whereBetween('schedule_date', [$today, $now->copy()->addDays(14)->toDateString()])
                ->where('status', 'active')
                ->when(Schema::hasColumn('schedule', 'approval_status'), fn ($q) => $q->where('approval_status', 'approved'))
                ->selectRaw('schedule_date')
                ->distinct()
                ->pluck('schedule_date')
                ->map(fn ($d) => (string) $d)
                ->all();

            // If no approved work days, student sees no upcoming appointments.
            if (count($approvedDates) === 0) {
                $approvedDates = ['1900-01-01'];
            }

            $upcomingAppointmentsQuery->whereIn(DB::raw('DATE(sl.slot_date)'), $approvedDates);
        }

        $upcomingAppointments = $upcomingAppointmentsQuery
            ->select([
                'b.booking_id',
                'b.status as booking_status',
                'b.payment_status',
                'b.payment_method',
                'c.name as customer_name',
                'sv.name as service_name',
                'sl.slot_date',
                'sl.start_time',
                'sl.end_time',
                'tr.room_name',
                'tr.room_type',
            ])
            ->orderBy('sl.slot_date')
            ->orderBy('sl.start_time')
            ->limit(10)
            ->get();

        $todayAppointmentsCount = (int) DB::table('booking as b')
            ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
            ->where('sl.staff_id', (int) $staff->staff_id)
            ->whereDate('sl.slot_date', $today)
            ->whereIn('b.status', ['accepted', 'confirmed', 'completed'])
            ->count();

        $confirmedThisMonth = (int) DB::table('booking as b')
            ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
            ->where('sl.staff_id', (int) $staff->staff_id)
            ->whereBetween('sl.slot_date', [$monthStart, $monthEnd])
            ->whereIn('b.status', ['accepted', 'confirmed', 'completed'])
            ->count();

        $totalThisMonth = (int) DB::table('booking as b')
            ->join('slot as sl', 'sl.slot_id', '=', 'b.slot_id')
            ->where('sl.staff_id', (int) $staff->staff_id)
            ->whereBetween('sl.slot_date', [$monthStart, $monthEnd])
            ->whereIn('b.status', ['pending', 'accepted', 'confirmed', 'completed'])
            ->count();

        $weekShifts = DB::table('schedule')
            ->where('staff_id', (int) $staff->staff_id)
            ->whereBetween('schedule_date', [$weekStart, $weekEnd])
            ->when(Schema::hasColumn('schedule', 'approval_status'), function ($q) use ($staff) {
                // Student staff: show pending + approved; General staff: show approved only.
                if (($staff->staff_type ?? null) === 'student') {
                    $q->whereIn('approval_status', ['pending', 'approved']);
                } else {
                    $q->where('approval_status', 'approved');
                }
            })
            ->orderBy('schedule_date')
            ->orderBy('start_time')
            ->limit(14)
            ->get([
                'schedule_id',
                'schedule_date',
                'start_time',
                'end_time',
                'status',
                'created_by',
                Schema::hasColumn('schedule', 'approval_status') ? 'approval_status' : DB::raw("'approved' as approval_status"),
                Schema::hasColumn('schedule', 'approval_notes') ? 'approval_notes' : DB::raw('NULL as approval_notes'),
            ]);

        $weekShiftsCount = (int) DB::table('schedule')
            ->where('staff_id', (int) $staff->staff_id)
            ->whereBetween('schedule_date', [$weekStart, $weekEnd])
            ->when(Schema::hasColumn('schedule', 'approval_status'), function ($q) use ($staff) {
                if (($staff->staff_type ?? null) === 'student') {
                    $q->whereIn('approval_status', ['pending', 'approved']);
                } else {
                    $q->where('approval_status', 'approved');
                }
            })
            ->count();

        return Inertia::render('Staff/StaffDashboard', [
            'staffName' => $staff->name ?? 'Staff',
            'staffType' => $staff->staff_type ?? null,
            'stats' => [
                'confirmedThisMonth' => $confirmedThisMonth,
                'totalThisMonth' => $totalThisMonth,
                'pendingQrProofs' => $pendingQrProofCount,
                'todayAppointments' => $todayAppointmentsCount,
                'weekShifts' => $weekShiftsCount,
            ],
            'pendingQrProofs' => $pendingQrProofs,
            'upcomingAppointments' => $upcomingAppointments,
            'weekShifts' => $weekShifts,
            'ranges' => [
                'today' => $today,
                'month_start' => $monthStart,
                'month_end' => $monthEnd,
                'week_start' => $weekStart,
                'week_end' => $weekEnd,
            ],
        ]);
    }
}
