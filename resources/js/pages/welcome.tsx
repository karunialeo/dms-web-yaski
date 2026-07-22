import { COLOR_PRIMARY } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="YASKI - Document Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|lora:500,600,700" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white text-slate-800">
                <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-10">
                    <header className="mb-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                                style={{ backgroundColor: COLOR_PRIMARY }}
                            >
                                Y
                            </span>
                            <div>
                                <p className="font-semibold tracking-wide">YASKI</p>
                                <p className="text-xs text-slate-500">Document Management System</p>
                            </div>
                        </div>

                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                    style={{ backgroundColor: COLOR_PRIMARY }}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-full border px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        style={{ borderColor: `${COLOR_PRIMARY}55` }}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
                                        style={{ backgroundColor: COLOR_PRIMARY }}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex flex-1 items-center justify-center pb-8">
                        <section className="w-full max-w-3xl text-center">
                            <p
                                className="mb-4 inline-flex rounded-full px-4 py-1 text-xs font-semibold tracking-[0.16em] uppercase"
                                style={{ backgroundColor: `${COLOR_PRIMARY}14`, color: COLOR_PRIMARY }}
                            >
                                Enterprise Document Control
                            </p>

                            <h1 className="mb-10 text-4xl leading-tight md:text-6xl" style={{ fontFamily: 'Lora, serif' }}>
                                YASKI
                                <br />
                                <span style={{ color: COLOR_PRIMARY, fontSize: '2.5rem' }}> Document Management System</span>
                            </h1>

                            {/* {!auth.user && (
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
                                    <Link
                                        href={route('login')}
                                        className="rounded-full border px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                        style={{ borderColor: `${COLOR_PRIMARY}55` }}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                                        style={{ backgroundColor: COLOR_PRIMARY }}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )} */}
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
