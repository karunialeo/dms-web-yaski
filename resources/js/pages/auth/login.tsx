import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { GOOGLE_ICON_PATHS } from '@/lib/assets';
import { COLOR_PRIMARY } from '@/lib/utils';
import { Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    return (
        <AuthLayout title="Masuk ke DMS YASKI" description="Akses aplikasi hanya melalui akun Google organisasi Anda.">
            <Head title="Masuk" />

            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-slate-600">Gunakan Single Sign-On Google untuk melanjutkan ke sistem dokumen.</p>

                <Button
                    asChild
                    className="h-12 w-full rounded-xl text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: COLOR_PRIMARY }}
                >
                    <a href={route('auth.google.redirect')}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                            {GOOGLE_ICON_PATHS.map(({ fill, d }) => (
                                <path key={fill} fill={fill} d={d} />
                            ))}
                        </svg>
                        Login with Google
                    </a>
                </Button>
            </div>

            {status && <div className="mt-4 text-center text-sm font-medium text-emerald-600">{status}</div>}
        </AuthLayout>
    );
}
