import { useState } from "react";
import { PendingTransactionList } from "./PendingTransactionList";
import { ApproveTransactionDrawer } from "./ApproveTransactionDrawer";
import { useOwnerPendingTransactions } from "../hooks/useOwnerPendingTransactions";

export function OwnerPendingTransactionsTab({ farmId, warehouseType = "MATERIAL" }) {
    const {
        transactions,
        pageInfo,
        loading,
        page,
        setPage,
        approveTransaction,
        getTransactionDetail
    } = useOwnerPendingTransactions(farmId, warehouseType);

    const [selectedTx, setSelectedTx] = useState(null);

    const handleApprove = async (txId, updates = {}) => {
        const success = await approveTransaction(txId, true, updates);
        if (success) setSelectedTx(null);
    };

    const handleReject = async (txId, updates = {}) => {
        const success = await approveTransaction(txId, false, updates);
        if (success) setSelectedTx(null);
    };

    const handleViewDetail = async (tx) => {
        setSelectedTx(tx);
        const detail = await getTransactionDetail(tx.id);
        if (detail) setSelectedTx(detail);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Danh sách chờ duyệt</h3>
            </div>

            <PendingTransactionList
                transactions={transactions}
                loading={loading}
                onApprove={handleApprove}
                onReject={(txId) => handleReject(txId)}
                onViewDetail={handleViewDetail}
            />

            {/* Phân trang */}
            {!loading && transactions.length > 0 && pageInfo.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            Trước
                        </button>
                        <span className="px-4 py-2 text-sm text-slate-600 flex items-center">
                            Trang {page + 1} / {pageInfo.totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(pageInfo.totalPages - 1, p + 1))}
                            disabled={page === pageInfo.totalPages - 1}
                            className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            <ApproveTransactionDrawer
                transaction={selectedTx}
                open={!!selectedTx}
                onClose={() => setSelectedTx(null)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}
