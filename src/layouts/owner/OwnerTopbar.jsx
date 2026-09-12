import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { OwnerHelpModal } from "./OwnerHelpModal";
import { OwnerNotificationPopover } from "./OwnerNotificationPopover";
import { useAuth } from "../../features/auth/context/AuthContext";

export function OwnerTopbar() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const [helpOpen, setHelpOpen] = useState(false);
    const isFarmManager = user?.role === "FARM_MANAGER" || user?.roles?.includes("FARM_MANAGER");

    return <>
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{isFarmManager ? "Farm Manager Console" : "Owner Console"}</p></div>
            <div className="flex items-center gap-3"><OwnerNotificationPopover /><button type="button" onClick={() => setHelpOpen(true)} aria-label="Mở hướng dẫn Owner" aria-expanded={helpOpen} className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"><CircleHelp size={20} /></button></div>
        </header>
        <OwnerHelpModal open={helpOpen} pathname={pathname} onClose={() => setHelpOpen(false)} />
    </>;
}
