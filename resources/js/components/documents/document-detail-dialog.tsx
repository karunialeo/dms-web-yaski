import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { COLOR_PRIMARY } from '@/lib/utils';
import type { DocumentDetailDialogProps } from '@/types';
import { Download, ExternalLink, Trash2 } from 'lucide-react';
import { documentCategoryOptions, documentDepartmentOptions, documentStatusOptions } from './document-options';

const toReadableValue = (value: string | null | undefined) => {
    if (!value) {
        return '-';
    }

    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const getOptionLabel = (value: string | null | undefined, options: Array<{ value: string; label: string }>) => {
    if (!value) {
        return '-';
    }

    return options.find((option) => option.value === value)?.label ?? toReadableValue(value);
};

const formatDate = (value: string | null | undefined) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const getDownloadUrl = (fileId: string, webContentLink?: string) => {
    if (!webContentLink) {
        return `https://drive.google.com/uc?export=download&id=${fileId}&authuser=0`;
    }

    try {
        const url = new URL(webContentLink);
        url.searchParams.set('authuser', '0');
        return url.toString();
    } catch {
        return webContentLink.replace(/([?&])authuser=\d+/u, '$1authuser=0');
    }
};

export function DocumentDetailDialog({ open, file, processingDelete, onOpenChange, onDelete }: DocumentDetailDialogProps) {
    const metadata = file?.metadata;
    const picEmails = metadata?.pic_emails?.length ? metadata.pic_emails.join(', ') : '-';
    const canDownload = Boolean(file && file.mimeType !== 'application/vnd.google-apps.folder');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Detail Dokumen</DialogTitle>
                    <DialogDescription>{file?.name ?? 'Metadata dokumen'}</DialogDescription>
                </DialogHeader>

                {file && (
                    <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="font-medium text-slate-600">Kategori</span>
                            <span className="text-slate-800">{getOptionLabel(metadata?.category, documentCategoryOptions)}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="font-medium text-slate-600">Department</span>
                            <span className="text-slate-800">{getOptionLabel(metadata?.department, documentDepartmentOptions)}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="font-medium text-slate-600">Status</span>
                            <span className="text-slate-800">{getOptionLabel(metadata?.status, documentStatusOptions)}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="font-medium text-slate-600">Tanggal Diterbitkan</span>
                            <span className="text-slate-800">{formatDate(metadata?.issue_at)}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="font-medium text-slate-600">Tanggal Kedaluwarsa</span>
                            <span className="text-slate-800">{formatDate(metadata?.expired_at)}</span>
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <span className="font-medium text-slate-600">Email PIC</span>
                            <span className="text-slate-800">{picEmails}</span>
                        </div>
                    </div>
                )}

                <DialogFooter className="sm:justify-between">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    <div className="flex items-center gap-2">
                        {file?.webViewLink && (
                            <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Lihat
                            </a>
                        )}

                        {file && canDownload && (
                            <a
                                href={getDownloadUrl(file.id, file.webContentLink)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white transition hover:opacity-90"
                                style={{ backgroundColor: COLOR_PRIMARY }}
                            >
                                <Download className="h-4 w-4" />
                                Unduh
                            </a>
                        )}

                        {file && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={!file.canDelete || processingDelete}
                                title={file.canDelete ? `Hapus ${file.name}` : 'Anda tidak memiliki izin untuk menghapus file ini.'}
                                onClick={() => onDelete(file)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
