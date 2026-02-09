<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\GeneralStaff;
use App\Models\StudentStaff;
use App\Models\Qualification;
use App\Models\GeneralStaffQualification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $staff = Staff::with(['generalStaff', 'studentStaff'])->get();

        return Inertia::render('Staff/Index', [
            'staff' => $staff
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $qualifications = Qualification::all();

        return Inertia::render('Staff/Create', [
            'qualifications' => $qualifications
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:staff,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'staff_type' => 'required|in:general,student',
            'role' => 'required|string|max:50',
            'work_status' => 'required|in:active,inactive',
            'qualifications' => 'nullable|array',
            'qualifications.*' => 'exists:qualification,qualification_id',
            'working_hours' => 'nullable|integer|min:1|max:40'
        ]);

        DB::transaction(function () use ($validated) {
            $staff = Staff::create([
                'staff_id' => $this->generateStaffId(),
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'staff_type' => $validated['staff_type'],
                'role' => $validated['role'],
                'work_status' => $validated['work_status'],
                'created_at' => now()
            ]);

            if ($validated['staff_type'] === 'general') {
                GeneralStaff::create([
                    'staff_id' => $staff->staff_id
                ]);

                if (isset($validated['qualifications'])) {
                    foreach ($validated['qualifications'] as $qualificationId) {
                        GeneralStaffQualification::create([
                            'staff_id' => $staff->staff_id,
                            'qualification_id' => $qualificationId
                        ]);
                    }
                }
            } else if ($validated['staff_type'] === 'student') {
                StudentStaff::create([
                    'staff_id' => $staff->staff_id,
                    'working_hours' => $validated['working_hours'] ?? 20
                ]);
            }
        });

        return redirect()->route('staff.index')->with('success', 'Staff member created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $staff = Staff::with(['generalStaff.qualifications', 'studentStaff'])->findOrFail($id);

        return Inertia::render('Staff/Show', [
            'staff' => $staff
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $staff = Staff::with(['generalStaff.qualifications', 'studentStaff'])->findOrFail($id);
        $qualifications = Qualification::all();

        return Inertia::render('Staff/Edit', [
            'staff' => $staff,
            'qualifications' => $qualifications
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $staff = Staff::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:staff,email,' . $id . ',staff_id',
            'phone' => 'required|string|max:20',
            'staff_type' => 'required|in:general,student',
            'role' => 'required|string|max:50',
            'work_status' => 'required|in:active,inactive',
            'qualifications' => 'nullable|array',
            'qualifications.*' => 'exists:qualification,qualification_id',
            'working_hours' => 'nullable|integer|min:1|max:40'
        ]);

        DB::transaction(function () use ($staff, $validated) {
            $staff->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'staff_type' => $validated['staff_type'],
                'role' => $validated['role'],
                'work_status' => $validated['work_status']
            ]);

            if ($validated['staff_type'] === 'general') {
                // Remove student staff record if exists
                $staff->studentStaff()->delete();

                // Update or create general staff record
                $generalStaff = $staff->generalStaff()->firstOrCreate([
                    'staff_id' => $staff->staff_id
                ]);

                // Update qualifications
                $staff->generalStaffQualifications()->delete(); // Remove existing
                if (isset($validated['qualifications'])) {
                    foreach ($validated['qualifications'] as $qualificationId) {
                        GeneralStaffQualification::create([
                            'staff_id' => $staff->staff_id,
                            'qualification_id' => $qualificationId
                        ]);
                    }
                }
            } else if ($validated['staff_type'] === 'student') {
                // Remove general staff record if exists
                $staff->generalStaff()->delete();
                $staff->generalStaffQualifications()->delete();

                // Update or create student staff record
                $studentStaff = $staff->studentStaff()->firstOrCreate([
                    'staff_id' => $staff->staff_id
                ]);
                $studentStaff->update([
                    'working_hours' => $validated['working_hours'] ?? 20
                ]);
            }
        });

        return redirect()->route('staff.index')->with('success', 'Staff member updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $staff = Staff::findOrFail($id);

        DB::transaction(function () use ($staff) {
            $staff->generalStaffQualifications()->delete();
            $staff->generalStaff()->delete();
            $staff->studentStaff()->delete();
            $staff->delete();
        });

        return redirect()->route('staff.index')->with('success', 'Staff member deleted successfully.');
    }

    /**
     * Generate a unique staff ID
     */
    private function generateStaffId(): string
    {
        do {
            $id = strtoupper(substr(md5(uniqid()), 0, 3));
        } while (Staff::where('staff_id', $id)->exists());

        return $id;
    }
}
