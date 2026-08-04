import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { COLOR_PRIMARY, formatSize } from '@/lib/utils';
import { DriveFile, type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Download, ExternalLink, File, FileText, Folder, Image as ImageIcon, LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

interface FolderBreadcrumb {
    id: string;
    name: string;
}

interface SharedDrive {
    id: string;
    name: string;
}

interface IndexProps {
    sharedDrives?: SharedDrive[];
    selectedDrive?: SharedDrive | null;
    canUpload?: boolean;
    files: DriveFile[];
    folderBreadcrumbs?: FolderBreadcrumb[];
}

interface FlashMessage {
    success?: string;
    error?: string;
    uploaded_file_id?: string;
}

interface PageProps {
    flash?: FlashMessage;
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dokumen',
        href: '/documents',
    },
];

export default function Index({ sharedDrives = [], selectedDrive = null, canUpload = false, files, folderBreadcrumbs = [] }: IndexProps) {
    const { flash } = usePage<PageProps>().props;
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [filePendingDelete, setFilePendingDelete] = useState<DriveFile | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const dragDepthRef = useRef(0);
    const [uploadOrigin, setUploadOrigin] = useState<'button' | 'drag'>('button');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'starting' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null);

    const currentFolderId = useMemo(() => {
        if (folderBreadcrumbs.length === 0) {
            return null;
        }

        return folderBreadcrumbs[folderBreadcrumbs.length - 1].id;
    }, [folderBreadcrumbs]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        drive_id: string;
        folder_id: string;
        file: File | null;
        category: string;
        status: string;
    }>({
        drive_id: selectedDrive?.id ?? '',
        folder_id: currentFolderId ?? '',
        file: null,
        category: 'general',
        status: 'draft',
    });

    const {
        post: submitDelete,
        setData: setDeleteData,
        processing: deleteProcessing,
    } = useForm<{
        _method: 'delete';
        drive_id: string;
        folder_id: string;
    }>({
        _method: 'delete',
        drive_id: selectedDrive?.id ?? '',
        folder_id: currentFolderId ?? '',
    });

    const canOpenUploadDialog = Boolean(selectedDrive) && canUpload;
    const uploadDisabledMessage = !selectedDrive
        ? 'Pilih Shared Drive atau folder tujuan terlebih dahulu.'
        : 'Akun Anda tidak memiliki izin upload di folder ini.';
    // Fungsi buat format tanggal biar lebih enak dibaca
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getDownloadUrl = (file: DriveFile) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            return null;
        }

        if (!file.id) {
            return file.webContentLink ?? null;
        }

        if (!file.webContentLink) {
            return `https://drive.google.com/uc?export=download&id=${file.id}&authuser=0`;
        }

        try {
            const url = new URL(file.webContentLink);
            url.searchParams.set('authuser', '0');
            return url.toString();
        } catch {
            return file.webContentLink.replace(/([?&])authuser=\d+/u, '$1authuser=0');
        }
    };

    const activeFolderName = folderBreadcrumbs.length > 0 ? folderBreadcrumbs[folderBreadcrumbs.length - 1].name : selectedDrive?.name;
    const isDriveRootView = !selectedDrive;

    const getSuccessTitle = (message: string) => {
        const normalized = message.toLowerCase();

        if (normalized.includes('hapus')) {
            return 'Hapus selesai';
        }

        if (normalized.includes('upload')) {
            return 'Upload selesai';
        }

        return 'Berhasil';
    };

    const inlineAlert = useMemo(() => {
        if (uploadStatus === 'error' && uploadMessage && !isUploadDialogOpen) {
            return {
                key: `upload-error:${uploadMessage}`,
                title: 'Upload gagal',
                message: uploadMessage,
                variant: 'destructive' as const,
                className: '',
            };
        }

        if (uploadStatus === 'starting' && uploadMessage && !isUploadDialogOpen) {
            return {
                key: `upload-starting:${uploadMessage}`,
                title: 'Upload sedang berjalan',
                message: uploadMessage,
                variant: 'default' as const,
                className: '',
            };
        }

        if (flash?.error) {
            return {
                key: `flash-error:${flash.error}`,
                title: 'Terjadi kesalahan',
                message: flash.error,
                variant: 'destructive' as const,
                className: '',
            };
        }

        if (flash?.success) {
            return {
                key: `flash-success:${flash.success}`,
                title: getSuccessTitle(flash.success),
                message: flash.success,
                variant: 'default' as const,
                className: 'border-emerald-300 bg-emerald-50 text-emerald-800',
            };
        }

        if (uploadStatus === 'success' && uploadMessage && !isUploadDialogOpen) {
            return {
                key: `upload-success:${uploadMessage}`,
                title: 'Upload selesai',
                message: uploadMessage,
                variant: 'default' as const,
                className: 'border-emerald-300 bg-emerald-50 text-emerald-800',
            };
        }

        return null;
    }, [uploadStatus, uploadMessage, isUploadDialogOpen, flash?.error, flash?.success]);

    const canShowInlineAlert = inlineAlert !== null && inlineAlert.key !== dismissedAlertKey;

    const resetUploadForm = () => {
        clearErrors('file', 'category', 'status');
        reset('file', 'category', 'status');
    };

    const handleFileSelected = (selectedFile: File | null) => {
        setData('file', selectedFile);
        setUploadOrigin('button');
    };

    const submitUpload = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedDrive || !canUpload) {
            setUploadStatus('error');
            setUploadMessage(uploadDisabledMessage);
            return;
        }

        setUploadStatus('starting');
        setUploadMessage('File sedang diunggah ke Google Drive.');

        post(route('documents.upload'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const uploadedFileId = (page.props.flash as FlashMessage | undefined)?.uploaded_file_id;
                if (uploadedFileId) {
                    console.log('[Documents] Uploaded Google Drive file ID:', uploadedFileId);
                }

                setIsUploadDialogOpen(false);
                resetUploadForm();
                setUploadStatus('success');
                setUploadMessage('Upload selesai. File berhasil ditambahkan.');
            },
            onError: () => {
                setUploadStatus('error');
                setUploadMessage('Periksa file lalu coba lagi.');
            },
        });
    };

    useEffect(() => {
        const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes('Files');

        const handleWindowDragEnter = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current += 1;

            if (!canOpenUploadDialog || processing) {
                return;
            }

            setIsDragOver(true);
        };

        const handleWindowDragOver = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = canOpenUploadDialog && !processing ? 'copy' : 'none';
            }
        };

        const handleWindowDragLeave = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

            if (dragDepthRef.current === 0) {
                setIsDragOver(false);
            }
        };

        const handleWindowDrop = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = 0;
            setIsDragOver(false);

            if (!canOpenUploadDialog || processing) {
                setUploadStatus('error');
                setUploadMessage(uploadDisabledMessage);
                return;
            }

            const droppedFile = event.dataTransfer?.files?.[0];

            if (!droppedFile) {
                setUploadStatus('error');
                setUploadMessage('Tidak ada file yang terdeteksi dari drag-and-drop.');
                return;
            }

            setUploadOrigin('drag');
            setData('file', droppedFile);
            setUploadStatus('idle');
            setUploadMessage(null);
            setIsUploadDialogOpen(true);
        };

        window.addEventListener('dragenter', handleWindowDragEnter);
        window.addEventListener('dragover', handleWindowDragOver);
        window.addEventListener('dragleave', handleWindowDragLeave);
        window.addEventListener('drop', handleWindowDrop);

        return () => {
            window.removeEventListener('dragenter', handleWindowDragEnter);
            window.removeEventListener('dragover', handleWindowDragOver);
            window.removeEventListener('dragleave', handleWindowDragLeave);
            window.removeEventListener('drop', handleWindowDrop);
        };
    }, [canOpenUploadDialog, processing, uploadDisabledMessage, selectedDrive, currentFolderId, canUpload]);

    const confirmDelete = () => {
        if (!selectedDrive || !filePendingDelete) {
            return;
        }

        setDeleteData({
            _method: 'delete',
            drive_id: selectedDrive.id,
            folder_id: currentFolderId ?? '',
        });

        submitDelete(route('documents.destroy', { fileId: filePendingDelete.id }), {
            preserveScroll: true,
            onSuccess: () => setFilePendingDelete(null),
        });
    };

    // Fungsi nentuin icon berdasarkan tipe file
    const getFileIcon = (mimeType: string) => {
        if (mimeType === 'application/vnd.google-apps.folder') {
            return <Folder className="h-5 w-5 fill-sky-100 text-sky-500" />;
        }
        if (mimeType.includes('image/')) {
            return <ImageIcon className="h-5 w-5 text-emerald-500" />;
        }
        if (mimeType.includes('pdf')) {
            return <FileText className="h-5 w-5 text-rose-500" />;
        }
        return <File className="h-5 w-5 text-slate-400" />;
    };

    return (
        // <AuthenticatedLayout header={<h2 className="text-xl leading-tight font-semibold text-slate-800">Dokumen Shared Drive</h2>}>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumen" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header Action (Bisa buat nambah tombol Upload nanti) */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-slate-700">Daftar Dokumen</h3>
                            <p className="text-sm text-slate-500">
                                {isDriveRootView ? (
                                    <>
                                        Lokasi: <span className="font-medium text-slate-700">Root Shared Drives</span>
                                    </>
                                ) : (
                                    <>
                                        Folder aktif: <span className="font-medium text-slate-700">{activeFolderName}</span>
                                    </>
                                )}
                            </p>
                        </div>
                        {/* Tombol Upload (Placeholder) */}
                        <Dialog
                            open={isUploadDialogOpen}
                            onOpenChange={(open) => {
                                setIsUploadDialogOpen(open);

                                if (!open) {
                                    resetUploadForm();
                                } else {
                                    setUploadOrigin('button');
                                    setUploadStatus('idle');
                                    setUploadMessage(null);
                                    setData({
                                        drive_id: selectedDrive?.id ?? '',
                                        folder_id: currentFolderId ?? '',
                                        file: null,
                                        category: 'general',
                                        status: 'draft',
                                    });
                                }
                            }}
                        >
                            {canOpenUploadDialog ? (
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        className="inline-flex h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                                        style={{ backgroundColor: COLOR_PRIMARY }}
                                        title="Upload dokumen ke folder aktif"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Dokumen
                                    </Button>
                                </DialogTrigger>
                            ) : (
                                <Button
                                    type="button"
                                    aria-disabled="true"
                                    onClick={() => {
                                        setUploadStatus('error');
                                        setUploadMessage(uploadDisabledMessage);
                                    }}
                                    className="inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white opacity-50 shadow-sm transition"
                                    style={{ backgroundColor: COLOR_PRIMARY }}
                                    title={uploadDisabledMessage}
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload Dokumen
                                </Button>
                            )}

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Dokumen</DialogTitle>
                                    <DialogDescription>Pilih file yang ingin diunggah ke folder aktif.</DialogDescription>
                                </DialogHeader>

                                {uploadStatus === 'starting' && (
                                    <Alert>
                                        <AlertTitle>Upload dimulai</AlertTitle>
                                        <AlertDescription>{uploadMessage ?? 'File sedang diunggah ke Google Drive.'}</AlertDescription>
                                    </Alert>
                                )}

                                {uploadStatus === 'error' && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Upload gagal</AlertTitle>
                                        <AlertDescription>{uploadMessage ?? 'Periksa file lalu coba lagi.'}</AlertDescription>
                                    </Alert>
                                )}

                                <form className="space-y-4" onSubmit={submitUpload}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="document-file">File</Label>
                                        {uploadOrigin === 'button' ? (
                                            <Input
                                                id="document-file"
                                                type="file"
                                                onChange={(event) => {
                                                    const selectedFile = event.target.files?.[0] ?? null;
                                                    handleFileSelected(selectedFile);
                                                }}
                                                required
                                            />
                                        ) : (
                                            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                                                {data.file ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-slate-800">{data.file.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            File dari drag-and-drop sudah siap. Isi kategori dan status lalu upload.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p>File akan muncul di sini setelah di-drop.</p>
                                                )}
                                            </div>
                                        )}
                                        <InputError message={errors.file} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="document-category">Kategori</Label>
                                        <select
                                            id="document-category"
                                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            value={data.category}
                                            onChange={(event) => setData('category', event.target.value)}
                                            required
                                        >
                                            <option value="general">General</option>
                                            <option value="finance">Finance</option>
                                            <option value="hc">Human Capital</option>
                                            <option value="ict">ICT</option>
                                        </select>
                                        <InputError message={errors.category} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="document-status">Status</Label>
                                        <select
                                            id="document-status"
                                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            value={data.status}
                                            onChange={(event) => setData('status', event.target.value)}
                                            required
                                        >
                                            <option value="draft">draft</option>
                                            <option value="review">review</option>
                                            <option value="approved">approved</option>
                                        </select>
                                        <InputError message={errors.status} />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="secondary" onClick={() => setIsUploadDialogOpen(false)} disabled={processing}>
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.file}
                                            className="text-white"
                                            style={{ backgroundColor: COLOR_PRIMARY }}
                                        >
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Upload
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {canShowInlineAlert && inlineAlert && (
                        <div className="mb-4">
                            <Alert variant={inlineAlert.variant} className={inlineAlert.className}>
                                <button
                                    type="button"
                                    onClick={() => setDismissedAlertKey(inlineAlert.key)}
                                    className="absolute top-3 right-3 rounded-md p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
                                    aria-label="Tutup notifikasi"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <AlertTitle>{inlineAlert.title}</AlertTitle>
                                <AlertDescription>{inlineAlert.message}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <Dialog open={Boolean(filePendingDelete)} onOpenChange={(open) => !open && setFilePendingDelete(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Hapus file</DialogTitle>
                                <DialogDescription>
                                    {filePendingDelete
                                        ? `File ${filePendingDelete.name} akan dihapus dari Google Drive. Tindakan ini tidak dapat dibatalkan.`
                                        : 'Pilih file yang ingin dihapus.'}
                                </DialogDescription>
                            </DialogHeader>

                            <Alert variant="destructive">
                                <AlertTitle>Peringatan</AlertTitle>
                                <AlertDescription>Pastikan file yang dipilih memang ingin dihapus sebelum melanjutkan.</AlertDescription>
                            </Alert>

                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setFilePendingDelete(null)} disabled={deleteProcessing}>
                                    Batal
                                </Button>
                                <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteProcessing || !filePendingDelete}>
                                    {deleteProcessing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Hapus
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {isDragOver && (
                        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-sky-500/10 p-4">
                            <div className="w-full max-w-xl rounded-2xl border-2 border-dashed border-sky-500 bg-white/95 px-6 py-8 text-center shadow-xl backdrop-blur-sm">
                                <p className="text-base font-semibold text-slate-800">Lepaskan file untuk upload ke folder aktif</p>
                                <p className="mt-1 text-sm text-slate-500">Tujuan upload: {activeFolderName ?? 'Folder aktif'}</p>
                            </div>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {!isDriveRootView && selectedDrive && (
                            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-3 text-sm text-slate-600">
                                <Link href={route('documents.index')} className="font-medium hover:underline" style={{ color: COLOR_PRIMARY }}>
                                    Shared Drives
                                </Link>

                                <span className="text-slate-300">/</span>
                                {folderBreadcrumbs.length === 0 ? (
                                    <span className="font-semibold text-slate-800">{selectedDrive.name}</span>
                                ) : (
                                    <Link
                                        href={route('documents.index', { drive_id: selectedDrive.id })}
                                        className="font-medium hover:underline"
                                        style={{ color: COLOR_PRIMARY }}
                                    >
                                        {selectedDrive.name}
                                    </Link>
                                )}

                                {folderBreadcrumbs.map((folder, index) => {
                                    const isLast = index === folderBreadcrumbs.length - 1;

                                    return (
                                        <span key={folder.id} className="flex items-center gap-2">
                                            <span className="text-slate-300">/</span>
                                            {isLast ? (
                                                <span className="font-semibold text-slate-800">{folder.name}</span>
                                            ) : (
                                                <Link
                                                    href={route('documents.index', { drive_id: selectedDrive.id, folder_id: folder.id })}
                                                    className="font-medium hover:underline"
                                                    style={{ color: COLOR_PRIMARY }}
                                                >
                                                    {folder.name}
                                                </Link>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            {isDriveRootView ? 'Nama Shared Drive' : 'Nama Dokumen'}
                                        </th>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            {isDriveRootView ? 'Tipe' : 'Ukuran File'}
                                        </th>
                                        <th scope="col" className="px-6 py-4 font-medium">
                                            {isDriveRootView ? 'Aksi' : 'Terakhir Diubah'}
                                        </th>
                                        {!isDriveRootView && (
                                            <th scope="col" className="px-6 py-4 text-right font-medium">
                                                Aksi
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {isDriveRootView ? (
                                        sharedDrives.length > 0 ? (
                                            sharedDrives.map((drive) => (
                                                <tr key={drive.id} className="transition hover:bg-slate-50/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Folder className="h-5 w-5 fill-sky-100 text-sky-500" />
                                                            <Link
                                                                href={route('documents.index', { drive_id: drive.id })}
                                                                className="font-medium text-slate-800 hover:underline"
                                                                style={{ color: COLOR_PRIMARY }}
                                                            >
                                                                {drive.name}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">Shared Drive</td>
                                                    <td className="px-6 py-4 text-slate-500">
                                                        <Link
                                                            href={route('documents.index', { drive_id: drive.id })}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                                                            style={{ backgroundColor: COLOR_PRIMARY }}
                                                        >
                                                            Buka
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Folder className="h-10 w-10 text-slate-300" />
                                                        <p>Tidak ada Shared Drive yang dapat diakses.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    ) : files && files.length > 0 ? (
                                        files.map((file) => (
                                            <tr key={file.id} className="transition hover:bg-slate-50/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {getFileIcon(file.mimeType)}

                                                        {/* Kalo folder, bikin bisa diklik masuk ke dalemnya */}
                                                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                                            <Link
                                                                href={route('documents.index', { drive_id: selectedDrive?.id, folder_id: file.id })}
                                                                className="font-medium text-slate-800 hover:underline"
                                                                style={{ color: COLOR_PRIMARY }}
                                                            >
                                                                {file.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="font-medium text-slate-800">{file.name}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {file.mimeType === 'application/vnd.google-apps.folder' ? '-' : formatSize(file.size)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">{formatDate(file.modifiedTime)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Tombol Lihat/Preview */}
                                                        {file.webViewLink && (
                                                            <a
                                                                href={file.webViewLink}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                                Lihat
                                                            </a>
                                                        )}

                                                        {/* Tombol Download (Khusus File, bukan Folder) */}
                                                        {getDownloadUrl(file) && (
                                                            <a
                                                                href={getDownloadUrl(file) ?? undefined}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                                                                style={{ backgroundColor: COLOR_PRIMARY }}
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                                Unduh
                                                            </a>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={!file.canDelete || deleteProcessing}
                                                            title={
                                                                file.canDelete
                                                                    ? `Hapus ${file.name}`
                                                                    : 'Anda tidak memiliki izin untuk menghapus file ini.'
                                                            }
                                                            onClick={() => setFilePendingDelete(file)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Folder className="h-10 w-10 text-slate-300" />
                                                    <p>Folder ini kosong atau tidak ada dokumen ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* </AuthenticatedLayout> */}
        </AppLayout>
    );
}
