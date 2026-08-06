import type {
    DocumentCreateFolderFormData,
    DocumentDeleteFormData,
    DocumentUploadField,
    DocumentUploadFormData,
    DocumentUploadOrigin,
    DocumentUploadStatus,
    DriveFile,
    FlashMessage,
    UseDocumentActionsParams,
} from '@/types';
import { useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

const defaultUploadValues = {
    category: 'legalitas_perizinan',
    department: 'general',
    status: 'draft',
    issue_at: '',
    expired_at: '',
    pic_emails: '',
} satisfies Pick<DocumentUploadFormData, 'category' | 'department' | 'status' | 'issue_at' | 'expired_at' | 'pic_emails'>;

export function useDocumentActions({ selectedDrive, canUpload, currentFolderId }: UseDocumentActionsParams) {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
    const [filePendingDelete, setFilePendingDelete] = useState<DriveFile | null>(null);
    const [uploadOrigin, setUploadOrigin] = useState<DocumentUploadOrigin>('button');
    const [uploadStatus, setUploadStatus] = useState<DocumentUploadStatus>('idle');
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<DocumentUploadFormData>({
        drive_id: selectedDrive?.id ?? '',
        folder_id: currentFolderId ?? '',
        file: null,
        ...defaultUploadValues,
    });

    const {
        data: createFolderData,
        setData: setCreateFolderData,
        post: submitCreateFolder,
        processing: createFolderProcessing,
        errors: createFolderErrors,
        reset: resetCreateFolder,
        clearErrors: clearCreateFolderErrors,
    } = useForm<DocumentCreateFolderFormData>({
        drive_id: selectedDrive?.id ?? '',
        folder_id: currentFolderId ?? '',
        folder_name: '',
    });

    const {
        post: submitDelete,
        setData: setDeleteData,
        processing: deleteProcessing,
    } = useForm<DocumentDeleteFormData>({
        _method: 'delete',
        drive_id: selectedDrive?.id ?? '',
        folder_id: currentFolderId ?? '',
    });

    const canOpenUploadDialog = Boolean(selectedDrive) && canUpload;
    const uploadDisabledMessage = !selectedDrive
        ? 'Pilih Shared Drive atau folder tujuan terlebih dahulu.'
        : 'Akun Anda tidak memiliki izin upload di folder ini.';

    const resetUploadForm = () => {
        clearErrors('file', 'category', 'department', 'status', 'issue_at', 'expired_at', 'pic_emails');
        reset('file', 'category', 'department', 'status', 'issue_at', 'expired_at', 'pic_emails');
    };

    const handleUploadDialogOpenChange = (open: boolean) => {
        setIsUploadDialogOpen(open);

        if (!open) {
            resetUploadForm();
        }
    };

    const resetCreateFolderForm = () => {
        clearCreateFolderErrors('folder_name');
        resetCreateFolder('folder_name');
    };

    const handleCreateFolderDialogOpenChange = (open: boolean) => {
        setIsCreateFolderDialogOpen(open);

        if (!open) {
            resetCreateFolderForm();
        }
    };

    const showUploadError = (message: string) => {
        setUploadStatus('error');
        setUploadMessage(message);
    };

    const openUploadDialog = (origin: DocumentUploadOrigin = 'button', selectedFile: File | null = null) => {
        if (!selectedDrive || !canUpload) {
            showUploadError(uploadDisabledMessage);
            return;
        }

        setUploadOrigin(origin);
        setUploadStatus('idle');
        setUploadMessage(null);
        clearErrors('file', 'category', 'department', 'status', 'issue_at', 'expired_at', 'pic_emails');
        setData({
            drive_id: selectedDrive.id,
            folder_id: currentFolderId ?? '',
            file: selectedFile,
            ...defaultUploadValues,
        });
        setIsUploadDialogOpen(true);
    };

    const openCreateFolderDialog = () => {
        if (!selectedDrive || !canUpload) {
            showUploadError(uploadDisabledMessage);
            return;
        }

        clearCreateFolderErrors('folder_name');
        setCreateFolderData({
            drive_id: selectedDrive.id,
            folder_id: currentFolderId ?? '',
            folder_name: '',
        });
        setIsCreateFolderDialogOpen(true);
    };

    const handleFileSelected = (selectedFile: File | null) => {
        setData('file', selectedFile);
        setUploadOrigin('button');
    };

    const handleUploadFieldChange = (field: DocumentUploadField, value: string) => {
        setData(field, value);
    };

    const submitUpload = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedDrive || !canUpload) {
            showUploadError(uploadDisabledMessage);
            return;
        }

        setUploadStatus('starting');
        setUploadMessage('File sedang diunggah ke Google Drive.');

        post(route('documents.upload'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                const uploadedFileId = (page.props.flash as FlashMessage | undefined)?.uploaded_file_id;
                if (uploadedFileId) {
                    console.log('[Documents] Uploaded Google Drive file ID:', uploadedFileId);
                }

                setIsUploadDialogOpen(false);
                resetUploadForm();
                setUploadStatus('success');
                setUploadMessage('Upload selesai. File berhasil ditambahkan.');
            },
            onError: () => {
                showUploadError('Periksa file lalu coba lagi.');
            },
        });
    };

    const handleCreateFolder = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedDrive || !canUpload) {
            showUploadError(uploadDisabledMessage);
            return;
        }

        submitCreateFolder(route('documents.folders.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateFolderDialogOpen(false);
                resetCreateFolderForm();
            },
        });
    };

    const handleDeleteDialogOpenChange = (open: boolean) => {
        if (!open) {
            setFilePendingDelete(null);
        }
    };

    const confirmDelete = () => {
        if (!selectedDrive || !filePendingDelete) {
            return;
        }

        setDeleteData({
            _method: 'delete',
            drive_id: selectedDrive.id,
            folder_id: currentFolderId ?? '',
        });

        submitDelete(route('documents.destroy', { fileId: filePendingDelete.id }), {
            preserveScroll: true,
            onSuccess: () => setFilePendingDelete(null),
        });
    };

    return {
        canOpenUploadDialog,
        uploadDisabledMessage,
        isUploadDialogOpen,
        isCreateFolderDialogOpen,
        filePendingDelete,
        uploadOrigin,
        uploadStatus,
        uploadMessage,
        uploadForm: {
            data,
            errors,
            processing,
        },
        createFolderForm: {
            data: createFolderData,
            errors: createFolderErrors,
            processing: createFolderProcessing,
        },
        deleteProcessing,
        openUploadDialog,
        openCreateFolderDialog,
        handleUploadDialogOpenChange,
        handleCreateFolderDialogOpenChange,
        handleDeleteDialogOpenChange,
        handleFileSelected,
        handleUploadFieldChange,
        handleCreateFolderNameChange: (value: string) => setCreateFolderData('folder_name', value),
        handleFilePendingDeleteChange: setFilePendingDelete,
        submitUpload,
        handleCreateFolder,
        confirmDelete,
        showUploadError,
    };
}
