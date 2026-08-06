import type { UseDocumentDragAndDropParams } from '@/types';
import { useEffect, useRef, useState } from 'react';

export function useDocumentDragAndDrop({
    canOpenUploadDialog,
    processing,
    uploadDisabledMessage,
    selectedDrive,
    onUploadBlocked,
    onFileDropped,
}: UseDocumentDragAndDropParams) {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragDepthRef = useRef(0);

    useEffect(() => {
        const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes('Files');

        const handleWindowDragEnter = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current += 1;

            if (!canOpenUploadDialog || processing) {
                return;
            }

            setIsDragOver(true);
        };

        const handleWindowDragOver = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = canOpenUploadDialog && !processing ? 'copy' : 'none';
            }
        };

        const handleWindowDragLeave = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

            if (dragDepthRef.current === 0) {
                setIsDragOver(false);
            }
        };

        const handleWindowDrop = (event: DragEvent) => {
            if (!hasFiles(event)) {
                return;
            }

            event.preventDefault();
            dragDepthRef.current = 0;
            setIsDragOver(false);

            if (!canOpenUploadDialog || processing || !selectedDrive) {
                onUploadBlocked(uploadDisabledMessage);
                return;
            }

            const droppedFile = event.dataTransfer?.files?.[0];

            if (!droppedFile) {
                onUploadBlocked('Tidak ada file yang terdeteksi dari drag-and-drop.');
                return;
            }

            onFileDropped(droppedFile);
        };

        window.addEventListener('dragenter', handleWindowDragEnter);
        window.addEventListener('dragover', handleWindowDragOver);
        window.addEventListener('dragleave', handleWindowDragLeave);
        window.addEventListener('drop', handleWindowDrop);

        return () => {
            window.removeEventListener('dragenter', handleWindowDragEnter);
            window.removeEventListener('dragover', handleWindowDragOver);
            window.removeEventListener('dragleave', handleWindowDragLeave);
            window.removeEventListener('drop', handleWindowDrop);
        };
    }, [canOpenUploadDialog, processing, uploadDisabledMessage, selectedDrive, onUploadBlocked, onFileDropped]);

    return {
        isDragOver,
        dragDepthRef,
    };
}
