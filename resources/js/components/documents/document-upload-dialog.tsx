import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLOR_PRIMARY } from '@/lib/utils';
import type { DocumentUploadDialogProps } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { documentCategoryOptions, documentDepartmentOptions, documentStatusOptions } from './document-options';

export function DocumentUploadDialog({
    open,
    uploadStatus,
    uploadMessage,
    uploadOrigin,
    data,
    errors,
    processing,
    onOpenChange,
    onFileSelected,
    onFieldChange,
    onSubmit,
}: DocumentUploadDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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

                <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="document-file">File</Label>
                        {uploadOrigin === 'button' ? (
                            <Input
                                id="document-file"
                                type="file"
                                onChange={(event) => {
                                    const selectedFile = event.target.files?.[0] ?? null;
                                    onFileSelected(selectedFile);
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
                            onChange={(event) => onFieldChange('category', event.target.value)}
                            required
                        >
                            {documentCategoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="document-department">Department</Label>
                        <select
                            id="document-department"
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={data.department}
                            onChange={(event) => onFieldChange('department', event.target.value)}
                            required
                        >
                            {documentDepartmentOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.department} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="document-status">Status</Label>
                        <select
                            id="document-status"
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={data.status}
                            onChange={(event) => onFieldChange('status', event.target.value)}
                            required
                        >
                            {documentStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="document-expired-at">Tanggal Kedaluwarsa</Label>
                        <input
                            id="document-expired-at"
                            type="date"
                            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            value={data.expired_at}
                            onChange={(event) => onFieldChange('expired_at', event.target.value)}
                        />
                        <InputError message={errors.expired_at} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="document-pic-emails">Email PIC</Label>
                        <Input
                            id="document-pic-emails"
                            type="text"
                            value={data.pic_emails}
                            onChange={(event) => onFieldChange('pic_emails', event.target.value)}
                            placeholder="andi@kantor.com, budi@kantor.com"
                        />
                        <p className="text-muted-foreground text-xs">
                            Pisahkan dengan koma jika lebih dari satu email (contoh: andi@kantor.com, budi@kantor.com)
                        </p>
                        <InputError message={errors.pic_emails} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.file} className="text-white" style={{ backgroundColor: COLOR_PRIMARY }}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Upload
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
