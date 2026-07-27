import AppLogoIcon from '@/components/app-logo-icon';
import { COLOR_PRIMARY } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-svh bg-white px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
                <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="hidden lg:block">
                        <p
                            className="mb-4 inline-flex rounded-full px-4 py-1 text-xs font-semibold tracking-[0.16em] uppercase"
                            style={{ backgroundColor: `${COLOR_PRIMARY}14`, color: COLOR_PRIMARY }}
                        >
                            Enterprise Document Control
                        </p>
                        <h1 className="mb-4 text-4xl leading-tight font-bold">
                            Selamat datang kembali di <br></br>
                            <span style={{ color: COLOR_PRIMARY }}>DMS YASKI</span>
                        </h1>
                        <p className="max-w-xl text-lg text-slate-600">
                            Kelola dokumen, akses informasi, dan lanjutkan pekerjaan Anda dengan pengalaman yang konsisten.
                        </p>
                    </div>

                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(42,113,147,0.35)]">
                        <div className="mb-8 flex flex-col items-center gap-4">
                            <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                                <AppLogoIcon className="h-11 w-11 object-contain" />
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-2 text-center">
                                <h2 className="text-2xl font-semibold">{title}</h2>
                                <p className="text-sm text-slate-600">{description}</p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
