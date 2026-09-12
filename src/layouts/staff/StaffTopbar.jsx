import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { StaffHelpModal } from "./StaffHelpModal";
import { StaffNotificationPopover } from "./StaffNotificationPopover";

export function StaffTopbar() {
    const { pathname } = useLocation();
    const [helpOpen, setHelpOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Staff Console</p>
                <div className="flex items-center gap-2"><StaffNotificationPopover /><button type="button" onClick={() => setHelpOpen(true)} aria-label="Mở hướng dẫn Staff" aria-expanded={helpOpen} className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"><CircleHelp size={20} /></button></div>
            </header>
            <StaffHelpModal open={helpOpen} pathname={pathname} onClose={() => setHelpOpen(false)} />
        </>
    );
}
