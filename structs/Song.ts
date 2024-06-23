import YouTube from "youtube-sr";
import { videoPattern, isURL } from "../utils/patterns";
import { InfoData, video_basic_info } from "play-dl";
import { AudioResource } from "@discordjs/voice";

export interface SongData {
    url: string,
    title: string,
    duration: number
}

export class Song {
    public readonly url: string;
    public readonly title: string;
    public readonly duration: number;

    public constructor({ url, title, duration }: SongData) {
        this.url = url;
        this.title = title;
        this.duration = duration;
    }

    public static async from(url: string = "", search: string = "") {
        const isYoutubeUrl : boolean = videoPattern.test(url);
        // if (!isYoutubeUrl) 

        let songInfo: InfoData;

        if (isYoutubeUrl) {
            songInfo = await video_basic_info(url);

            return new this({
                url: songInfo.video_details.url,
                title: songInfo.video_details.title!,
                duration: songInfo.video_details.durationInSec
            });
        } else {
            // TODO: Implement search
            const result = await YouTube.searchOne(search, "video");

            result ? null : console.log(`No results found for ${search}`);

            if (!result) {
                let err = new Error(`No search results found for ${search}`);

                err.name = "NoResults";

                if (isURL.test(url)) err.name = "InvalidURL";

                throw err;
            }

            songInfo = await video_basic_info(`https://youtube.com/watch?v=${result.url}`);

            return new this({
                url: songInfo.video_details.url,
                title: songInfo.video_details.title!,
                duration: songInfo.video_details.durationInSec
            });
        }
    }

    // public async makeResource(): Promise<AudioResource<Song | void> {

    // }
}