export function TableLoadingOverlay({
                                        message = "Đang tải dữ liệu...",
                                        minHeight = 220,
                                    }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-3 border-t border-slate-200 bg-white"
            style={{ minHeight }}
        >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#006948]" />

            <p className="text-sm font-medium text-slate-600">
                {message}
            </p>
        </div>
    );
}