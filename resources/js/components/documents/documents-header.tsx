import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { COLOR_PRIMARY } from '@/lib/utils';
import type { DocumentsHeaderProps } from '@/types';
import { Folder, Plus, Upload } from 'lucide-react';
import { documentCategoryOptions, documentDepartmentOptions } from './document-options';

export function DocumentsHeader({
    search,
    category,
    department,
    isDriveRootView,
    isGlobalSearchView,
    activeFolderName,
    canOpenUploadDialog,
    uploadDisabledMessage,
    onSearchChange,
    onCategoryChange,
    onDepartmentChange,
    onSubmitFilters,
    onOpenUploadDialog,
    onOpenCreateFolderDialog,
}: DocumentsHeaderProps) {
    return (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="shrink-0">
                    <h3 className="text-lg font-medium text-slate-700">Daftar Dokumen</h3>
                    <p className="text-sm text-slate-500">
                        {isGlobalSearchView ? (
                            <>
                                Hasil pencarian global untuk <span className="font-medium text-slate-700">{search || '-'}</span>
                            </>
                        ) : isDriveRootView ? (
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

                <form
                    className="flex flex-1 flex-col gap-3 xl:mx-6 xl:max-w-3xl xl:flex-row xl:items-center xl:justify-center"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmitFilters();
                    }}
                >
                    <Input
                        type="text"
                        placeholder="Cari dokumen..."
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="border-input h-10 rounded-md xl:flex-1"
                    />

                    <select
                        value={category}
                        onChange={(event) => onCategoryChange(event.target.value)}
                        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none xl:flex-1"
                    >
                        <option value="all">All Category</option>
                        {documentCategoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={department}
                        onChange={(event) => onDepartmentChange(event.target.value)}
                        className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none xl:flex-1"
                    >
                        <option value="all">All Department</option>
                        {documentDepartmentOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <Button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white xl:px-5"
                        style={{ backgroundColor: COLOR_PRIMARY }}
                    >
                        Cari
                    </Button>
                </form>

                <div className="flex shrink-0 justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                className="h-10 w-10 rounded-full text-white shadow-sm transition hover:opacity-90"
                                style={{ backgroundColor: COLOR_PRIMARY }}
                                title="Tambah"
                            >
                                <Plus className="h-5 w-5" />
                                <span className="sr-only">Tambah</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Tambah</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={onOpenUploadDialog} disabled={!canOpenUploadDialog}>
                                <Upload className="h-4 w-4" />
                                Upload dokumen
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={onOpenCreateFolderDialog} disabled={!canOpenUploadDialog}>
                                <Folder className="h-4 w-4" />
                                Tambah folder
                            </DropdownMenuItem>
                            {!canOpenUploadDialog && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs font-normal text-slate-500">{uploadDisabledMessage}</DropdownMenuLabel>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
