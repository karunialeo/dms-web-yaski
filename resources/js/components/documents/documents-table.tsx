import { Button } from '@/components/ui/button';
import { COLOR_PRIMARY, formatSize } from '@/lib/utils';
import type { DocumentsTableProps, DriveFile } from '@/types';
import { Link } from '@inertiajs/react';
import { Download, ExternalLink, File, FileText, Folder, Image as ImageIcon, Trash2 } from 'lucide-react';

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

export function DocumentsTable({
    isDriveRootView,
    isGlobalSearchView,
    sharedDrives,
    selectedDrive,
    folderBreadcrumbs,
    files,
    deleteProcessing,
    onDeleteSelect,
}: DocumentsTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {!isDriveRootView && !isGlobalSearchView && selectedDrive && (
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
                        ) : files.length > 0 ? (
                            files.map((file) => (
                                <tr key={file.id} className="transition hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(file.mimeType)}
                                            {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                                <Link
                                                    href={route('documents.index', {
                                                        drive_id: selectedDrive?.id ?? file.driveId,
                                                        folder_id: file.id,
                                                    })}
                                                    className="font-medium text-slate-800 hover:underline"
                                                    style={{ color: COLOR_PRIMARY }}
                                                >
                                                    {file.name}
                                                </Link>
                                            ) : (
                                                <div>
                                                    <span className="font-medium text-slate-800">{file.name}</span>
                                                    {isGlobalSearchView && file.driveId && (
                                                        <p className="mt-1 text-xs text-slate-500">Shared Drive ID: {file.driveId}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {file.mimeType === 'application/vnd.google-apps.folder' ? '-' : formatSize(file.size)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{formatDate(file.modifiedTime)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
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
                                                title={file.canDelete ? `Hapus ${file.name}` : 'Anda tidak memiliki izin untuk menghapus file ini.'}
                                                onClick={() => onDeleteSelect(file)}
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
    );
}
