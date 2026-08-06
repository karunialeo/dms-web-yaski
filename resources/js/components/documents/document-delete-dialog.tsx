import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { DocumentDeleteDialogProps } from '@/types';
import { LoaderCircle } from 'lucide-react';

export function DocumentDeleteDialog({ open, filePendingDelete, processing, onOpenChange, onConfirm }: DocumentDeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={processing}>
                        Batal
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm} disabled={processing || !filePendingDelete}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
