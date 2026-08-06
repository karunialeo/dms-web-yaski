import type { DocumentOption } from '@/types';

export const documentCategoryOptions: DocumentOption[] = [
    { value: 'legalitas_perizinan', label: 'Legalitas & Perizinan' },
    { value: 'persuratan_administrasi', label: 'Persuratan & Administrasi' },
    { value: 'kepegawaian_hrd', label: 'Kepegawaian (HRD)' },
    { value: 'keuangan_pajak', label: 'Keuangan & Pajak' },
    { value: 'penyiaran_operasional', label: 'Penyiaran & Operasional' },
    { value: 'program_proposal', label: 'Program & Proposal' },
    { value: 'aset_fasilitas', label: 'Aset & Fasilitas' },
];

export const documentDepartmentOptions: DocumentOption[] = [
    { value: 'general', label: 'General' },
    { value: 'finance', label: 'Finance' },
    { value: 'ict', label: 'ICT' },
    { value: 'hc', label: 'HC' },
];

export const documentStatusOptions: DocumentOption[] = [
    { value: 'draft', label: 'draft' },
    { value: 'review', label: 'review' },
    { value: 'approved', label: 'approved' },
];
