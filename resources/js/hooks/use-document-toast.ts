import type { DocumentToastNotification, UseDocumentToastParams } from '@/types';
import { useEffect, useMemo, useState } from 'react';

const getSuccessTitle = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes('hapus')) {
        return 'Hapus selesai';
    }

    if (normalized.includes('upload')) {
        return 'Upload selesai';
    }

    return 'Berhasil';
};

export function useDocumentToast({ flash, isUploadDialogOpen, uploadStatus, uploadMessage }: UseDocumentToastParams) {
    const [dismissedToastKey, setDismissedToastKey] = useState<string | null>(null);

    const toastNotification = useMemo<DocumentToastNotification | null>(() => {
        if (uploadStatus === 'error' && uploadMessage && !isUploadDialogOpen) {
            return {
                key: `upload-error:${uploadMessage}`,
                title: 'Upload gagal',
                message: uploadMessage,
                variant: 'destructive',
                className: '',
            };
        }

        if (uploadStatus === 'starting' && uploadMessage && !isUploadDialogOpen) {
            return {
                key: `upload-starting:${uploadMessage}`,
                title: 'Upload sedang berjalan',
                message: uploadMessage,
                variant: 'default',
                className: '',
            };
        }

        if (flash?.error) {
            return {
                key: `flash-error:${flash.error}`,
                title: 'Terjadi kesalahan',
                message: flash.error,
                variant: 'destructive',
                className: '',
            };
        }

        if (flash?.success) {
            return {
                key: `flash-success:${flash.success}`,
                title: getSuccessTitle(flash.success),
                message: flash.success,
                variant: 'default',
                className: 'border-emerald-300 bg-emerald-50 text-emerald-800',
            };
        }

        if (uploadStatus === 'success' && uploadMessage && !isUploadDialogOpen) {
            return {
                key: `upload-success:${uploadMessage}`,
                title: 'Upload selesai',
                message: uploadMessage,
                variant: 'default',
                className: 'border-emerald-300 bg-emerald-50 text-emerald-800',
            };
        }

        return null;
    }, [uploadStatus, uploadMessage, isUploadDialogOpen, flash?.error, flash?.success]);

    const activeToast = toastNotification !== null && toastNotification.key !== dismissedToastKey ? toastNotification : null;

    useEffect(() => {
        if (!activeToast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setDismissedToastKey(activeToast.key);
        }, 5000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [activeToast]);

    return {
        activeToast,
        dismissToast: setDismissedToastKey,
    };
}
