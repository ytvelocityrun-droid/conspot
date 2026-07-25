import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../libs/constants';

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = (selectedFile: File) => {
        if (!isSignedIn || !selectedFile) {
            return;
        }

        setFile(selectedFile);
        setProgress(0);
        setIsDragging(false);

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                return;
            }

            const base64Data = result.includes(',') ? result.split(',')[1] : result;
            const intervalId = window.setInterval(() => {
                setProgress((currentProgress) => {
                    if (currentProgress >= 100) {
                        window.clearInterval(intervalId);
                        window.setTimeout(() => {
                            onComplete?.(base64Data);
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }

                    return Math.min(100, currentProgress + PROGRESS_STEP);
                });
            }, PROGRESS_INTERVAL_MS);
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
                        accept=".jpg,.jpeg,.png"
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
                        <p className="help">Maximum file size 50 MB.</p>
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