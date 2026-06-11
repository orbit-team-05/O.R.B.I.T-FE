import { Route } from "react-router-dom";
import { AdminLayout } from "../../layouts/admin/AdminLayout";
import { AdminDashboardPage } from "../../pages/admin/dashboard/AdminDashboardPage";
import { AdminSpeciesPage } from "../../pages/admin/species/AdminSpeciesPage";
import { AdminMarketSourcesPage } from "../../pages/admin/market-sources/AdminMarketSourcesPage";

export function AdminRoutes() {
    return (
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="species" element={<AdminSpeciesPage />} />
            <Route path="market-sources" element={<AdminMarketSourcesPage />} />
        </Route>
    );
}