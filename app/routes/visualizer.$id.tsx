import { useEffect, useState } from "react";
import { useParams } from "react-router";

const UPLOAD_IMAGE_STORAGE_PREFIX = "conspot:upload:";

interface StoredUploadImage {
    base64Image: string;
    mimeType: string;
}

const VisualizerId = () => {
    const { id } = useParams();
    const [uploadImage, setUploadImage] = useState<StoredUploadImage | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        try {
            const storedValue = window.localStorage.getItem(`${UPLOAD_IMAGE_STORAGE_PREFIX}${id}`);
            if (storedValue) {
                setUploadImage(JSON.parse(storedValue) as StoredUploadImage);
            }
        } catch {
            setUploadImage(null);
        }
    }, [id]);

    if (!uploadImage) {
        return <div>No uploaded image found.</div>;
    }

    return (
        <div>
            <h2>Visualizer</h2>
            <img
                src={`data:${uploadImage.mimeType};base64,${uploadImage.base64Image}`}
                alt="Uploaded floor plan"
                style={{ maxWidth: '100%' }}
            />
        </div>
    );
};

export default VisualizerId