import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { AdminRoutes } from "./AdminRoutes";
import { OwnerRoutes } from "./OwnerRoutes.jsx";
import { AuthProvider } from "../../features/auth/context/AuthContext";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { GuestRoute } from "./guards/GuestRoute";
import { RoleRedirect } from "./guards/RoleRedirect";
import { LoginPage } from "../../pages/auth/LoginPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        }
                    />

                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRoles={["ADMIN"]}>
                                <AdminRoutes />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/owner/*"
                        element={
                            <ProtectedRoute allowedRoles={["OWNER"]}>
                                <OwnerRoutes />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/"
                        element={<RoleRedirect />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}