import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

import { useToast } from "../../../components/common/toast/ToastProvider";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { InventoryStockCardList } from "../../../features/owner/inventory/components/InventoryStockCardList";
import { CreateTransactionDrawer } from "../../../features/owner/inventory/components/CreateTransactionDrawer";
import { Plus } from "lucide-react";
import { useState } from "react";
import { InventoryStockDetailDrawer } from "../../../features/owner/inventory/components/InventoryStockDetailDrawer";
import { OwnerPendingTransactionsTab } from "../../../features/owner/inventory/components/OwnerPendingTransactionsTab";

import { useOwnerInventoryStocks } from "../../../features/owner/inventory/hooks/useOwnerInventoryStocks";
import { formatCurrency } from "../../../utils/formatUtils";
import { OwnerPageHeader } from "../common/OwnerPageHeader";

export function OwnerInventoryPage() {
    const toast = useToast();
    const { user } = useAuth();
    const farmId = user?.farmId;
    const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('stock');
    const [warehouseType, setWarehouseType] = useState("MATERIAL");

    const {
        stocks,
        summary,
        pageInfo,
        loading,
        error,

        selectedStockDetail,
        setSelectedStockDetail,

        detailLoading,
        loadStockDetail,

        category,
        setCategory,

        setPage,
        reload,
    } = useOwnerInventoryStocks(farmId, warehouseType);

    const categories = warehouseType === "PRODUCT"
        ? [{ id: "", label: "Tất cả sản phẩm" }]
        : [
            { id: "", label: "Tất cả vật tư" },
            { id: "FEED", label: "Thức ăn (Cám)" },
            { id: "MEDICINE", label: "Thuốc thú y" },
            { id: "CHEMICAL", label: "Hóa chất" },
            { id: "MATERIAL", label: "Vật tư khác" },
        ];

    /**
     * Toast only for API errors.
     * Remove inline red UI.
     */
    useEffect(() => {
        if (error) {
            toast.error(
                "Không thể tải dữ liệu kho vật tư"
            );
        }
    }, [error, toast]);

    /**
     * Toast for missing farmId.
     */
    useEffect(() => {
        if (!farmId) {
            toast.error(
                "Tài khoản chưa được gán Farm"
            );
        }
    }, [farmId, toast]);

    async function openStockDetail(stock) {
        setSelectedStockDetail({
            stock,
            batches: [],
        });

        await loadStockDetail(stock.stockId);
    }

    function closeStockDetail() {
        setSelectedStockDetail(null);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <OwnerPageHeader
                title="Kho vận hành"
                description="Theo dõi kho vật tư, kho sản phẩm và các giao dịch chờ duyệt của Farm."
                actions={<>
                    <button type="button" onClick={reload} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"><RefreshCcw size={16} />Làm mới</button>
                    <button type="button" onClick={() => setTransactionDrawerOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-medium text-white hover:bg-[#00583d]"><Plus size={16} />Tạo giao dịch</button>
                </>}
            />

            <main className="px-6 py-6 space-y-6">
                <div className="flex flex-wrap border-b border-slate-200">
                    <button
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'stock' && warehouseType === 'MATERIAL' ? 'border-[#006948] text-[#006948]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setWarehouseType('MATERIAL'); setActiveTab('stock'); }}
                    >
                        Kho vật tư
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'stock' && warehouseType === 'PRODUCT' ? 'border-[#006948] text-[#006948]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => { setWarehouseType('PRODUCT'); setActiveTab('stock'); }}
                    >
                        Kho sản phẩm
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-[#006948] text-[#006948]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Giao dịch chờ duyệt
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <OwnerPendingTransactionsTab farmId={farmId} warehouseType={warehouseType} />
                ) : (
                    <div className="space-y-5">
                        <section className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            {warehouseType === "PRODUCT" ? "Sản phẩm đang lưu kho" : "Nhóm vật tư trong kho"}
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {summary?.totalProducts ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Sắp hết hàng
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-red-600">
                            {summary?.lowStockProducts ?? 0}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Giá trị tồn kho
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[#006948]">
                        {formatCurrency(summary?.inventoryValue)}
                    </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
                        <p className="text-xs font-medium uppercase text-slate-500">
                            Chờ duyệt
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-amber-600">
                            {summary?.pendingTransactions ?? 0}
                        </p>
                    </div>
                </section>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setCategory(cat.id);
                                setPage(0);
                            }}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                category === cat.id
                                    ? "bg-[#006948] text-white"
                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                    <InventoryStockCardList
                        stocks={stocks}
                        pageInfo={pageInfo}
                        loading={loading}
                        onPageChange={setPage}
                        onViewDetail={openStockDetail}
                    />
                    </div>
                )}
            </main>

            <InventoryStockDetailDrawer
                open={Boolean(selectedStockDetail)}
                detail={selectedStockDetail}
                loading={detailLoading}
                onClose={closeStockDetail}
            />

            <CreateTransactionDrawer 
                open={transactionDrawerOpen}
                onClose={() => setTransactionDrawerOpen(false)}
                onSuccess={reload}
                warehouseType={warehouseType}
            />
        </div>
    );
}

export default OwnerInventoryPage;
