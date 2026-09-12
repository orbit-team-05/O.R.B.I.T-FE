import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "../../layouts/admin/AdminLayout";
import { AdminDashboardPage } from "../../pages/admin/dashboard/AdminDashboardPage";
import { AdminIotDevicesPage } from "../../pages/admin/devices/AdminIotDevicesPage";
import { AdminUsersPage } from "../../pages/admin/users/AdminUsersPage";
import { AdminFarmPage } from "../../pages/admin/farms/AdminFarmPage";
import { AdminReportsPage } from "../../pages/admin/reports/AdminReportsPage";
import { SettingsPage } from "../../pages/common/SettingsPage";

export function AdminRoutes() {
    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="devices" element={<AdminIotDevicesPage />} />
                <Route path="users" element={<AdminUsersPage />} />

                <Route path="farms" element={<AdminFarmPage />} />

                <Route
                    path="settings"
                    element={<SettingsPage />}
                />

                <Route path="reports" element={<AdminReportsPage />} />

                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
        </Routes>
    );
}
