import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar />

            <div className="min-w-0 flex-1">
                <AdminTopbar />

                <main className="min-h-[calc(100vh-64px)] p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}