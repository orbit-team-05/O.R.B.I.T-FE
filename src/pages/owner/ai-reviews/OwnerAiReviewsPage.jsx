import { useEffect, useState } from "react";

import { OwnerAiReviewDrawer } from "../../../features/owner/ai-reviews/components/OwnerAiReviewDrawer";
import { OwnerAiReviewStats } from "../../../features/owner/ai-reviews/components/OwnerAiReviewStats";
import { OwnerAiReviewTable } from "../../../features/owner/ai-reviews/components/OwnerAiReviewTable";
import { useOwnerAiReviews } from "../../../features/owner/ai-reviews/hooks/useOwnerAiReviews";
import { useAuth } from "../../../features/auth/context/AuthContext";
import { useToast } from "../../../components/common/toast/ToastProvider";

function PageHeader({ onRefresh }) {
    return (
        <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p className="text-sm font-medium text-[#006948]">
                    Owner / AI Review
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Duyệt AI & hậu kiểm scan
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Xác nhận lại các giao dịch IoT mà AI/QR chưa nhận diện chắc chắn.
                </p>
            </div>

            <button
                type="button"
                onClick={onRefresh}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                Làm mới
            </button>
        </header>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-4 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-[116px] animate-pulse rounded-xl bg-slate-100"
                    />
                ))}
            </div>

            <div className="h-[420px] animate-pulse rounded-xl bg-slate-100" />
        </div>
    );
}

export function OwnerAiReviewsPage() {
    const toast = useToast();

    const { user } = useAuth();
    const farmId = user?.farmId;

    const {
        reviews,
        products,
        summary,
        pageInfo,
        initialLoading,
        tableLoading,
        productsLoading,
        submitting,
        error,
        actionError,
        actionSuccess,
        reload,
        loadProducts,
        setPage,
        reviewTransaction,
        clearActionMessages,
    } = useOwnerAiReviews(farmId);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        reload();
    }, [reload]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error, toast]);

    useEffect(() => {
        if (actionSuccess) {
            toast.success(actionSuccess);
            clearActionMessages();
        }

        if (actionError) {
            toast.error(actionError);
            clearActionMessages();
        }
    }, [
        actionSuccess,
        actionError,
        toast,
        clearActionMessages,
    ]);

    if (!farmId) {
        return null;
    }

    function openReviewDrawer(review) {
        clearActionMessages();
        setSelectedReview(review);
        setDrawerOpen(true);
    }

    function closeReviewDrawer() {
        setDrawerOpen(false);
        setSelectedReview(null);
        clearActionMessages();
    }

    async function handleSubmitReview(productId) {
        const result = await reviewTransaction(
            selectedReview?.transactionId,
            productId,
        );

        if (result) {
            closeReviewDrawer();
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader onRefresh={reload} />

            {initialLoading ? (
                <PageSkeleton />
            ) : (
                <main className="space-y-6 px-6 py-6">
                    <OwnerAiReviewStats summary={summary} />

                    <OwnerAiReviewTable
                        reviews={reviews}
                        pageInfo={pageInfo}
                        loading={tableLoading}
                        onPageChange={setPage}
                        onReview={openReviewDrawer}
                    />
                </main>
            )}

            <OwnerAiReviewDrawer
                open={drawerOpen}
                review={selectedReview}
                products={products}
                productsLoading={productsLoading}
                submitting={submitting}
                actionError={actionError}
                onClose={closeReviewDrawer}
                onSubmit={handleSubmitReview}
            />
        </div>
    );
}

export default OwnerAiReviewsPage;