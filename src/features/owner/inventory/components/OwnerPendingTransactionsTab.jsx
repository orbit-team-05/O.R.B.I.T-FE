import { useState } from "react";
import { PendingTransactionList } from "./PendingTransactionList";
import { ApproveTransactionDrawer } from "./ApproveTransactionDrawer";
import { useOwnerPendingTransactions } from "../hooks/useOwnerPendingTransactions";
import Pagination from "../../../../components/common/pagination/Pagination";
import { SortSelect } from "../../../../components/common/sort/SortSelect";

export function OwnerPendingTransactionsTab({ farmId, warehouseType = "MATERIAL" }) {
    const {
        transactions,
        pageInfo,
        loading,
        page,
        setPage,
        sortKey,
        setSortKey,
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
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Danh sách chờ duyệt</h3>
                    <p className="mt-1 text-xs text-slate-500">Sắp xếp các giao dịch đang chờ xử lý.</p>
                </div>
                <SortSelect value={sortKey} onChange={setSortKey} options={[
                    { value: "createdDesc", label: "Mới tạo trước" },
                    { value: "createdAsc", label: "Cũ nhất trước" },
                    { value: "quantityDesc", label: "Khối lượng cao nhất" },
                    { value: "status", label: "Theo trạng thái" },
                ]} />
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
                    pageSize={pageInfo.size}
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
