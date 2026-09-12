import { NavLink } from "react-router-dom";
import { ClipboardList, Cpu, FileText, Home, LayoutDashboard, LogOut, PackageSearch, Settings, Sprout, Users, Warehouse } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ORBIT_LOGO } from "../../assets/orbitLogoData";

const OWNER_NAV_GROUPS = [
    { title: "Tổng quan", items: [{ label: "Tổng quan nông trại", path: "/owner/dashboard", icon: LayoutDashboard }, { label: "Hồ sơ nông trại", path: "/owner/farms", icon: Home }] },
    { title: "Kế hoạch & dữ liệu", items: [{ label: "Nhân sự", path: "/owner/staff", icon: Users }, { label: "Sản phẩm", path: "/owner/products", icon: PackageSearch }, { label: "Mùa vụ", path: "/owner/seasons", icon: Sprout }] },
    { title: "Vận hành", items: [{ label: "Kho vận hành", path: "/owner/inventory", icon: Warehouse }, { label: "Thiết bị cân", path: "/owner/devices", icon: Cpu }, { label: "Giao dịch", path: "/owner/transactions", icon: ClipboardList }] },
    { title: "Theo dõi", items: [{ label: "Báo cáo", path: "/owner/reports", icon: FileText }] },
];

function getInitials(fullName = "") {
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "OW";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words.at(-1)[0]}`.toUpperCase();
}

export function OwnerSidebar() {
    const { user, logout } = useAuth();
    const isFarmManager = user?.role === "FARM_MANAGER" || user?.roles?.includes("FARM_MANAGER");
    const workspaceRole = isFarmManager ? "Farm Manager" : "Owner";
    const ownerName = user?.fullName || workspaceRole;
    return <aside className="fixed left-0 top-0 z-40 flex h-screen w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-[68px] items-center gap-3 border-b border-slate-200 px-4"><img src={ORBIT_LOGO} alt="ORBIT" style={{ height: "44px", width: "auto", maxWidth: "120px", display: "block" }} /><span className="text-[22px] font-semibold leading-none text-[#006948]">{workspaceRole}</span></div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5">{OWNER_NAV_GROUPS.map((group) => <section key={group.title}><p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{group.title}</p><div className="space-y-1">{group.items.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => ["flex min-h-[42px] w-full items-center gap-3 rounded-xl px-4 text-[14px] font-medium transition-colors duration-150", isActive ? "bg-[#006948] !text-white shadow-sm" : "text-slate-700 hover:bg-emerald-50 hover:text-[#006948]"].join(" ")}>{({ isActive }) => <><Icon size={19} strokeWidth={1.8} className={isActive ? "!text-white" : "text-current"} /><span>{label}</span></>}</NavLink>)}</div></section>)}</nav>
        <div className="space-y-3 border-t border-slate-200 p-4"><NavLink to="/owner/settings" className={({ isActive }) => ["flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold transition-colors", isActive ? "bg-emerald-50 text-[#006948]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}><Settings size={15} strokeWidth={1.8} /><span>Cài đặt tài khoản</span></NavLink><div className="flex h-14 items-center justify-between rounded-xl bg-slate-50 px-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#006948] text-xs font-bold text-white">{getInitials(ownerName)}</div><div className="min-w-0"><p className="truncate text-[13px] font-semibold text-slate-900">{ownerName}</p><p className="truncate text-[11px] text-slate-500">{isFarmManager ? "Quản lý Farm" : "Chủ nông trại"}</p></div></div><button type="button" onClick={logout} title="Đăng xuất" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"><LogOut size={16} strokeWidth={1.8} /></button></div></div>
    </aside>;
}
