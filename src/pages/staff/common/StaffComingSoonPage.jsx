import { Construction } from "lucide-react";
import { OwnerPageHeader } from "../../owner/common/OwnerPageHeader";

export function StaffComingSoonPage({ title, description }) {
    return (
        <section className="space-y-5 animate-fade-in">
            <OwnerPageHeader title={title} description={description} />
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
                <Construction size={34} className="text-amber-500" />
                <h2 className="mt-4 text-lg font-semibold text-slate-900">Đang chuẩn bị luồng này</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">API contract đã được ghi nhận; màn hình sẽ được hoàn thiện theo từng feature tiếp theo.</p>
            </div>
        </section>
    );
}
