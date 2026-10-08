import { DocumentCreateFolderDialog } from '@/components/documents/document-create-folder-dialog';
import { DocumentDeleteDialog } from '@/components/documents/document-delete-dialog';
import { DocumentDetailDialog } from '@/components/documents/document-detail-dialog';
import { DocumentToast } from '@/components/documents/document-toast';
import { DocumentUploadDialog } from '@/components/documents/document-upload-dialog';
import { DocumentsHeader } from '@/components/documents/documents-header';
import { DocumentsTable } from '@/components/documents/documents-table';
import { useDocumentActions } from '@/hooks/use-document-actions';
import { useDocumentDragAndDrop } from '@/hooks/use-document-drag-and-drop';
import { useDocumentFilters } from '@/hooks/use-document-filters';
import { useDocumentToast } from '@/hooks/use-document-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DocumentsIndexProps, type DocumentsPageProps, type DriveFile } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dokumen',
        href: '/documents',
    },
];

export default function Index({
    sharedDrives = [],
    sharedFolders = [],
    selectedDrive = null,
    canUpload = false,
    files,
    folderBreadcrumbs = [],
    isGlobalSearch = false,
    filters,
}: DocumentsIndexProps) {
    const { flash } = usePage<DocumentsPageProps>().props;
    const [detailFile, setDetailFile] = useState<DriveFile | null>(null);

    const currentFolderId = useMemo(() => {
        if (folderBreadcrumbs.length === 0) {
            return null;
        }

        return folderBreadcrumbs[folderBreadcrumbs.length - 1].id;
    }, [folderBreadcrumbs]);

    const { search, setSearch, category, setCategory, department, setDepartment, applyFilters } = useDocumentFilters({
        filters,
        selectedDrive,
        currentFolderId,
    });

    const {
        canOpenUploadDialog,
        uploadDisabledMessage,
        isUploadDialogOpen,
        isCreateFolderDialogOpen,
        filePendingDelete,
        uploadOrigin,
        uploadStatus,
        uploadMessage,
        uploadForm,
        createFolderForm,
        deleteProcessing,
        openUploadDialog,
        openCreateFolderDialog,
        handleUploadDialogOpenChange,
        handleCreateFolderDialogOpenChange,
        handleDeleteDialogOpenChange,
        handleFileSelected,
        handleUploadFieldChange,
        handleCreateFolderNameChange,
        handleFilePendingDeleteChange,
        submitUpload,
        handleCreateFolder,
        confirmDelete,
        showUploadError,
    } = useDocumentActions({
        selectedDrive,
        canUpload,
        currentFolderId,
    });

    const activeFolderName = folderBreadcrumbs.length > 0 ? folderBreadcrumbs[folderBreadcrumbs.length - 1].name : selectedDrive?.name;
    const isDriveRootView = !selectedDrive && !isGlobalSearch;
    const isGlobalSearchView = !selectedDrive && isGlobalSearch;

    const { activeToast, dismissToast } = useDocumentToast({
        flash,
        isUploadDialogOpen,
        uploadStatus,
        uploadMessage,
    });

    const { isDragOver } = useDocumentDragAndDrop({
        canOpenUploadDialog,
        processing: uploadForm.processing,
        uploadDisabledMessage,
        selectedDrive,
        onUploadBlocked: showUploadError,
        onFileDropped: (file) => openUploadDialog('drag', file),
    });

    return (
        // <AuthenticatedLayout header={<h2 className="text-xl leading-tight font-semibold text-slate-800">Dokumen Shared Drive</h2>}>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumen" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <DocumentsHeader
                        search={search}
                        category={category}
                        department={department}
                        isDriveRootView={isDriveRootView}
                        isGlobalSearchView={isGlobalSearchView}
                        activeFolderName={activeFolderName}
                        canOpenUploadDialog={canOpenUploadDialog}
                        uploadDisabledMessage={uploadDisabledMessage}
                        onSearchChange={setSearch}
                        onCategoryChange={setCategory}
                        onDepartmentChange={setDepartment}
                        onSubmitFilters={applyFilters}
                        onOpenUploadDialog={() => openUploadDialog()}
                        onOpenCreateFolderDialog={openCreateFolderDialog}
                    />

                    <DocumentUploadDialog
                        open={isUploadDialogOpen}
                        uploadStatus={uploadStatus}
                        uploadMessage={uploadMessage}
                        uploadOrigin={uploadOrigin}
                        data={uploadForm.data}
                        errors={uploadForm.errors}
                        processing={uploadForm.processing}
                        onOpenChange={handleUploadDialogOpenChange}
                        onFileSelected={handleFileSelected}
                        onFieldChange={handleUploadFieldChange}
                        onSubmit={submitUpload}
                    />

                    <DocumentCreateFolderDialog
                        open={isCreateFolderDialogOpen}
                        data={createFolderForm.data}
                        errors={createFolderForm.errors}
                        processing={createFolderForm.processing}
                        onOpenChange={handleCreateFolderDialogOpenChange}
                        onFolderNameChange={handleCreateFolderNameChange}
                        onSubmit={handleCreateFolder}
                    />

                    <DocumentDeleteDialog
                        open={Boolean(filePendingDelete)}
                        filePendingDelete={filePendingDelete}
                        processing={deleteProcessing}
                        onOpenChange={handleDeleteDialogOpenChange}
                        onConfirm={confirmDelete}
                    />

                    <DocumentDetailDialog
                        open={Boolean(detailFile)}
                        file={detailFile}
                        processingDelete={deleteProcessing}
                        onOpenChange={(open) => {
                            if (!open) {
                                setDetailFile(null);
                            }
                        }}
                        onDelete={(file) => {
                            handleFilePendingDeleteChange(file);
                            setDetailFile(null);
                        }}
                    />

                    {isDragOver && (
                        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-sky-500/10 p-4">
                            <div className="w-full max-w-xl rounded-2xl border-2 border-dashed border-sky-500 bg-white/95 px-6 py-8 text-center shadow-xl backdrop-blur-sm">
                                <p className="text-base font-semibold text-slate-800">Lepaskan file untuk upload ke folder aktif</p>
                                <p className="mt-1 text-sm text-slate-500">Tujuan upload: {activeFolderName ?? 'Folder aktif'}</p>
                            </div>
                        </div>
                    )}

                    <DocumentToast toast={activeToast} onDismiss={dismissToast} />

                    <DocumentsTable
                        isDriveRootView={isDriveRootView}
                        isGlobalSearchView={isGlobalSearchView}
                        sharedDrives={sharedDrives}
                        sharedFolders={sharedFolders}
                        selectedDrive={selectedDrive}
                        folderBreadcrumbs={folderBreadcrumbs}
                        files={files}
                        deleteProcessing={deleteProcessing}
                        onDeleteSelect={handleFilePendingDeleteChange}
                        onOpenDetail={setDetailFile}
                    />
                </div>
            </div>
            {/* </AuthenticatedLayout> */}
        </AppLayout>
    );
}
