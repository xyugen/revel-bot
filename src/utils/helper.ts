import { User } from "discord.js";

/**
 * Converts seconds to a readable format
 *
 * @param {number} seconds - The number of seconds to convert
 * @return {string} The formatted timestamp in the format hh:mm:ss or mm:ss
 */
export const formatTimestamp = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    if (hh) {
        return `${hh}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    }
    return `${mm}:${String(ss).padStart(2, "0")}`;
}

/**
 * Asynchronously fetches the image buffer from the given URL.
 *
 * @param {string} url - The URL of the image to fetch.
 * @return {Promise<Buffer>} A Promise that resolves to a Buffer containing the image data.
 * @throws {Error} If the image fetch fails.
 */
export async function fetchImageBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export const replaceIdToName = (text: string, user: User) => {
    return text.replace(`<@${user.id}>`, user.displayName) || user.username;
}