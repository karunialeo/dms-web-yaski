import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DashboardPageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ExternalLink, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, expiringDocs, recentDocs }: DashboardPageProps) {
    const [keyword, setKeyword] = useState('');

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const searchKeyword = keyword.trim();

        router.get(route('documents.index'), searchKeyword ? { search: searchKeyword } : {}, {
            preserveScroll: true,
        });
    };

    const formatDate = (value: string | null) => {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatCategoryDepartment = (category: string | null, department: string | null) => {
        const categoryText = category && category.trim() !== '' ? category : 'Tanpa Kategori';
        const departmentText = department && department.trim() !== '' ? department : 'Tanpa Departemen';

        return `${categoryText} (${departmentText})`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-3">
                        <div className="relative w-full">
                            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Cari dokumen lalu tekan Enter"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-3 pl-9 text-sm text-slate-700 transition outline-none focus:border-slate-300 focus:bg-white"
                            />
                        </div>
                    </form>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase">Total Dokumen</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.totalDocuments}</p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.08em] text-amber-700 uppercase">Pending Review</p>
                        <p className="mt-3 text-3xl font-semibold text-amber-900">{stats.pendingReview}</p>
                    </div>

                    <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm">
                        <p className="text-xs font-semibold tracking-[0.08em] text-rose-700 uppercase">Dokumen Kedaluwarsa</p>
                        <p className="mt-3 text-3xl font-semibold text-rose-900">{stats.expiredDocuments}</p>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-slate-900">Dokumen Segera Kedaluwarsa</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">File Name</th>
                                        <th className="px-5 py-3 font-semibold">Kategori (Departemen)</th>
                                        <th className="px-5 py-3 font-semibold">Expiry Date</th>
                                        <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expiringDocs.length === 0 ? (
                                        <tr>
                                            <td className="px-5 py-5 text-slate-500" colSpan={4}>
                                                Tidak ada dokumen yang akan kedaluwarsa.
                                            </td>
                                        </tr>
                                    ) : (
                                        expiringDocs.map((doc) => (
                                            <tr key={doc.id} className="border-t border-slate-100">
                                                <td className="px-5 py-4 font-medium text-slate-800">{doc.fileName}</td>
                                                <td className="px-5 py-4 text-slate-600">{formatCategoryDepartment(doc.category, doc.department)}</td>
                                                <td className="px-5 py-4 text-slate-600">{formatDate(doc.expired_at)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    {doc.webViewLink ? (
                                                        <a
                                                            href={doc.webViewLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            Lihat
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Tidak tersedia</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-base font-semibold text-slate-900">Upload Terbaru</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead className="bg-slate-50 text-left text-xs tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">File Name</th>
                                        <th className="px-5 py-3 font-semibold">Kategori (Departemen)</th>
                                        <th className="px-5 py-3 font-semibold">Upload Date</th>
                                        <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentDocs.length === 0 ? (
                                        <tr>
                                            <td className="px-5 py-5 text-slate-500" colSpan={4}>
                                                Belum ada upload terbaru.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentDocs.map((doc) => (
                                            <tr key={doc.id} className="border-t border-slate-100">
                                                <td className="px-5 py-4 font-medium text-slate-800">{doc.fileName}</td>
                                                <td className="px-5 py-4 text-slate-600">{formatCategoryDepartment(doc.category, doc.department)}</td>
                                                <td className="px-5 py-4 text-slate-600">{formatDate(doc.created_at)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    {doc.webViewLink ? (
                                                        <a
                                                            href={doc.webViewLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            Lihat
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Tidak tersedia</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
