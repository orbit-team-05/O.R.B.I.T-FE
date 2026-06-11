import { Bell, CircleHelp, Search } from "lucide-react";

export function AdminTopbar() {
    return (
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="relative w-full max-w-[520px]">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                    type="text"
                    placeholder="Tìm kiếm hệ thống..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#006948] focus:bg-white focus:ring-2 focus:ring-[#006948]/10"
                />
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                >
                    <Bell size={20} />
                </button>

                <button
                    type="button"
                    className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
                >
                    <CircleHelp size={20} />
                </button>
            </div>
        </header>
    );
}