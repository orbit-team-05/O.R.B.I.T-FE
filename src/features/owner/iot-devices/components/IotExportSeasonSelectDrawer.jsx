import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

function formatSeasonLabel(season) {
    if (!season) return "";

    const seasonCode = season.seasonCode ? `${season.seasonCode} - ` : "";
    const speciesName = season.speciesName ? ` (${season.speciesName})` : "";

    return `${seasonCode}${season.seasonName}${speciesName}`;
}

export function IotExportSeasonSelectDrawer({
                                                open,
                                                device,
                                                seasons = [],
                                                loading = false,
                                                submitting = false,
                                                onClose,
                                                onConfirm,
                                            }) {
    const [selectedSeasonId, setSelectedSeasonId] = useState("");

    const selectableSeasons = useMemo(() => {
        return seasons.filter(
            (season) =>
                season.status === "ACTIVE" ||
                season.status === "HARVESTING",
        );
    }, [seasons]);

    useEffect(() => {
        if (!open) {
            setSelectedSeasonId("");
            return;
        }

        if (selectableSeasons.length > 0) {
            setSelectedSeasonId(String(selectableSeasons[0].id));
        }
    }, [open, selectableSeasons]);

    if (!open) return null;

    function handleSubmit(event) {
        event.preventDefault();

        if (!selectedSeasonId) return;

        onConfirm?.(Number(selectedSeasonId));
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Đóng chọn mùa vụ"
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/20"
            />

            <aside className="absolute right-0 top-0 flex h-full w-[460px] flex-col border-l border-slate-200 bg-white shadow-xl">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Chọn mùa vụ để xuất vật tư
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Thiết bị sẽ xuất vật tư vào mùa vụ được chọn
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <X size={18} />
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col"
                >
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-medium uppercase text-slate-500">
                                Thiết bị
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                                {device?.deviceName || device?.deviceId || "Chưa có"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Mode hiện tại: {device?.workMode || "IDLE"}
                            </p>
                        </section>

                        <section>
                            <label className="text-sm font-medium text-slate-700">
                                Mùa vụ nhận chi phí xuất vật tư
                            </label>

                            <select
                                value={selectedSeasonId}
                                onChange={(event) => setSelectedSeasonId(event.target.value)}
                                disabled={loading || submitting || selectableSeasons.length === 0}
                                className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#006948]"
                            >
                                {selectableSeasons.length === 0 && (
                                    <option value="">
                                        Chưa có mùa vụ đang hoạt động
                                    </option>
                                )}

                                {selectableSeasons.map((season) => (
                                    <option
                                        key={season.id}
                                        value={season.id}
                                    >
                                        {formatSeasonLabel(season)}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-2 text-xs text-slate-500">
                                Chỉ chọn được mùa vụ có trạng thái ACTIVE hoặc HARVESTING.
                            </p>
                        </section>

                        <section className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            Sau khi xác nhận, hệ thống chỉ tạo lệnh chờ.
                            Thiết bị IoT phải poll và ACK thì trạng thái thật mới chuyển sang xuất vật tư.
                        </section>
                    </div>

                    <footer className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                loading ||
                                !selectedSeasonId ||
                                selectableSeasons.length === 0
                            }
                            className="h-9 rounded-lg bg-[#006948] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Đang gửi..." : "Bắt đầu xuất"}
                        </button>
                    </footer>
                </form>
            </aside>
        </div>
    );
}