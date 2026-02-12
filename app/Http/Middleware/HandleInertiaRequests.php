<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Support both default user guard AND our custom customer/staff guards.
        // IMPORTANT: Only call ->user() if guard is authenticated.
        // Otherwise, SessionGuard may still attempt to retrieve a user from DB
        // using a remembered ID, which can throw when a model points at a missing table.
        $customer = auth('customer')->check() ? auth('customer')->user() : null;
        $staff = auth('staff')->check() ? auth('staff')->user() : null;

        // Many pages/components assume `auth.user` is the currently logged-in person.
        // In our system, the primary session guard can be `customer` or `staff`.
        $actor = $customer ?? $staff ?? $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $actor,
                'customer' => $customer,
                'staff' => $staff,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
