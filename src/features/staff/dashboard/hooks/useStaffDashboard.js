import { useCallback, useEffect, useState } from "react";
import { getStaffDashboard } from "../services/staffDashboardApi";

export function useStaffDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setData(await getStaffDashboard());
        } catch (requestError) {
            setError(requestError?.response?.data?.message || requestError?.message || "Không thể tải tổng quan Staff.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => { void reload(); }, 0);
        return () => window.clearTimeout(timer);
    }, [reload]);

    return { data, loading, error, reload };
}
