import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { COLOR_PRIMARY } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Download, ExternalLink, File, FileText, Folder, Image as ImageIcon, LoaderCircle, Upload } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink?: string;
}

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
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'starting' | 'success' | 'error'>('idle');
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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
    }>({
        drive_id: selectedDrive?.id ?? '',
        folder_id: currentFolderId ?? '',
        file: null,
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

    const formatSize = (sizeInBytes?: string) => {
        if (!sizeInBytes) {
            return '-';
        }

        const bytes = Number(sizeInBytes);

        if (!Number.isFinite(bytes) || bytes < 0) {
            return '-';
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        const units = ['KB', 'MB', 'GB', 'TB'];
        let value = bytes / 1024;
        let unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex += 1;
        }

        return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
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

    const resetUploadForm = () => {
        clearErrors();
        reset('file');
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
            onSuccess: () => {
                setIsUploadDialogOpen(false);
                resetUploadForm();
            },
            onError: () => {
                setUploadStatus('error');
                setUploadMessage('Periksa file lalu coba lagi.');
            },
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
                                    setUploadStatus('idle');
                                    setUploadMessage(null);
                                    setData('drive_id', selectedDrive?.id ?? '');
                                    setData('folder_id', currentFolderId ?? '');
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
                                        <Input
                                            id="document-file"
                                            type="file"
                                            onChange={(event) => {
                                                const selectedFile = event.target.files?.[0] ?? null;
                                                setData('file', selectedFile);
                                            }}
                                            required
                                        />
                                        <InputError message={errors.file} />
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

                    {uploadStatus === 'error' && uploadMessage && !isUploadDialogOpen && (
                        <div className="mb-4">
                            <Alert variant="destructive">
                                <AlertTitle>Upload tidak tersedia</AlertTitle>
                                <AlertDescription>{uploadMessage}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {flash?.success && (
                        <div className="mb-4">
                            <Alert>
                                <AlertTitle>Upload selesai</AlertTitle>
                                <AlertDescription>{flash.success}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-4">
                            <Alert variant="destructive">
                                <AlertTitle>Terjadi kesalahan</AlertTitle>
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
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
