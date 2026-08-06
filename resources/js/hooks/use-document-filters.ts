import type { UseDocumentFiltersParams } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export function useDocumentFilters({ filters, selectedDrive, currentFolderId }: UseDocumentFiltersParams) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [category, setCategory] = useState(filters?.category ?? 'all');
    const [department, setDepartment] = useState(filters?.department ?? 'all');

    const applyFilters = () => {
        router.get(
            route('documents.index'),
            {
                drive_id: selectedDrive?.id,
                folder_id: currentFolderId ?? undefined,
                search: search || undefined,
                category: category === 'all' ? undefined : category,
                department: department === 'all' ? undefined : department,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return {
        search,
        setSearch,
        category,
        setCategory,
        department,
        setDepartment,
        applyFilters,
    };
}
