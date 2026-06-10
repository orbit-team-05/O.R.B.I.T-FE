import { NavLink } from "react-router-dom";
import {
    ChartNoAxesCombined,
    Cpu,
    Database,
    FileText,
    LayoutDashboard,
    Leaf,
    Settings,
    SlidersHorizontal,
    Users,
    Warehouse,
} from "lucide-react";

import orbitLogo from "../../assets/images/orbit-logo.jpg";

const ADMIN_NAV_ITEMS = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Quản lý Species", path: "/admin/species", icon: Leaf },
    { label: "Nguồn dữ liệu", path: "/admin/market-sources", icon: Database },
    {
        label: "Cấu hình Crawl",
        path: "/admin/crawl-targets",
        icon: SlidersHorizontal,
    },
    { label: "Thiết bị IoT", path: "/admin/devices", icon: Cpu },
    {
        label: "Dữ liệu giá Crawl",
        path: "/admin/market-prices",
        icon: ChartNoAxesCombined,
    },
    { label: "Người dùng", path: "/admin/users", icon: Users },
    { label: "Nông trại", path: "/admin/farms", icon: Warehouse },
    {
        label: "Cài đặt hệ thống",
        path: "/admin/settings",
        icon: Settings,
    },
];

function getInitials(fullName = "") {
    const words = fullName.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "AD";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function AdminSidebar() {
    const adminName = "Admin System";
    const initials = getInitials(adminName);

    return (
        <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-[68px] items-center gap-3 border-b border-slate-200 px-4">
                <div className="h-11 w-[120px] shrink-0 overflow-hidden">
                    <img
                        src={orbitLogo}
                        alt="ORBIT"
                        className="h-full w-full object-contain"
                    />
                </div>

                <span className="text-[22px] font-semibold leading-none text-[#006948]">
          Admin
        </span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                {ADMIN_NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            [
                                "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-4",
                                "text-[15px] font-medium tracking-[-0.005em]",
                                "transition-colors duration-150",
                                isActive
                                    ? "bg-[#006948] !text-white shadow-sm"
                                    : "text-slate-700 hover:bg-emerald-50 hover:text-[#006948]",
                            ].join(" ")
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={20}
                                    strokeWidth={1.8}
                                    className={isActive ? "!text-white" : "text-current"}
                                />

                                <span className={isActive ? "!text-white" : "text-current"}>
        {label}
      </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="space-y-3 border-t border-slate-200 p-4">
                <button
                    type="button"
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#006948] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#00583d]"
                >
                    <FileText size={15} strokeWidth={1.8} />
                    <span>Tạo Báo Cáo</span>
                </button>

                <div className="flex h-14 items-center gap-3 rounded-xl bg-slate-50 px-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#006948] text-xs font-bold text-white">
                        {initials}
                    </div>

                    <span className="truncate text-[13px] font-semibold text-slate-900">
            {adminName}
          </span>
                </div>
            </div>
        </aside>
    );
}