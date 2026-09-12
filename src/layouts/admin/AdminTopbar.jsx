import { CircleHelp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import { AdminHelpModal } from "./AdminHelpModal";
import { AdminNotificationPopover } from "./AdminNotificationPopover";

export function AdminTopbar() {
    const { pathname } = useLocation();
    const [helpOpen, setHelpOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6">
                <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        Admin Console
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AdminNotificationPopover />

                    <button
                        type="button"
                        onClick={() => setHelpOpen(true)}
                        aria-label="Mở hướng dẫn Admin"
                        aria-expanded={helpOpen}
                        className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
                    >
                        <CircleHelp size={20} />
                    </button>
                </div>
            </header>

            <AdminHelpModal
                open={helpOpen}
                pathname={pathname}
                onClose={() => setHelpOpen(false)}
            />
        </>
    );
}
