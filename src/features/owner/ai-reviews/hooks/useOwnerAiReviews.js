import { useCallback, useMemo, useState } from "react";
import {
    getOwnerAiReviews,
    getOwnerReviewProducts,
    reviewOwnerAiTransaction,
} from "../services/ownerAiReviewApi";

function getErrorMessage(error, fallbackMessage) {
    return error?.response?.data?.message || error?.message || fallbackMessage;
}

export function useOwnerAiReviews(farmId, initialPage = 0, initialSize = 10) {
    const [reviewPage, setReviewPage] = useState(null);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(initialPage);
    const [size] = useState(initialSize);

    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const reviews = reviewPage?.content ?? [];

    const loadReviews = useCallback(async () => {
        if (!farmId) return;

        try {
            setLoading(true);
            setError("");

            const data = await getOwnerAiReviews(farmId, page, size);
            setReviewPage(data);
        } catch (err) {
            setError(getErrorMessage(err, "Không thể tải danh sách cần duyệt AI."));
        } finally {
            setLoading(false);
        }
    }, [farmId, page, size]);

    const loadProducts = useCallback(async () => {
        if (!farmId) return;

        try {
            setProductsLoading(true);

            const data = await getOwnerReviewProducts(farmId, 0, 100);
            setProducts(data?.content ?? []);
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể tải danh sách sản phẩm."));
        } finally {
            setProductsLoading(false);
        }
    }, [farmId]);

    const summary = useMemo(() => {
        return {
            totalNeedReview: reviewPage?.totalElements ?? reviews.length,
            unrecognized: reviews.filter((item) => item.aiStatus === "UNRECOGNIZED").length,
            lowConfidence: reviews.filter((item) => item.aiStatus === "LOW_CONFIDENCE").length,
            pending: reviews.filter((item) => item.aiStatus === "PENDING").length,
        };
    }, [reviewPage?.totalElements, reviews]);

    async function reviewTransaction(transactionId, productId) {
        if (!farmId || !transactionId || !productId) return null;

        try {
            setSubmitting(true);
            setActionError("");
            setActionSuccess("");

            const data = await reviewOwnerAiTransaction(
                farmId,
                transactionId,
                Number(productId),
            );

            setActionSuccess("Duyệt AI thành công.");
            await loadReviews();

            return data;
        } catch (err) {
            setActionError(getErrorMessage(err, "Không thể duyệt giao dịch AI."));
            return null;
        } finally {
            setSubmitting(false);
        }
    }

    function handleSetPage(nextPage) {
        setPage(Math.max(Number(nextPage) || 0, 0));
    }

    return {
        reviews,
        products,
        summary,

        pageInfo: {
            number: reviewPage?.number ?? reviewPage?.page ?? page,
            size: reviewPage?.size ?? size,
            totalPages: reviewPage?.totalPages ?? 0,
            totalElements: reviewPage?.totalElements ?? 0,
            first: reviewPage?.first ?? true,
            last: reviewPage?.last ?? true,
        },

        loading,
        initialLoading: loading && reviewPage === null,
        tableLoading: loading && reviewPage !== null,
        productsLoading,
        submitting,

        error,
        actionError,
        actionSuccess,

        setPage: handleSetPage,
        reload: loadReviews,
        loadProducts,
        reviewTransaction,
        clearActionMessages: () => {
            setActionError("");
            setActionSuccess("");
        },
    };
}