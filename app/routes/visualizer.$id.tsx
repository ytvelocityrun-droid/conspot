import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getUploadImage, type StoredUploadImage } from "../../libs/uploadStorage";

const VisualizerId = () => {
    const { id } = useParams();
    const [uploadImage, setUploadImage] = useState<StoredUploadImage | null>(null);

    useEffect(() => {
        setUploadImage(null);

        if (!id) {
            return;
        }

        const loadUploadImage = async () => {
            try {
                const storedValue = await getUploadImage(id);
                setUploadImage(storedValue);
            } catch {
                setUploadImage(null);
            }
        };

        void loadUploadImage();
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