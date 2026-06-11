import { Outlet } from "react-router-dom";

import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar />

            <div className="ml-[248px] flex min-h-screen flex-col">
                <AdminTopbar />

                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}