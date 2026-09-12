import {
    LayoutDashboard,
    Cpu,
    Users,
    Warehouse,
    Settings,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
    {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Thiết bị cân",
        path: "/admin/devices",
        icon: Cpu,
    },
    {
        label: "Người dùng",
        path: "/admin/users",
        icon: Users,
    },
    {
        label: "Nông trại",
        path: "/admin/farms",
        icon: Warehouse,
    },
    {
        label: "Cài đặt",
        path: "/admin/settings",
        icon: Settings,
    },
];
