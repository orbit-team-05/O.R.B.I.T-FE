const STATS = [
    {
        key: "totalNeedReview",
        label: "Cần duyệt",
        helper: "Tổng giao dịch đang chờ hậu kiểm",
    },
    {
        key: "unrecognized",
        label: "Không nhận diện",
        helper: "AI/QR không xác định được sản phẩm",
    },
    {
        key: "lowConfidence",
        label: "Độ tin cậy thấp",
        helper: "Kết quả cần owner xác nhận",
    },
    {
        key: "pending",
        label: "Đang chờ",
        helper: "Giao dịch chưa hoàn tất xử lý",
    },
];

export function OwnerAiReviewStats({ summary }) {
    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STATS.map((item) => (
                <div
                    key={item.key}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {summary?.[item.key] ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {item.helper}
                    </p>
                </div>
            ))}
        </section>
    );
}