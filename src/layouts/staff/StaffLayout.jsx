import { Outlet } from "react-router-dom";
import { OwnerRouteLoader } from "../owner/OwnerRouteLoader";
import { StaffSidebar } from "./StaffSidebar";
import { StaffTopbar } from "./StaffTopbar";

export function StaffLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <StaffSidebar />
            <div className="ml-[248px] flex min-h-screen flex-col">
                <StaffTopbar />
                <OwnerRouteLoader>
                    <main className="flex-1 overflow-y-auto px-6 py-6">
                        <Outlet />
                    </main>
                </OwnerRouteLoader>
            </div>
        </div>
    );
}
