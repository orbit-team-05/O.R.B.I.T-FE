import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { OwnerProductCreateDrawer } from "../../../features/owner/products/components/OwnerProductCreateDrawer";
import { OwnerProductDetailDrawer } from "../../../features/owner/products/components/OwnerProductDetailDrawer";
import { OwnerProductCardList } from "../../../features/owner/products/components/OwnerProductCardList";
import { OwnerPageHeader } from "../common/OwnerPageHeader";

import { useOwnerProducts } from "../../../features/owner/products/hooks/useOwnerProducts";

function ProductStats({ summary }) {
    const items = [
        {
            key: "totalProducts",
            label: "Tổng sản phẩm",
        },
        {
            key: "feed",
            label: "Thức ăn",
        },
        {
            key: "medicine",
            label: "Thuốc",
        },
        {
            key: "chemical",
            label: "Hóa chất",
        },
    ];

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <article
                    key={item.key}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {summary?.[item.key] ?? 0}
                    </p>
                </article>
            ))}
        </section>
    );
}

function ProductFilters({ filters, onChange }) {
    return <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={filters.keyword} onChange={(event) => onChange({ ...filters, keyword: event.target.value })} placeholder="Tìm theo tên hoặc mã sản phẩm..." className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-emerald-100" /></div>
        <select value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value })} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">Tất cả loại</option><option value="FEED">Thức ăn</option><option value="MEDICINE">Thuốc</option><option value="CHEMICAL">Hóa chất</option><option value="MATERIAL">Vật tư</option><option value="HARVEST_PRODUCT">Sản phẩm thu hoạch</option></select>
        <select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700"><option value="">Tất cả trạng thái</option><option value="ACTIVE">Đang sử dụng</option><option value="INACTIVE">Ngừng sử dụng</option></select>
    </section>;
}

function PageSkeleton() {
    return (
        <div className="space-y-5 px-6 py-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-[96px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="h-[420px] animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
    );
}

export function OwnerProductsPage() {
    const { user } = useAuth();

    const farmId = user?.farmId;

    const {
        products = [],
        createdProduct,
        setCreatedProduct,

        summary = {},
        pageInfo = {},

        initialLoading,
        tableLoading,
        submitting,

        error,
        actionError,
        actionSuccess,

        reload,
        setPage,
        sortKey,
        setSortKey,
        filters,
        setFilters,

        createProduct,
        clearActionMessages,
        saveProduct,
        changeProductStatus,
        uploadImageForProduct,
    } = useOwnerProducts(farmId);

    const [createOpen, setCreateOpen] =
        useState(false);

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    useEffect(() => {
        if (farmId) {
            reload();
        }
    }, [farmId, reload]);

    if (!farmId) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                Tài khoản chưa được gán Farm.
                Vui lòng kiểm tra dữ liệu user/farm.
            </div>
        );
    }

    function openProductDetail(product) {
        setSelectedProduct(product);
    }

    function closeProductDetail() {
        setSelectedProduct(null);
    }

    function openCreateDrawer() {
        clearActionMessages();
        setCreateOpen(true);
    }

    function closeCreateDrawer() {
        setCreateOpen(false);
        clearActionMessages();
    }

    async function handleCreateProduct(payload, imageFile) {
        const result = await createProduct(payload);

        if (result) {
            if (imageFile) {
                const updatedProduct = await uploadImageForProduct(result.id, imageFile);
                if (updatedProduct) setCreatedProduct(updatedProduct);
            }
            setCreateOpen(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <OwnerPageHeader
                    title="Sản phẩm"
                    description="Quản lý sản phẩm, keypad và QR cho thiết bị IoT."
                    actions={<>
                        <button type="button" onClick={reload} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700">Làm mới</button>
                        <button type="button" onClick={openCreateDrawer} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white"><Plus size={16} />Tạo sản phẩm</button>
                    </>}
                />

                <PageSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <OwnerPageHeader
                title="Sản phẩm"
                description="Quản lý sản phẩm, keypad và QR cho thiết bị IoT."
                actions={<>
                    <button type="button" onClick={reload} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Làm mới</button>
                    <button type="button" onClick={openCreateDrawer} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"><Plus size={16} />Tạo sản phẩm</button>
                </>}
            />

            <main className="space-y-6 px-6 py-6">
                {actionSuccess && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-[#006948]">
                        {actionSuccess}
                    </div>
                )}

                {actionError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {actionError}
                    </div>
                )}

                {error ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <>
                        <ProductStats summary={summary} />

                        <ProductFilters filters={filters} onChange={(nextFilters) => { setPage(0); setFilters(nextFilters); }} />

                        <OwnerProductCardList
                            products={products}
                            pageInfo={pageInfo}
                            loading={tableLoading}
                            onPageChange={setPage}
                            sortKey={sortKey}
                            onSortChange={setSortKey}
                            onViewDetail={
                                openProductDetail
                            }
                        />
                    </>
                )}
            </main>

            <OwnerProductCreateDrawer
                open={createOpen}
                submitting={submitting}
                actionError={actionError}
                onClose={closeCreateDrawer}
                onSubmit={handleCreateProduct}
            />

            <OwnerProductDetailDrawer
                open={Boolean(createdProduct)}
                product={createdProduct}
                onClose={() =>
                    setCreatedProduct(null)
                }
            />

            <OwnerProductDetailDrawer
                open={Boolean(selectedProduct)}
                product={selectedProduct}
                onClose={closeProductDetail}
                submitting={submitting}
                onSave={async (productId, payload) => {
                    const result = await saveProduct(productId, payload);
                    if (result) setSelectedProduct(result);
                    return result;
                }}
                onStatusChange={async (productId, status) => {
                    const result = await changeProductStatus(productId, status);
                    if (result) setSelectedProduct(result);
                    return result;
                }}
                onUploadImage={async (productId, file) => {
                    const result = await uploadImageForProduct(productId, file);
                    if (result) setSelectedProduct(result);
                    return result;
                }}
            />
        </div>
    );
}
