import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { AdminRoutes } from "./AdminRoutes";
import { OwnerRoutes } from "./OwnerRoutes.jsx";
import { StaffRoutes } from "./StaffRoutes.jsx";
import { AuthProvider } from "../../features/auth/context/AuthContext";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { GuestRoute } from "./guards/GuestRoute";
import { RoleRedirect } from "./guards/RoleRedirect";
import { LoginPage } from "../../pages/auth/LoginPage";
import { ForcePasswordChangePage } from "../../pages/auth/ForcePasswordChangePage";

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
                        path="/change-password"
                        element={
                            <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "FARM_MANAGER", "STAFF"]}>
                                <ForcePasswordChangePage />
                            </ProtectedRoute>
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
                            <ProtectedRoute allowedRoles={["OWNER", "FARM_MANAGER"]}>
                                <OwnerRoutes />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/staff/*"
                        element={
                            <ProtectedRoute allowedRoles={["STAFF"]}>
                                <StaffRoutes />
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
