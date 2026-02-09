import React from "react";
import { Head, usePage } from "@inertiajs/react";
import CustomerNavbar from "@/Components/CustomerNavbar";

export default function CustomerLayout({ title, active = "", children, className = "" }) {
  const { auth } = usePage().props;
  const username = auth?.user?.name || "Guest";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-800 ${className}`}>
      {title ? <Head title={title} /> : null}
      <CustomerNavbar username={username} active={active} />
      {children}
    </div>
  );
}
