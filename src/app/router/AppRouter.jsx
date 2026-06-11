import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { AdminRoutes } from "./AdminRoutes";
import { OwnerRoutes } from "./OwnerRoutes.jsx";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/owner/dashboard" replace />}
                />

                <Route
                    path="/admin/*"
                    element={<AdminRoutes />}
                />

                <Route
                    path="/owner/*"
                    element={<OwnerRoutes />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/owner/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}