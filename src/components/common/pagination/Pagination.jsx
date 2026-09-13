import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared zero-based pagination control.
 * The API and hooks use page 0 for the first page; the user-facing label is 1-based.
 */
export default function Pagination({
    page = 0,
    totalPages = 0,
    totalElements = 0,
    pageSize = 10,
    loading = false,
    onPageChange,
}) {
    // The server is the source of truth for a paged response. Never turn the
    // current page length into the dataset total: 22 records split by size 10
    // must remain 3 pages, not 1 page with 10 records.
    const parsedTotalElements = Number(totalElements);
    const safeTotalElements = Math.max(Number.isFinite(parsedTotalElements) ? parsedTotalElements : 0, 0);
    const safePageSize = Math.max(Number(pageSize) || 10, 1);
    const calculatedTotalPages = safeTotalElements > 0
        ? Math.ceil(safeTotalElements / safePageSize)
        : 0;
    const declaredTotalPages = Math.max(Number(totalPages) || 0, 0);
    const safeTotalPages = safeTotalElements > 0
        ? Math.max(declaredTotalPages, calculatedTotalPages)
        : declaredTotalPages;
    const safePage = safeTotalPages > 0
        ? Math.min(Math.max(Number(page) || 0, 0), safeTotalPages - 1)
        : 0;

    if (safeTotalPages === 0) {
        return null;
    }

    const goToPage = (nextPage) => {
        if (loading || typeof onPageChange !== "function") return;
        onPageChange(Math.min(Math.max(nextPage, 0), safeTotalPages - 1));
    };

    return (
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">
                Trang <span className="font-semibold text-slate-700">{safePage + 1}</span> / {safeTotalPages}
                <span className="ml-2 text-slate-400">({safeTotalElements} mục)</span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Trang trước"
                    disabled={safePage === 0 || loading}
                    onClick={() => goToPage(safePage - 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={15} />
                    Trước
                </button>
                <button
                    type="button"
                    aria-label="Trang sau"
                    disabled={safePage >= safeTotalPages - 1 || loading}
                    onClick={() => goToPage(safePage + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Sau
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}
