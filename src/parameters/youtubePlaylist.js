let ytpl = require('ytpl');
let CommandParameter = require('./../core/CommandParameter.js');

// is the url of a youtube playlist
module.exports = class extends CommandParameter {
    constructor() {
        super(async (input, context) => {
            let output = { pass: false, value: null }
    
            if (input.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm)) {
                try {
                    let playlist = await ytpl(input, { limit: Infinity });
                    let arr = [];
                    for (let i = 0; i < playlist.items.length; i++) {
                        arr.push({
                            author: playlist.items[i].author,
                            duration: playlist.items[i].durationSec * 1000,
                            thumbnail: playlist.items[i].bestThumbnail.url,
                            title: playlist.items[i].title,
                            url: playlist.items[i].shortUrl
                        });
                    }

                    output.pass = true;
                    output.value = arr;
                }

                catch(error) { context.logging.error(`guild.${context.guild.id}`, error) }
            }

            return output;
        });
    }
}