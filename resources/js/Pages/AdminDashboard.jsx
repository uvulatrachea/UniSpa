import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ auth }) {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gray-100">
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                                <div className="mb-6">
                                    <p className="text-lg">
                                        Welcome back, <span className="font-semibold">{auth.user?.name}</span>!
                                    </p>
                                    <p className="text-gray-600 mt-2">
                                        You are logged in as a {auth.user?.role} ({auth.user?.staff_type} staff).
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Staff Management</h3>
                                        <p className="text-blue-700 mb-4">Manage staff members, roles, and permissions</p>
                                        <Link
                                            href={route('staff.index')}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Manage Staff
                                        </Link>
                                    </div>

                                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                        <h3 className="text-lg font-semibold text-green-900 mb-2">Appointments</h3>
                                        <p className="text-green-700 mb-4">View and manage customer appointments</p>
                                        <button
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            disabled
                                        >
                                            Coming Soon
                                        </button>
                                    </div>

                                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                                        <h3 className="text-lg font-semibold text-purple-900 mb-2">Services</h3>
                                        <p className="text-purple-700 mb-4">Manage spa services and treatments</p>
                                        <button
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:bg-purple-700 active:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                            disabled
                                        >
                                            Coming Soon
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <form method="POST" action={route('logout')}>
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Log Out
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
