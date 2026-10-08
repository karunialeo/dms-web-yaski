import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COLOR_PRIMARY } from '@/lib/utils';
import type { DocumentOption, DriveFile } from '@/types';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { type FormEvent } from 'react';
import { documentCategoryOptions, documentDepartmentOptions, documentStatusOptions } from './document-options';

const fieldClassName =
    'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

interface DocumentMetadataEditFormProps {
    file: DriveFile;
    onCancel: () => void;
    onSaved: () => void;
}

interface SelectFieldProps {
    id: string;
    label: string;
    value: string;
    options: DocumentOption[];
    error?: string;
    onChange: (value: string) => void;
}

function SelectField({ id, label, value, options, error, onChange }: SelectFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <select id={id} className={fieldClassName} value={value} onChange={(event) => onChange(event.target.value)} required>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <InputError message={error} />
        </div>
    );
}

export function DocumentMetadataEditForm({ file, onCancel, onSaved }: DocumentMetadataEditFormProps) {
    const metadata = file.metadata;

    const { data, setData, put, processing, errors } = useForm({
        category: metadata?.category ?? documentCategoryOptions[0].value,
        department: metadata?.department ?? documentDepartmentOptions[0].value,
        status: metadata?.status ?? documentStatusOptions[0].value,
        issue_at: metadata?.issue_at ?? '',
        expired_at: metadata?.expired_at ?? '',
        pic_emails: metadata?.pic_emails?.join(', ') ?? '',
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        put(route('documents.metadata.update', { fileId: file.id }), {
            preserveScroll: true,
            onSuccess: onSaved,
        });
    };

    return (
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="-mx-6 max-h-[60vh] space-y-4 overflow-y-auto px-6 py-1">
                <SelectField
                    id="edit-category"
                    label="Kategori"
                    value={data.category}
                    options={documentCategoryOptions}
                    error={errors.category}
                    onChange={(value) => setData('category', value)}
                />
                <SelectField
                    id="edit-department"
                    label="Department"
                    value={data.department}
                    options={documentDepartmentOptions}
                    error={errors.department}
                    onChange={(value) => setData('department', value)}
                />
                <SelectField
                    id="edit-status"
                    label="Status"
                    value={data.status}
                    options={documentStatusOptions}
                    error={errors.status}
                    onChange={(value) => setData('status', value)}
                />

                <div className="grid gap-2">
                    <Label htmlFor="edit-issue-at">Tanggal Diterbitkan</Label>
                    <input
                        id="edit-issue-at"
                        type="date"
                        className={fieldClassName}
                        value={data.issue_at}
                        onChange={(event) => setData('issue_at', event.target.value)}
                    />
                    <InputError message={errors.issue_at} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="edit-expired-at">Tanggal Kedaluwarsa</Label>
                    <input
                        id="edit-expired-at"
                        type="date"
                        className={fieldClassName}
                        value={data.expired_at}
                        onChange={(event) => setData('expired_at', event.target.value)}
                    />
                    <InputError message={errors.expired_at} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="edit-pic-emails">Email PIC</Label>
                    <Input
                        id="edit-pic-emails"
                        type="text"
                        value={data.pic_emails}
                        onChange={(event) => setData('pic_emails', event.target.value)}
                        placeholder="andi@kantor.com, budi@kantor.com"
                    />
                    <p className="text-muted-foreground text-xs">Pisahkan dengan koma jika lebih dari satu email.</p>
                    <InputError message={errors.pic_emails} />
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={processing}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing} className="text-white" style={{ backgroundColor: COLOR_PRIMARY }}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Simpan
                </Button>
            </DialogFooter>
        </form>
    );
}
