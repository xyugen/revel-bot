import axios from "axios";
import config from "../utils/config";

const shortenUrl = async (url: string): Promise<string> => {
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
            validity_duration: 7
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