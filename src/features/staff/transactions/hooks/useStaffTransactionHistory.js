import { useCallback, useEffect, useState } from "react";
import { getStaffTransactionHistory } from "../services/staffTransactionApi";

const TRANSACTION_SORTS = {
    createdDesc: "created,desc",
    createdAsc: "created,asc",
    quantityDesc: "quantity,desc",
    status: "status,asc",
    product: "product,asc",
};

export function useStaffTransactionHistory(status) {
    const [page, setPage] = useState(0);
    const [sortKey, setSortKeyState] = useState("createdDesc");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setData(await getStaffTransactionHistory({
                status,
                page,
                size: 10,
                sort: TRANSACTION_SORTS[sortKey] || TRANSACTION_SORTS.createdDesc,
            }));
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Không thể tải lịch sử giao dịch.");
        } finally {
            setLoading(false);
        }
    }, [page, sortKey, status]);

    useEffect(() => {
        const timer = window.setTimeout(() => { void reload(); }, 0);
        return () => window.clearTimeout(timer);
    }, [reload]);

    return {
        transactions: data?.content || [],
        pageInfo: data || {},
        page,
        setPage,
        sortKey,
        setSortKey: (nextSortKey) => {
            setSortKeyState(nextSortKey);
            setPage(0);
        },
        loading,
        error,
        reload,
    };
}
