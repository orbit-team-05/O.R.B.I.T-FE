import { Outlet } from "react-router-dom";

import { OwnerSidebar } from "./OwnerSidebar";
import { OwnerTopbar } from "./OwnerTopbar";

export function OwnerLayout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <OwnerSidebar />

            <div className="ml-[248px] flex min-h-screen flex-col">
                <OwnerTopbar />

                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}