import { Navigate } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/AuthContext";

/**
 * Bảo vệ route — chỉ cho phép user đã đăng nhập và có role phù hợp.
 *
 * @param {{ allowedRoles: string[], children: React.ReactNode }} props
 */
export function ProtectedRoute({ allowedRoles, children }) {
    const { isAuthenticated, user, getDefaultDashboard } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Kiểm tra role
    if (allowedRoles && allowedRoles.length > 0) {
        const hasRole = user?.roles?.some((role) => allowedRoles.includes(role));

        if (!hasRole) {
            // Redirect về dashboard phù hợp với role thực của user
            return <Navigate to={getDefaultDashboard()} replace />;
        }
    }

    return children;
}
