import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";

/**
 * Xử lý route "/" — redirect về dashboard phù hợp hoặc login.
 */
export function RoleRedirect() {
    const { isAuthenticated, getDefaultDashboard } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={getDefaultDashboard()} replace />;
    }

    return <Navigate to="/login" replace />;
}
