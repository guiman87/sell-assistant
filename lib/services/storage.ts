export interface StorageService {
    uploadImage(file: File): Promise<string>;
}

export const mockStorageService: StorageService = {
    uploadImage: async (file: File): Promise<string> => {
        console.log('Mock uploading file:', file.name);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Return a fake URL (using a placeholder image service for visual feedback if needed, 
        // or just a local object URL if we were strictly client-side, but here we simulate a remote URL)
        return URL.createObjectURL(file);
    },
};
