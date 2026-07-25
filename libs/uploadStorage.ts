export interface StoredUploadImage {
    base64Image: string;
    mimeType: string;
}

const DB_NAME = 'conspot-upload-images';
const STORE_NAME = 'uploads';

const openUploadDb = () => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

export const persistUploadImage = async (id: string, image: StoredUploadImage) => {
    const db = await openUploadDb();

    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put({ id, ...image });

        transaction.oncomplete = () => {
            db.close();
            resolve();
        };

        transaction.onerror = () => {
            db.close();
            reject(transaction.error);
        };
    });
};

export const getUploadImage = async (id: string) => {
    const db = await openUploadDb();

    return new Promise<StoredUploadImage | null>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).get(id);

        request.onsuccess = () => {
            const result = request.result as (StoredUploadImage & { id: string }) | undefined;
            db.close();
            resolve(result ? { base64Image: result.base64Image, mimeType: result.mimeType } : null);
        };

        request.onerror = () => {
            db.close();
            resolve(null);
        };
    });
};
