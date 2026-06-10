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
                {AdminRoutes()}
                {OwnerRoutes()}

                <Route
                    path="/"
                    element={<Navigate to="/owner/dashboard" replace />}
                />

                <Route
                    path="*"
                    element={<h1>404 - Không tìm thấy trang</h1>}
                />
            </Routes>
        </BrowserRouter>
    );
}