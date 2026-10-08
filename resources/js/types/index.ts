import type { FormDataConvertible } from '@inertiajs/core';
import { LucideIcon } from 'lucide-react';
import type { FormEvent } from 'react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime: string;
    webViewLink: string;
    webContentLink?: string;
    canDelete: boolean;
    driveId?: string;
    metadata?: DocumentMetadataSummary | null;
}

export interface DocumentMetadataSummary {
    category: string | null;
    department: string | null;
    status: string | null;
    issue_at: string | null;
    expired_at: string | null;
    pic_emails: string[];
}

export interface FolderBreadcrumb {
    id: string;
    name: string;
}

export interface SharedDrive {
    id: string;
    name: string;
}

export interface SharedFolder {
    id: string;
    name: string;
    webViewLink?: string | null;
    type: 'shared_subfolder';
}

export interface DocumentsFilters {
    search?: string;
    category?: string;
    department?: string;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    uploaded_file_id?: string;
}

export interface DocumentsPageProps {
    flash?: FlashMessage;
    [key: string]: unknown;
}

export interface DocumentsIndexProps {
    sharedDrives?: SharedDrive[];
    sharedFolders?: SharedFolder[];
    selectedDrive?: SharedDrive | null;
    canUpload?: boolean;
    files: DriveFile[];
    folderBreadcrumbs?: FolderBreadcrumb[];
    isGlobalSearch?: boolean;
    filters?: DocumentsFilters;
}

export interface DashboardStats {
    totalDocuments: number;
    pendingReview: number;
    expiredDocuments: number;
}

export interface DashboardDocument {
    id: number;
    google_file_id: string;
    fileName: string;
    webViewLink: string | null;
    category: string | null;
    department: string | null;
    status: string | null;
    expired_at: string | null;
    created_at: string | null;
}

export interface DashboardPageProps {
    stats: DashboardStats;
    expiringDocs: DashboardDocument[];
    recentDocs: DashboardDocument[];
}

export interface DocumentUploadFormData {
    [key: string]: FormDataConvertible;
    drive_id: string;
    folder_id: string;
    file: File | null;
    category: string;
    department: string;
    status: string;
    issue_at: string;
    expired_at: string;
    pic_emails: string;
}

export interface DocumentCreateFolderFormData {
    [key: string]: FormDataConvertible;
    drive_id: string;
    folder_id: string;
    folder_name: string;
}

export interface DocumentDeleteFormData {
    [key: string]: FormDataConvertible;
    _method: 'delete';
    drive_id: string;
    folder_id: string;
}

export interface DocumentToastNotification {
    key: string;
    title: string;
    message: string;
    variant: 'default' | 'destructive';
    className: string;
}

export interface DocumentOption {
    value: string;
    label: string;
}

export type DocumentUploadOrigin = 'button' | 'drag';

export type DocumentUploadStatus = 'idle' | 'starting' | 'success' | 'error';

export type DocumentUploadField = 'category' | 'department' | 'status' | 'issue_at' | 'expired_at' | 'pic_emails';

export type DocumentUploadErrors = Partial<Record<keyof DocumentUploadFormData, string>>;

export type DocumentCreateFolderErrors = Partial<Record<keyof DocumentCreateFolderFormData, string>>;

export interface DocumentsHeaderProps {
    search: string;
    category: string;
    department: string;
    isDriveRootView: boolean;
    isGlobalSearchView: boolean;
    activeFolderName?: string | null;
    canOpenUploadDialog: boolean;
    uploadDisabledMessage: string;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onDepartmentChange: (value: string) => void;
    onSubmitFilters: () => void;
    onOpenUploadDialog: () => void;
    onOpenCreateFolderDialog: () => void;
}

export interface DocumentUploadDialogProps {
    open: boolean;
    uploadStatus: DocumentUploadStatus;
    uploadMessage: string | null;
    uploadOrigin: DocumentUploadOrigin;
    data: DocumentUploadFormData;
    errors: DocumentUploadErrors;
    processing: boolean;
    onOpenChange: (open: boolean) => void;
    onFileSelected: (selectedFile: File | null) => void;
    onFieldChange: (field: DocumentUploadField, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface DocumentCreateFolderDialogProps {
    open: boolean;
    data: DocumentCreateFolderFormData;
    errors: DocumentCreateFolderErrors;
    processing: boolean;
    onOpenChange: (open: boolean) => void;
    onFolderNameChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export interface DocumentDeleteDialogProps {
    open: boolean;
    filePendingDelete: DriveFile | null;
    processing: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export interface DocumentToastProps {
    toast: DocumentToastNotification | null;
    onDismiss: (key: string) => void;
}

export interface DocumentsTableProps {
    isDriveRootView: boolean;
    isGlobalSearchView: boolean;
    sharedDrives: SharedDrive[];
    sharedFolders: SharedFolder[];
    selectedDrive: SharedDrive | null;
    folderBreadcrumbs: FolderBreadcrumb[];
    files: DriveFile[];
    deleteProcessing: boolean;
    onDeleteSelect: (file: DriveFile) => void;
    onOpenDetail: (file: DriveFile) => void;
}

export interface DocumentDetailDialogProps {
    open: boolean;
    file: DriveFile | null;
    processingDelete: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: (file: DriveFile) => void;
}

export interface UseDocumentFiltersParams {
    filters?: DocumentsFilters;
    selectedDrive?: SharedDrive | null;
    currentFolderId?: string | null;
}

export interface UseDocumentToastParams {
    flash?: FlashMessage;
    isUploadDialogOpen: boolean;
    uploadStatus: DocumentUploadStatus;
    uploadMessage: string | null;
}

export interface UseDocumentActionsParams {
    selectedDrive?: SharedDrive | null;
    canUpload: boolean;
    currentFolderId?: string | null;
}

export interface UseDocumentDragAndDropParams {
    canOpenUploadDialog: boolean;
    processing: boolean;
    uploadDisabledMessage: string;
    selectedDrive?: SharedDrive | null;
    onUploadBlocked: (message: string) => void;
    onFileDropped: (file: File) => void;
}
