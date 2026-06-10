import {
    LayoutDashboard,
    Leaf,
    Database,
    SlidersHorizontal,
    Cpu,
    ChartNoAxesCombined,
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
        label: "Quản lý Species",
        path: "/admin/species",
        icon: Leaf,
    },
    {
        label: "Nguồn dữ liệu",
        path: "/admin/market-sources",
        icon: Database,
    },
    {
        label: "Cấu hình Crawl",
        path: "/admin/crawl-targets",
        icon: SlidersHorizontal,
    },
    {
        label: "Thiết bị IoT",
        path: "/admin/devices",
        icon: Cpu,
    },
    {
        label: "Dữ liệu giá Crawl",
        path: "/admin/market-prices",
        icon: ChartNoAxesCombined,
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
        label: "Cài đặt hệ thống",
        path: "/admin/settings",
        icon: Settings,
    },
];