import { GOOGLE_ICON_PATHS } from '@/lib/assets';
import { COLOR_PRIMARY } from '@/lib/utils';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { errors: pageErrors } = usePage<{ errors: Record<string, string> }>().props;

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const emailError = errors.email || pageErrors?.email;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Masuk ke DMS YASKI" description="Masukkan email dan kata sandi Anda di bawah untuk masuk">
            <Head title="Masuk" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3.5 shadow-sm focus:border-[color:var(--primary)]"
                            style={{ ['--primary' as string]: COLOR_PRIMARY }}
                        />
                        <InputError message={emailError} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                                Password
                            </Label>
                            {/* {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )} */}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 px-3.5 shadow-sm focus:border-[color:var(--primary)]"
                            style={{ ['--primary' as string]: COLOR_PRIMARY }}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="border-slate-300 data-[state=checked]:border-[color:var(--primary)] data-[state=checked]:bg-[color:var(--primary)]"
                                style={{ ['--primary' as string]: COLOR_PRIMARY }}
                            />
                            <Label htmlFor="remember" className="text-sm text-slate-700">
                                Ingat saya
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="mt-2 h-11 w-full rounded-xl text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        tabIndex={4}
                        disabled={processing}
                        style={{ backgroundColor: COLOR_PRIMARY }}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>

                    <div className="relative my-1">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs tracking-[0.2em] text-slate-400 uppercase">
                            <span className="bg-white px-3">atau</span>
                        </div>
                    </div>

                    <a
                        href={route('auth.google.redirect')}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                            {GOOGLE_ICON_PATHS.map(({ fill, d }) => (
                                <path key={fill} fill={fill} d={d} />
                            ))}
                        </svg>
                        Masuk dengan Google
                    </a>
                </div>

                {/* <div className="pt-2 text-center text-sm text-slate-600">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Daftar
                    </TextLink>
                </div> */}
            </form>

            {status && <div className="mt-4 text-center text-sm font-medium text-emerald-600">{status}</div>}
        </AuthLayout>
    );
}
