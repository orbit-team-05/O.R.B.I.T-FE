import { useCallback, useEffect, useState } from "react";
import { getStaffTransactionHistory } from "../services/staffTransactionApi";

export function useStaffTransactionHistory(status) {
    const [page, setPage] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setData(await getStaffTransactionHistory({ status, page, size: 10 }));
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Không thể tải lịch sử giao dịch.");
        } finally {
            setLoading(false);
        }
    }, [page, status]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void reload(); }, 0);
        return () => window.clearTimeout(timer);
    }, [reload]);

    return {
        transactions: data?.content || [],
        pageInfo: data || {},
        page,
        setPage,
        loading,
        error,
        reload,
    };
}
