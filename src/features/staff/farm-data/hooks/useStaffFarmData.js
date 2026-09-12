import { useCallback, useEffect, useState } from "react";
import { getStaffFarmData } from "../services/staffFarmDataApi";

export function useStaffFarmData(farmId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(Boolean(farmId));
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        if (!farmId) {
            setData(null);
            setLoading(false);
            setError("Tài khoản Staff chưa được gán Farm.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            setData(await getStaffFarmData(farmId));
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Không thể tải dữ liệu Farm. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void reload(); }, 0);
        return () => window.clearTimeout(timer);
    }, [reload]);

    return { data, loading, error, reload };
}
