import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { DocumentToastProps } from '@/types';
import { X } from 'lucide-react';

export function DocumentToast({ toast, onDismiss }: DocumentToastProps) {
    if (!toast) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 bottom-4 z-50 w-full max-w-sm">
            <Alert variant={toast.variant} className={`pointer-events-auto shadow-xl ${toast.className}`}>
                <button
                    type="button"
                    onClick={() => onDismiss(toast.key)}
                    className="absolute top-3 right-3 rounded-md p-1 text-current/70 transition hover:bg-black/5 hover:text-current"
                    aria-label="Tutup notifikasi"
                >
                    <X className="h-4 w-4" />
                </button>
                <AlertTitle>{toast.title}</AlertTitle>
                <AlertDescription>{toast.message}</AlertDescription>
            </Alert>
        </div>
    );
}
