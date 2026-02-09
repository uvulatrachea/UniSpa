<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Booking\CartController;
use App\Http\Controllers\Booking\GuestController;
use App\Http\Controllers\Booking\PaymentController;
use App\Http\Controllers\Booking\ScheduleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\CustomerAuthController;
use App\Http\Controllers\Auth\Admin\AdminDashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GuestDashboardController;
use App\Http\Controllers\GuestServicesController;


// NOTE: Home route is defined at the bottom as `home` and should point to GuestDashboard.

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth:customer')
    ->name('customer.dashboard');

// Keep the default Breeze route name working for legacy links.
Route::redirect('/dash', '/dashboard');
Route::get('/dashboard-legacy', fn () => Inertia::render('Dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Customer auth (OTP / email)
Route::middleware('guest:customer')->group(function () {
    // Customer login/register UI (single page with toggle)
    Route::get('/customer/login', [CustomerAuthController::class, 'showLogin'])->name('customer.login');
    Route::get('/customer/signup', [CustomerAuthController::class, 'showSignup'])->name('customer.signup');

    // Customer password auth endpoints (used by resources/js/Pages/Auth/Auth.jsx)
    Route::post('/customer/login', [CustomerAuthController::class, 'passwordLogin'])->name('customer.login.post');
    Route::post('/customer/signup', [CustomerAuthController::class, 'passwordRegister'])->name('customer.register');

    // Customer OTP login endpoints (used by resources/js/Pages/Auth/CustomerLogin.jsx)
    Route::post('/customer/auth/login-send-otp', [CustomerAuthController::class, 'sendLoginOtp'])->name('customer.otp.login.send');
    Route::post('/customer/auth/verify-otp-login', [CustomerAuthController::class, 'verifyLoginOtp'])->name('customer.otp.login.verify');
});

Route::post('/customer/logout', [CustomerAuthController::class, 'logout'])
    ->middleware('auth:customer')
    ->name('customer.logout');

// Customer pages
Route::redirect('/profile', '/customer/profile');
Route::get('/customer/profile', fn () => Inertia::render('Profile'))->name('customer.profile');
Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');

// Public guest dashboard (default landing)
Route::get('/guest/dashboard', [GuestDashboardController::class, 'index'])
    ->name('guest.dashboard');

Route::get('/booking/services', [ServiceController::class, 'index'])->name('booking.services');

// Booking flow (cart -> schedule -> guests -> payment)
Route::middleware('auth:customer')->group(function () {
    Route::get('/booking/cart', [CartController::class, 'show'])->name('booking.cart');
    Route::post('/booking/cart/add', [CartController::class, 'add'])->name('booking.cart.add');
    Route::post('/booking/cart/remove', [CartController::class, 'remove'])->name('booking.cart.remove');
    Route::post('/booking/cart/clear', [CartController::class, 'clear'])->name('booking.cart.clear');

    Route::get('/booking/schedule', [ScheduleController::class, 'show'])->name('booking.schedule');
    Route::post('/booking/schedule/confirm', [ScheduleController::class, 'confirm'])->name('booking.schedule.confirm');
    Route::post('/booking/slots', [ScheduleController::class, 'slots'])->name('booking.slots');
    Route::get('/booking/slots/month', [ScheduleController::class, 'monthAvailability'])->name('booking.slots.month');

    Route::get('/booking/guests', [GuestController::class, 'show'])->name('booking.guests');
    Route::post('/booking/guests', [GuestController::class, 'save'])->name('booking.guests.save');

    Route::get('/booking/payment', [PaymentController::class, 'show'])->name('booking.payment');
    Route::post('/booking/payment/qr-upload', [PaymentController::class, 'uploadQrReceipt'])->name('booking.payment.qr.upload');
    Route::post('/booking/payment/stripe-session', [PaymentController::class, 'createStripeSession'])->name('booking.payment.stripe.session');
    Route::get('/booking/payment/stripe/success', [PaymentController::class, 'stripeSuccess'])->name('booking.payment.stripe.success');
    Route::get('/booking/payment/stripe/cancel', [PaymentController::class, 'stripeCancel'])->name('booking.payment.stripe.cancel');
});

// Customer appointment listing
Route::middleware('auth:customer')->group(function () {
    Route::get('/bookings', [AppointmentController::class, 'myBookings'])->name('bookings.index');
    Route::get('/bookings/{bookingId}', [AppointmentController::class, 'showBooking'])->name('bookings.show');
    Route::patch('/bookings/{bookingId}/cancel', [AppointmentController::class, 'cancelBooking'])->name('bookings.cancel');
    Route::patch('/bookings/{bookingId}/details', [AppointmentController::class, 'updateBookingDetails'])->name('bookings.update');
});

// Admin auth + pages
Route::prefix('admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'create'])->name('admin.login');
    Route::post('/login', [AdminAuthController::class, 'store'])->name('admin.login.store');
    Route::post('/logout', [AdminAuthController::class, 'destroy'])->name('admin.logout');

    Route::middleware('admin.only')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/users', [AdminDashboardController::class, 'users'])->name('admin.users');
        Route::post('/users/staff', [AdminDashboardController::class, 'storeStaff'])->name('admin.users.staff.store');
        Route::patch('/users/staff/{staffId}', [AdminDashboardController::class, 'updateStaff'])->name('admin.users.staff.update');
        Route::patch('/users/staff/{staffId}/status', [AdminDashboardController::class, 'updateStaffStatus'])->name('admin.users.staff.status');
        Route::delete('/users/staff/{staffId}', [AdminDashboardController::class, 'destroyStaff'])->name('admin.users.staff.destroy');
        Route::post('/users/staff/import', [AdminDashboardController::class, 'importStaff'])->name('admin.users.staff.import');
        Route::get('/users/staff/export', [AdminDashboardController::class, 'exportStaff'])->name('admin.users.staff.export');

        Route::post('/users/customers', [AdminDashboardController::class, 'storeCustomer'])->name('admin.users.customers.store');
        Route::patch('/users/customers/{customerId}', [AdminDashboardController::class, 'updateCustomer'])->name('admin.users.customers.update');
        Route::patch('/users/customers/{customerId}/verification', [AdminDashboardController::class, 'updateCustomerVerification'])->name('admin.users.customers.verification');
        Route::delete('/users/customers/{customerId}', [AdminDashboardController::class, 'destroyCustomer'])->name('admin.users.customers.destroy');
        Route::post('/users/customers/import', [AdminDashboardController::class, 'importCustomers'])->name('admin.users.customers.import');
        Route::get('/users/customers/export', [AdminDashboardController::class, 'exportCustomers'])->name('admin.users.customers.export');

        Route::get('/services', [AdminDashboardController::class, 'services'])->name('admin.services');
        Route::post('/services/categories', [AdminDashboardController::class, 'storeServiceCategory'])->name('admin.services.categories.store');
        Route::patch('/services/categories/{categoryId}', [AdminDashboardController::class, 'updateServiceCategory'])->name('admin.services.categories.update');
        Route::delete('/services/categories/{categoryId}', [AdminDashboardController::class, 'destroyServiceCategory'])->name('admin.services.categories.destroy');
        Route::post('/services/items', [AdminDashboardController::class, 'storeService'])->name('admin.services.items.store');
        Route::patch('/services/items/{serviceId}', [AdminDashboardController::class, 'updateService'])->name('admin.services.items.update');
        Route::delete('/services/items/{serviceId}', [AdminDashboardController::class, 'destroyService'])->name('admin.services.items.destroy');
        Route::post('/services/promotions', [AdminDashboardController::class, 'storePromotion'])->name('admin.services.promotions.store');
        Route::patch('/services/promotions/{promotionId}', [AdminDashboardController::class, 'updatePromotion'])->name('admin.services.promotions.update');
        Route::patch('/services/promotions/{promotionId}/status', [AdminDashboardController::class, 'updatePromotionStatus'])->name('admin.services.promotions.status');
        Route::patch('/services/promotions/{promotionId}/dashboard-header', [AdminDashboardController::class, 'updatePromotionHeaderVisibility'])->name('admin.services.promotions.dashboard_header');
        Route::delete('/services/promotions/{promotionId}', [AdminDashboardController::class, 'destroyPromotion'])->name('admin.services.promotions.destroy');
        Route::get('/services/promotions/{promotionId}/print', [AdminDashboardController::class, 'printPromotion'])->name('admin.services.promotions.print');

        Route::get('/scheduling', [AdminDashboardController::class, 'scheduling'])->name('admin.scheduling');
        Route::post('/scheduling/shifts', [AdminDashboardController::class, 'storeShift'])->name('admin.scheduling.shifts.store');
        Route::post('/scheduling/publish', [AdminDashboardController::class, 'publishSchedule'])->name('admin.scheduling.publish');
        Route::post('/scheduling/bookings/{bookingId}/confirm', [AdminDashboardController::class, 'confirmQrAndAssign'])->name('admin.scheduling.bookings.confirm');

        Route::get('/bookings', [AdminDashboardController::class, 'bookings'])->name('admin.bookings');
        Route::post('/bookings/{bookingId}/approve', [AdminDashboardController::class, 'approveBooking'])->name('admin.bookings.approve');
        Route::patch('/bookings/{bookingId}/status', [AdminDashboardController::class, 'updateBookingStatus'])->name('admin.bookings.status');
        Route::patch('/bookings/{bookingId}/payment', [AdminDashboardController::class, 'updateBookingPayment'])->name('admin.bookings.payment');
        Route::patch('/bookings/{bookingId}/details', [AdminDashboardController::class, 'updateBookingDetails'])->name('admin.bookings.details');
        Route::delete('/bookings/{bookingId}', [AdminDashboardController::class, 'destroyBooking'])->name('admin.bookings.destroy');

        Route::get('/reviews', [AdminDashboardController::class, 'reviews'])->name('admin.reviews');
        Route::get('/payments', [AdminDashboardController::class, 'payments'])->name('admin.payments');
    });
});

Route::middleware('auth')->group(function () {
    // Keep Breeze profile endpoints intact, but move them under /account/*
    // to avoid conflicting with the customer-facing profile page.
    Route::get('/account/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/account/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/account/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/verify-otp', function(Request $request) {
    return Inertia::render('Auth/VerifyOtp', ['email' => $request->email]);
})->name('verify.otp.page');

Route::post('/verify-otp', [CustomerAuthController::class, 'verifyOtp'])->name('verify.otp');

require __DIR__.'/auth.php';

Route::get('/', function () {
    // always go to guest dashboard for now
    return app(GuestDashboardController::class)->index();
})->name('home');

Route::get('/guest/dashboard', [GuestDashboardController::class, 'index'])
    ->name('guest.dashboard');

Route::get('/guest/services', [GuestServicesController::class, 'index'])
    ->name('guest.services');