import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function OwnerRouteLoader({ children }) {
    const { pathname } = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const startTimer = window.setTimeout(() => setLoading(true), 0);
        const finishTimer = window.setTimeout(() => setLoading(false), 280);

        return () => {
            window.clearTimeout(startTimer);
            window.clearTimeout(finishTimer);
        };
    }, [pathname]);

    return (
        <div className="relative flex min-h-0 flex-1">
            {children}
            {loading ? (
                <div className="absolute inset-0 z-20 flex items-start justify-center bg-slate-50/70 pt-8 backdrop-blur-[1px]" aria-live="polite" aria-label="Đang tải trang">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                        <LoaderCircle size={16} className="animate-spin text-[#006948]" />
                        Đang tải trang...
                    </div>
                </div>
            ) : null}
        </div>
    );
}
