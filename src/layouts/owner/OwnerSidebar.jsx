import { NavLink } from "react-router-dom";
import {
    ChartNoAxesCombined,
    Cpu,
    Eye,
    FileText,
    Home,
    LayoutDashboard,
    PackageSearch,
    QrCode,
    Settings,
    Sprout,
    Warehouse,
    BrainCircuit,
    PackageMinus,
    LogOut
} from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import orbitLogo from "../../assets/images/orbit-logo.png";

const OWNER_NAV_ITEMS = [
    {
        label: "Dashboard",
        path: "/owner/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Nông trại",
        path: "/owner/farms",
        icon: Home,
    },
    {
        label: "Mùa vụ",
        path: "/owner/seasons",
        icon: Sprout,
    },
    {
        label: "Kho vật tư",
        path: "/owner/inventory",
        icon: Warehouse,
    },
    {
        label: "Nhập vật tư",
        path: "/owner/iot-imports",
        icon: QrCode,
    },
    {
        label: "Xuất vật tư",
        path: "/owner/iot-exports",
        icon: PackageMinus,
    },
    {
        label: "Sản phẩm",
        path: "/owner/products",
        icon: PackageSearch,
    },
    {
        label: "Thiết bị IoT",
        path: "/owner/devices",
        icon: Cpu,
    },
    {
        label: "Lịch sử Scan",
        path: "/owner/iot-scans",
        icon: QrCode,
    },
    {
        label: "Duyệt AI",
        path: "/owner/ai-reviews",
        icon: BrainCircuit,
    },
    {
        label: "Giá thị trường",
        path: "/owner/market-prices",
        icon: ChartNoAxesCombined,
    },
    {
        label: "Watchlist Farm",
        path: "/owner/market-watchlist",
        icon: Eye,
    },
    {
        label: "Cài đặt",
        path: "/owner/settings",
        icon: Settings,
    },
];

function getInitials(fullName = "") {
    const words = fullName.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) return "OW";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

    return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function OwnerSidebar() {
    const { user, logout } = useAuth();
    const ownerName = user?.fullName || "Farm Owner";
    const initials = getInitials(ownerName);

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-[68px] items-center gap-3 border-b border-slate-200 px-4">
                <div className="h-11 w-[120px] shrink-0 overflow-hidden">
                    <img
                        src={orbitLogo}
                        alt="ORBIT"
                        className="h-full w-full object-contain"
                    />
                </div>

                <span className="text-[22px] font-semibold leading-none text-[#006948]">
                    Owner
                </span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                {OWNER_NAV_ITEMS.map(({ label, path, icon: Icon }) => (
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
                <NavLink
                    to="/owner/reports"
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#006948] px-3 text-[13px] font-semibold !text-white transition-colors hover:bg-[#00583d] hover:!text-white"
                >
                    <FileText size={15} strokeWidth={1.8} />
                    <span>Báo cáo nông trại</span>
                </NavLink>

                <div className="flex h-14 items-center justify-between rounded-xl bg-slate-50 px-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#006948] text-xs font-bold text-white">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-slate-900">
                                {ownerName}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                                Chủ nông trại
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        title="Đăng xuất"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    >
                        <LogOut size={16} strokeWidth={1.8} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
