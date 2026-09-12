import { useState } from "react";
import { PendingTransactionList } from "./PendingTransactionList";
import { ApproveTransactionDrawer } from "./ApproveTransactionDrawer";
import { useOwnerPendingTransactions } from "../hooks/useOwnerPendingTransactions";
import Pagination from "../../../../components/common/pagination/Pagination";

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
            {!loading && transactions.length > 0 && (
                <Pagination
                    page={page}
                    totalPages={pageInfo.totalPages}
                    totalElements={pageInfo.totalElements}
                    loading={loading}
                    onPageChange={setPage}
                />
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
