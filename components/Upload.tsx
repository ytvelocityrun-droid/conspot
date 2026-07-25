import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import { MAX_UPLOAD_FILE_SIZE_BYTES, PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../libs/constants';

interface UploadProps {
    onComplete?: (base64Data: string, mimeType: string) => void;
}

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png'];

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const readerRef = useRef<FileReader | null>(null);
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const progressRef = useRef(0);
    const completedRef = useRef(false);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const cleanupUploadLifecycle = () => {
        if (readerRef.current) {
            readerRef.current.abort();
            readerRef.current = null;
        }

        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            cleanupUploadLifecycle();
        };
    }, []);

    const getMimeType = (selectedFile: File) => {
        const normalizedNameMimeType = selectedFile.name.toLowerCase().endsWith('.png')
            ? 'image/png'
            : selectedFile.name.toLowerCase().endsWith('.jpg') || selectedFile.name.toLowerCase().endsWith('.jpeg')
                ? 'image/jpeg'
                : null;

        if (normalizedNameMimeType && ACCEPTED_FILE_TYPES.includes(normalizedNameMimeType)) {
            return normalizedNameMimeType;
        }

        if (selectedFile.type && ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
            return selectedFile.type;
        }

        return normalizedNameMimeType ?? 'image/jpeg';
    };

    const isValidUpload = (selectedFile: File) => {
        const normalizedMimeType = getMimeType(selectedFile);
        const hasAcceptedExtension = /\.(jpe?g|png)$/i.test(selectedFile.name);
        const hasAcceptedMimeType = ACCEPTED_FILE_TYPES.includes(normalizedMimeType);

        return (hasAcceptedExtension || hasAcceptedMimeType) && selectedFile.size <= MAX_UPLOAD_FILE_SIZE_BYTES;
    };

    const processFile = (selectedFile: File) => {
        if (!isSignedIn || !selectedFile) {
            return;
        }

        if (!isValidUpload(selectedFile)) {
            cleanupUploadLifecycle();
            setFile(null);
            setProgress(0);
            setIsDragging(false);
            return;
        }

        cleanupUploadLifecycle();
        setFile(selectedFile);
        setProgress(0);
        progressRef.current = 0;
        completedRef.current = false;
        setIsDragging(false);

        const reader = new FileReader();
        readerRef.current = reader;
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                return;
            }

            const base64Data = result.includes(',') ? result.split(',')[1] : result;
            const mimeType = getMimeType(selectedFile);
            const finishUpload = () => {
                if (completedRef.current) {
                    return;
                }

                completedRef.current = true;

                if (intervalRef.current !== null) {
                    window.clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }

                if (timeoutRef.current !== null) {
                    window.clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = window.setTimeout(() => {
                    timeoutRef.current = null;
                    onComplete?.(base64Data, mimeType);
                }, REDIRECT_DELAY_MS);
            };

            const intervalId = window.setInterval(() => {
                const nextProgress = Math.min(100, progressRef.current + PROGRESS_STEP);
                progressRef.current = nextProgress;
                setProgress(nextProgress);

                if (nextProgress >= 100) {
                    finishUpload();
                }
            }, PROGRESS_INTERVAL_MS);

            intervalRef.current = intervalId;
        };
        reader.onerror = () => {
            cleanupUploadLifecycle();
            setFile(null);
            setProgress(0);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) {
            return;
        }

        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!isSignedIn) {
            return;
        }
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!isSignedIn) {
            return;
        }
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!isSignedIn) {
            return;
        }

        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
        setIsDragging(false);
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        disabled={!isSignedIn}
                        onChange={handleOnChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                'Click to upload or just drag and drop '
                            ) : (
                                'Sign in or sign up with Puter to upload'
                            )}
                        </p>
                        <p className="help">Maximum file size {Math.round(MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024))} MB.</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100 ? 'Analyzing Floor Plan ...' : 'Redirecting ...'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;