import { useState } from "react";

import { ConfirmDialog } from "../../../components/common/dialog/ConfirmDialog";
import { useToast } from "../../../components/common/toast/ToastProvider";
import { SpeciesDrawer } from "../../../features/admin/species/components/SpeciesDrawer";
import { SpeciesStats } from "../../../features/admin/species/components/SpeciesStats";
import { SpeciesTable } from "../../../features/admin/species/components/SpeciesTable";
import { useAdminSpecies } from "../../../features/admin/species/hooks/useAdminSpecies";

function AdminSpeciesHeader({ onCreate }) {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    Quản lý Species
                </h1>

                <p className="mt-1 text-sm text-slate-600">
                    Quản lý danh mục mặt hàng, loài nuôi trồng và đơn vị thị trường trong hệ thống
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#006948] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#00583d]"
            >
                + Thêm Species
            </button>
        </header>
    );
}

function AdminSpeciesSkeleton() {
    return (
        <section className="space-y-5">
            <AdminSpeciesHeader onCreate={() => {}} />

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                ))}
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-80 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="space-y-3 px-5 py-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-10 animate-pulse rounded bg-slate-100"
                        />
                    ))}
                </div>
            </section>
        </section>
    );
}

function ErrorState({ error, onRetry, onCreate }) {
    return (
        <section className="space-y-5">
            <AdminSpeciesHeader onCreate={onCreate} />

            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm font-medium text-red-700">
                    {error || "Đã xảy ra lỗi khi tải dữ liệu."}
                </p>

                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        </section>
    );
}

export function AdminSpeciesPage() {
    const toast = useToast();

    const {
        species,
        summary,
        pageInfo,
        error,
        setPage,
        reload,

        initialLoading,
        tableLoading,

        actionLoading,
        actionError,
        clearActionError,
        createSpecies,
        updateSpecies,
        toggleSpeciesStatus,
    } = useAdminSpecies();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [selectedSpecies, setSelectedSpecies] = useState(null);

    const [confirmState, setConfirmState] = useState({
        open: false,
        species: null,
    });

    function resetDrawerState() {
        setDrawerOpen(false);
        setDrawerMode("create");
        setSelectedSpecies(null);
    }

    function openCreateDrawer() {
        clearActionError();

        setDrawerMode("create");
        setSelectedSpecies(null);
        setDrawerOpen(true);
    }

    function openEditDrawer(item) {
        clearActionError();

        setDrawerMode("edit");
        setSelectedSpecies(item);
        setDrawerOpen(true);
    }

    function closeDrawer() {
        if (actionLoading) return;

        resetDrawerState();
        clearActionError();
    }

    async function handleSubmitSpecies(payload) {
        const isEdit =
            drawerMode === "edit" &&
            selectedSpecies;

        const success = isEdit
            ? await updateSpecies(
                  selectedSpecies.id,
                  payload,
              )
            : await createSpecies(payload);

        if (!success) {
            toast.error(
                isEdit
                    ? "Không thể cập nhật species."
                    : "Không thể thêm species.",
            );

            return;
        }

        toast.success(
            isEdit
                ? `Đã cập nhật species "${payload.name}".`
                : `Đã thêm species "${payload.name}".`,
        );

        closeDrawer();
    }

    function handleToggleStatus(item) {
        clearActionError();

        setConfirmState({
            open: true,
            species: item,
        });
    }

    function closeConfirmDialog() {
        if (actionLoading) return;

        setConfirmState({
            open: false,
            species: null,
        });

        clearActionError();
    }

    async function confirmToggleStatus() {
        const item = confirmState.species;

        if (!item) return;

        const isActive =
            item.isActive ?? item.active;

        const actionText = isActive
            ? "tắt"
            : "bật lại";

        const success =
            await toggleSpeciesStatus(item);

        if (!success) {
            toast.error(
                `Không thể ${actionText} species "${item.name}".`,
            );

            return;
        }

        toast.success(
            `Đã ${actionText} species "${item.name}".`,
        );

        closeConfirmDialog();
    }

    if (initialLoading) {
        return <AdminSpeciesSkeleton />;
    }

    if (error) {
        return (
            <ErrorState
                error={error}
                onRetry={reload}
                onCreate={openCreateDrawer}
            />
        );
    }

    const confirmSpecies =
        confirmState.species;

    const confirmSpeciesActive =
        confirmSpecies?.isActive ??
        confirmSpecies?.active;

    return (
        <>
            <section className="space-y-5">
                <AdminSpeciesHeader
                    onCreate={openCreateDrawer}
                />

                {actionError &&
                    !drawerOpen &&
                    !confirmState.open && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {actionError}
                        </div>
                    )}

                <SpeciesStats
                    summary={summary}
                />

                <SpeciesTable
                    species={species}
                    pageInfo={pageInfo}
                    loading={tableLoading}
                    onPageChange={setPage}
                    onEdit={openEditDrawer}
                    onToggleStatus={
                        handleToggleStatus
                    }
                />
            </section>

            <SpeciesDrawer
                open={drawerOpen}
                mode={drawerMode}
                species={selectedSpecies}
                submitting={actionLoading}
                error={actionError}
                onClose={closeDrawer}
                onSubmit={handleSubmitSpecies}
            />

            <ConfirmDialog
                open={confirmState.open}
                title={
                    confirmSpeciesActive
                        ? "Tắt Species"
                        : "Bật lại Species"
                }
                description={
                    confirmSpecies
                        ? `Bạn có chắc muốn ${
                              confirmSpeciesActive
                                  ? "tắt"
                                  : "bật lại"
                          } species "${
                              confirmSpecies.name
                          }" không?`
                        : ""
                }
                confirmText={
                    confirmSpeciesActive
                        ? "Tắt Species"
                        : "Bật lại"
                }
                cancelText="Hủy"
                variant={
                    confirmSpeciesActive
                        ? "danger"
                        : "success"
                }
                loading={actionLoading}
                onCancel={closeConfirmDialog}
                onConfirm={confirmToggleStatus}
            />
        </>
    );
}