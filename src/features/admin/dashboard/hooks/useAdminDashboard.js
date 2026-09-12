import { useCallback, useEffect, useState } from "react";

import { getAdminDashboardSummary } from "../services/adminDashboardApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useAdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");
            const dashboardData = await getAdminDashboardSummary();
            setDashboard(dashboardData);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải tổng quan Admin."));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Data loading is intentionally started by the effect when the route mounts.
    // The hook updates loading/data state as the request progresses.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [loadDashboard]);

    return {
        dashboard,
        loading,
        refreshing,
        error,
        reload: () => loadDashboard(true),
    };
}
