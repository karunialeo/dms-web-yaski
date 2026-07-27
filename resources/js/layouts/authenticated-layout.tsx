import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps) {
    return (
        <AppShell>
            <AppContent className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                {header ? <div className="shrink-0">{header}</div> : null}
                {children}
            </AppContent>
        </AppShell>
    );
}
