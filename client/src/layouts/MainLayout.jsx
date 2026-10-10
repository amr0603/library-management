import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  return (
    <div className="d-flex min-vh-100 bg-light" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-x-hidden">
        <Topbar />
        <main className="flex-grow-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
