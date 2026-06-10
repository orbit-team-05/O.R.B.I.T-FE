import { Bell, CircleHelp, Plus, Search } from "lucide-react";

export function AdminTopbar() {
    return (
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="flex h-8 w-[55%] max-w-[480px] items-center gap-2 rounded-lg bg-slate-100 px-3">
                <Search size={16} className="text-slate-500" />

                <input
                    type="search"
                    placeholder="Tìm kiếm species..."
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="text-slate-700 transition hover:text-[#006948]"
                    aria-label="Thông báo"
                >
                    <Bell size={18} />
                </button>

                <button
                    type="button"
                    className="text-slate-700 transition hover:text-[#006948]"
                    aria-label="Trợ giúp"
                >
                    <CircleHelp size={18} />
                </button>

                <button
                    type="button"
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-[#006948] px-3 text-xs font-medium text-white hover:bg-[#00583d]"
                >
                    <Plus size={15} />
                    Thêm Species
                </button>
            </div>
        </header>
    );
}