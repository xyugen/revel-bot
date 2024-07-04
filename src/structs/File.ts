import { FileMetadata } from "../interfaces/FileMetadata";

export class File {
    public readonly fileName: string;
    public readonly contentLength: number | null;
    public readonly contentType: string | null;
    public readonly url: string;

    constructor({ fileName, contentLength, contentType, url }: FileMetadata) {
        this.fileName = fileName;
        this.contentLength = contentLength;
        this.contentType = contentType;
        this.url = url;
    }

    static async getFileMetadata(url: string): Promise<File | null> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('Content-Type');
            const contentDisposition = response.headers.get('Content-Disposition');
            const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);

            // Default filename (fallback)
            let fileName = url.split('/').pop() || 'unknown';

            if (contentDisposition && contentDisposition.includes('filename=')) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    fileName = match[1];
                }
            }

            return new this({
                fileName,
                contentLength,
                contentType,
                url
            });
        } catch (error) {
            console.error(`Error fetching file metadata: ${error}`);
            return null;
        }
    }
}