export function AdminComingSoonPage({
                                        title = "Tính năng đang phát triển",
                                        description = "Màn hình này đang được xây dựng và sẽ được cập nhật trong giai đoạn tiếp theo.",
                                    }) {
    return (
        <section className="flex min-h-[calc(100vh-140px)] items-center justify-center">
            <div className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-[#006948]">
                    🚧
                </div>

                <h1 className="mt-5 text-2xl font-semibold text-slate-900">
                    {title}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
                    Sẽ được triển khai sau
                </div>
            </div>
        </section>
    );
}