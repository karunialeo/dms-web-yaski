import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLOR_PRIMARY } from '@/lib/utils';
import type { DocumentCreateFolderDialogProps } from '@/types';
import { LoaderCircle } from 'lucide-react';

export function DocumentCreateFolderDialog({
    open,
    data,
    errors,
    processing,
    onOpenChange,
    onFolderNameChange,
    onSubmit,
}: DocumentCreateFolderDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Folder</DialogTitle>
                    <DialogDescription>Buat folder baru di lokasi aktif.</DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="folder-name">Nama folder</Label>
                        <Input
                            id="folder-name"
                            type="text"
                            value={data.folder_name}
                            onChange={(event) => onFolderNameChange(event.target.value)}
                            placeholder="Contoh: Dokumen Kontrak"
                            required
                        />
                        <InputError message={errors.folder_name} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={processing}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || data.folder_name.trim() === ''}
                            className="text-white"
                            style={{ backgroundColor: COLOR_PRIMARY }}
                        >
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Tambah folder
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
