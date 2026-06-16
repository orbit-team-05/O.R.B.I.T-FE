import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "../../layouts/admin/AdminLayout";
import { AdminDashboardPage } from "../../pages/admin/dashboard/AdminDashboardPage";
import { AdminSpeciesPage } from "../../pages/admin/species/AdminSpeciesPage";
import { AdminMarketSourcesPage } from "../../pages/admin/market-sources/AdminMarketSourcesPage";
import { AdminCrawlTargetsPage } from "../../pages/admin/crawl-targets/AdminCrawlTargetsPage";
import { AdminIotDevicesPage } from "../../pages/admin/devices/AdminIotDevicesPage";
import { AdminMarketPricesPage } from "../../pages/admin/market-prices/AdminMarketPricesPage";
import { AdminUsersPage } from "../../pages/admin/users/AdminUsersPage";
import { AdminComingSoonPage } from "../../pages/admin/common/AdminComingSoonPage";

export function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="species" element={<AdminSpeciesPage />} />
                <Route path="market-sources" element={<AdminMarketSourcesPage />} />
                <Route path="crawl-targets" element={<AdminCrawlTargetsPage />} />
                <Route path="devices" element={<AdminIotDevicesPage />} />
                <Route path="market-prices" element={<AdminMarketPricesPage />} />

                <Route path="users" element={<AdminUsersPage />} />

                <Route
                    path="farms"
                    element={
                        <AdminComingSoonPage
                            title="Quản lý Nông trại"
                            description="Màn hình theo dõi danh sách farm, owner và phạm vi dữ liệu sẽ được triển khai sau."
                        />
                    }
                />

                <Route
                    path="settings"
                    element={
                        <AdminComingSoonPage
                            title="Cài đặt hệ thống"
                            description="Màn hình cấu hình tham số hệ thống và thiết lập vận hành sẽ được triển khai sau."
                        />
                    }
                />

                <Route
                    path="reports"
                    element={
                        <AdminComingSoonPage
                            title="Tạo Báo Cáo"
                            description="Chức năng tạo và xuất báo cáo hệ thống sẽ được triển khai trong giai đoạn tiếp theo."
                        />
                    }
                />

                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
        </Routes>
    );
}