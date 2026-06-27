import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";

import { OwnerProductCreateDrawer } from "../../../features/owner/products/components/OwnerProductCreateDrawer";
import { OwnerProductDetailDrawer } from "../../../features/owner/products/components/OwnerProductDetailDrawer";
import { OwnerProductTable } from "../../../features/owner/products/components/OwnerProductTable";

import { useOwnerProducts } from "../../../features/owner/products/hooks/useOwnerProducts";

function PageHeader({ onCreate, onRefresh }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / Sản phẩm
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Sản phẩm & QR kho
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý sản phẩm, keypad và QR cho thiết bị IoT.
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    Làm mới
                </button>

                <button
                    type="button"
                    onClick={onCreate}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white hover:bg-[#00583d]"
                >
                    <Plus size={16} />
                    Tạo sản phẩm
                </button>
            </div>
        </header>
    );
}

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

        createProduct,
        clearActionMessages,
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
                Tài khoản OWNER chưa có farmId.
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

    async function handleCreateProduct(payload) {
        const result = await createProduct(payload);

        if (result) {
            setCreateOpen(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <PageHeader
                    onCreate={openCreateDrawer}
                    onRefresh={reload}
                />

                <PageSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                onCreate={openCreateDrawer}
                onRefresh={reload}
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

                        <OwnerProductTable
                            products={products}
                            pageInfo={pageInfo}
                            loading={tableLoading}
                            onPageChange={setPage}
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
            />
        </div>
    );
}