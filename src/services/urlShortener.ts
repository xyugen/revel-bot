import axios from "axios";
import config from "../utils/config";

/**
 * Shortens a given URL using the RapidAPI URL Shortener service.
 *
 * @param {string} url - The URL to be shortened.
 * @param {number} [duration=7] - The duration (in days) for which the shortened URL should be valid.
 * @return {Promise<string>} A Promise that resolves to the shortened URL.
 * @throws {Error} If there is an error in shortening the URL.
 */
const shortenUrl = async (url: string, duration: number = 7): Promise<string> => {
    const options = {
        method: 'POST',
        url: 'https://url-shortener42.p.rapidapi.com/shorten/',
        params: { format: 'mp3', hl: 'en', gl: 'US' },
        headers: {
            'X-RapidAPI-Key': config.RAPID_API_KEY,
            'X-RapidAPI-Host': 'url-shortener42.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            url: url,
            validity_duration: duration
        }
    }

    try {
        const response = await axios.request(options);
        return response.data.url;
    } catch (error) {
        console.error('Error shortening URL:', error);
        throw new Error('Failed to shorten URL');
    }
}

export default shortenUrl;