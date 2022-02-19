let ytdl = require('ytdl-core');
let CommandParameter = require('./../core/CommandParameter.js');

// is the url of a youtube playlist
module.exports = class extends CommandParameter {
    constructor() {
        super(async (input, context) => {
            let output = { pass: false, value: null }
    
            if (input.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm)) {
                try {
                    let video = await ytdl.getBasicInfo(input);
                    output.pass = true;

                    output.value = {
                        author: video.videoDetails.author.name,
                        duration: parseInt(video.videoDetails.lengthSeconds) * 1000,
                        thumbnail: video.videoDetails.thumbnails[0].url,
                        title: video.videoDetails.title,
                        url: video.videoDetails.video_url
                    }
                }

                catch(error) { context.log.error(error) }
            }

            return output;
        });
    }
}