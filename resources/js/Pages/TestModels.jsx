import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function TestModels({ customer_count, sample_customer, service_count, sample_service, sample_bookings }) {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Head title="Models Test" />
            
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Models Test Page</h1>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-blue-600 mb-2">Customer Model</h2>
                        <p className="text-gray-600">Total Customers: <span className="font-bold">{customer_count}</span></p>
                        {sample_customer && (
                            <div className="mt-4 p-4 bg-blue-50 rounded">
                                <p><strong>Sample Customer:</strong></p>
                                <p>ID: {sample_customer.customer_id}</p>
                                <p>Name: {sample_customer.name}</p>
                                <p>Email: {sample_customer.email}</p>
                                <p>Type: {sample_customer.cust_type}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold text-green-600 mb-2">Service Model</h2>
                        <p className="text-gray-600">Total Services: <span className="font-bold">{service_count}</span></p>
                        {sample_service && (
                            <div className="mt-4 p-4 bg-green-50 rounded">
                                <p><strong>Sample Service:</strong></p>
                                <p>ID: {sample_service.service_id}</p>
                                <p>Name: {sample_service.name}</p>
                                <p>Price: RM {sample_service.price}</p>
                                <p>Duration: {sample_service.duration_minutes} minutes</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Bookings Table */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-xl font-semibold text-purple-600 mb-4">Bookings with Relationships</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">Booking ID</th>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Total Amount</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sample_bookings.map((booking) => (
                                    <tr key={booking.booking_id} className="border-t">
                                        <td className="px-4 py-3">{booking.booking_id}</td>
                                        <td className="px-4 py-3">
                                            {booking.customer ? booking.customer.name : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3">RM {booking.final_amount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {booking.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="flex space-x-4">
                    <Link href="/" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        ← Home
                    </Link>
                    <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Dashboard →
                    </Link>
                </div>
            </div>
        </div>
    );
}