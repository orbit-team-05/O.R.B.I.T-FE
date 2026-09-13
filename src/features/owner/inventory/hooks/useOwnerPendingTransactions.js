import { useState, useCallback, useEffect } from "react";
import { getOwnerPendingTransactions, approveOwnerTransaction, getOwnerTransactionDetail } from "../services/ownerInventoryApi";
import { useToast } from "../../../../components/common/toast/ToastProvider";

export function useOwnerPendingTransactions(farmId, warehouseType = "MATERIAL") {
    const [transactions, setTransactions] = useState([]);
    const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [sortKey, setSortKeyState] = useState("createdDesc");
    const toast = useToast();

    const fetchTransactions = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError(null);

            const sort = {
                createdDesc: "created,desc",
                createdAsc: "created,asc",
                quantityDesc: "quantity,desc",
                status: "status,asc",
            }[sortKey] || "created,desc";
            const pageData = await getOwnerPendingTransactions(farmId, page, 10, warehouseType, sort);
            setTransactions(pageData.content);
            setPageInfo(pageData);
        } catch (err) {
            console.error("Failed to fetch pending transactions:", err);
            setError(err.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }, [farmId, page, warehouseType, sortKey]);

    useEffect(() => {
        // Start the async pending-transaction loading lifecycle.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTransactions();
    }, [fetchTransactions]);

    const approveTransaction = async (transactionId, isApproved, updates = {}) => {
        try {
            const res = await approveOwnerTransaction(farmId, transactionId, isApproved, updates);
            if (res.success) {
                toast.success(isApproved ? "Đã duyệt giao dịch" : "Đã từ chối giao dịch");
                fetchTransactions(); // Refresh list
                return true;
            } else {
                toast.error(res.message || "Không thể thực hiện hành động");
                return false;
            }
        } catch {
            toast.error("Lỗi khi kết nối server");
            return false;
        }
    };

    const getTransactionDetail = async (transactionId) => {
        try {
            const res = await getOwnerTransactionDetail(farmId, transactionId);
            if (!res.success) throw new Error(res.message || "Không thể tải chi tiết giao dịch.");
            return res.data;
        } catch (err) {
            toast.error(err.message || "Không thể tải chi tiết giao dịch.");
            return null;
        }
    };

    return {
        transactions,
        pageInfo,
        loading,
        error,
        page,
        setPage,
        sortKey,
        setSortKey: (nextSortKey) => {
            setSortKeyState(nextSortKey);
            setPage(0);
        },
        reload: fetchTransactions,
        approveTransaction,
        getTransactionDetail
    };
}
