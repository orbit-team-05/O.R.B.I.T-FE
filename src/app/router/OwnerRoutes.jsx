import { Navigate, Route, Routes } from "react-router-dom";

import { OwnerLayout } from "../../layouts/owner/OwnerLayout";
import { OwnerIotDevicesPage } from "../../pages/owner/devices/OwnerIotDevicesPage";
import { OwnerProductsPage } from "../../pages/owner/products/OwnerProductsPage";
import OwnerDashboardPage from "../../pages/owner/dashboard/OwnerDashboardPage";
import { OwnerSeasonsPage } from "../../pages/owner/seasons/OwnerSeasonsPage";
import { OwnerInventoryPage } from "../../pages/owner/inventory/OwnerInventoryPage";
import { OwnerSettingsPage } from "../../pages/owner/settings/OwnerSettingsPage";
import { OwnerStaffPage } from "../../pages/owner/staff/OwnerStaffPage";
import { OwnerFarmPage } from "../../pages/owner/farms/OwnerFarmPage";
import { OwnerReportsPage } from "../../pages/owner/reports/OwnerReportsPage";
import OwnerTransactionsPage from "../../pages/owner/transactions/OwnerTransactionsPage";

export function OwnerRoutes() {
    return (
        <Routes>
            <Route element={<OwnerLayout />}>
                <Route index element={<Navigate to="/owner/dashboard" replace />} />

                <Route
                    path="dashboard"
                    element={<OwnerDashboardPage />}
                />

                <Route
                    path="farms"
                    element={<OwnerFarmPage />}
                />

                <Route
                    path="seasons"
                    element={<OwnerSeasonsPage />}
                />

                <Route path="inventory" element={<OwnerInventoryPage />} />
                <Route path="products" element={<OwnerProductsPage />} />
                <Route path="devices" element={<OwnerIotDevicesPage />} />
                <Route path="transactions" element={<OwnerTransactionsPage />} />

                <Route
                    path="reports"
                    element={<OwnerReportsPage />}
                />

                <Route
                    path="staff"
                    element={<OwnerStaffPage />}
                />

                <Route
                    path="settings"
                    element={<OwnerSettingsPage />}
                />

                <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
            </Route>
        </Routes>
    );
}
