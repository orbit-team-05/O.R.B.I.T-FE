import { Route } from "react-router-dom";
import { AdminLayout } from "../../layouts/admin/AdminLayout";
import { AdminDashboardPage } from "../../pages/admin/dashboard/AdminDashboardPage";
import { AdminSpeciesPage } from "../../pages/admin/species/AdminSpeciesPage";
import { AdminMarketSourcesPage } from "../../pages/admin/market-sources/AdminMarketSourcesPage";
import { AdminCrawlTargetsPage } from "../../pages/admin/crawl-targets/AdminCrawlTargetsPage";
import { AdminIotDevicesPage } from "../../pages/admin/devices/AdminIotDevicesPage";

export function AdminRoutes() {
    return (
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="species" element={<AdminSpeciesPage />} />
            <Route path="market-sources" element={<AdminMarketSourcesPage />} />
            <Route path="crawl-targets" element={<AdminCrawlTargetsPage />} />
            <Route path="devices" element={<AdminIotDevicesPage />} />
        </Route>
    );
}