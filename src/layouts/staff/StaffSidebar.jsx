import { ClipboardList, History, LayoutDashboard, LogOut, Scale, Settings, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ORBIT_LOGO } from "../../assets/orbitLogoData";

const NAV_GROUPS = [
    {
        title: "Tổng quan",
        items: [{ label: "Tổng quan", path: "/staff/dashboard", icon: LayoutDashboard }],
    },
    {
        title: "Vận hành",
        items: [
            { label: "Tạo giao dịch", path: "/staff/transactions", icon: ClipboardList },
            { label: "Lịch sử giao dịch", path: "/staff/transaction-history", icon: History },
            { label: "Thiết bị cân", path: "/staff/devices", icon: Scale },
            { label: "Dữ liệu Farm", path: "/staff/lookup", icon: Search },
        ],
    },
];

function getInitials(fullName = "") {
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "ST";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function StaffSidebar() {
    const { user, logout } = useAuth();
    const fullName = user?.fullName || "Nhân viên";

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-[68px] items-center gap-3 border-b border-slate-200 px-4">
                <img src={ORBIT_LOGO} alt="ORBIT" className="h-11 w-auto max-w-[120px]" />
                <span className="text-[22px] font-semibold leading-none text-[#006948]">Staff</span>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
                {NAV_GROUPS.map((group) => (
                    <section key={group.title}>
                        <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{group.title}</p>
                        <div className="space-y-1">
                            {group.items.map(({ label, path, icon: Icon }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    className={({ isActive }) => [
                                        "flex min-h-[42px] w-full items-center gap-3 rounded-xl px-4 text-[14px] font-medium transition-colors duration-150",
                                        isActive ? "bg-[#006948] !text-white shadow-sm" : "text-slate-700 hover:bg-emerald-50 hover:text-[#006948]",
                                    ].join(" ")}
                                >
                                    {({ isActive }) => <><Icon size={19} strokeWidth={1.8} className={isActive ? "!text-white" : "text-current"} /><span>{label}</span></>}
                                </NavLink>
                            ))}
                        </div>
                    </section>
                ))}
            </nav>

            <div className="space-y-3 border-t border-slate-200 p-4">
                <NavLink to="/staff/settings" className={({ isActive }) => ["flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors", isActive ? "bg-emerald-50 text-[#006948]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}>
                    <Settings size={15} strokeWidth={1.8} />
                    <span>Cài đặt tài khoản</span>
                </NavLink>
                <div className="flex h-14 items-center justify-between rounded-xl bg-slate-50 px-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#006948] text-xs font-bold text-white">{getInitials(fullName)}</div>
                        <div className="min-w-0"><p className="truncate text-[13px] font-semibold text-slate-900">{fullName}</p><p className="truncate text-[11px] text-slate-500">Nhân viên</p></div>
                    </div>
                    <button type="button" onClick={logout} title="Đăng xuất" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"><LogOut size={16} strokeWidth={1.8} /></button>
                </div>
            </div>
        </aside>
    );
}
