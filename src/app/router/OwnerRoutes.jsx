import { Route } from "react-router-dom";
import { OwnerLayout } from "../../layouts/owner/OwnerLayout.jsx";
import { OwnerDashboardPage } from "../../pages/owner/dashboard/OwnerDashboardPage";
import { OwnerProductsPage } from "../../pages/owner/products/OwnerProductsPage";

export function OwnerRoutes() {
    return (
        <Route path="/owner" element={<OwnerLayout />}>
            <Route index element={<OwnerDashboardPage />} />
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="products" element={<OwnerProductsPage />} />
        </Route>
    );
}