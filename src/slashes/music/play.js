let yts = require('yt-search');
let moment = require('moment');
let ytdl = require('ytdl-core');
let ytpl = require('ytpl');

let Slash = require('./../../core/Slash.js');
let Discord = require('discord.js');

module.exports = class extends Slash {
    constructor() {
        super('play', 'play music');

        // /play single <url>
        this
            .option({ name: 'single', description: 'add a single track to the queue', type: 'SUB_COMMAND' })
            .option({ name: 'url', description: 'the url of the track', type: 'STRING', required: true });

        // /play playlist <url>
        this
            .option({ name: 'playlist', description: `add an entire playlist to the queue`, type: 'SUB_COMMAND' })
            .option({ name: 'url', description: 'the url of the playlist', type: 'STRING', required: true });


        // /play search <terms>
        this
            .option({ name: 'search', description: 'search for music to add to the queue', type: 'SUB_COMMAND' })
            .option({ name: 'terms', description: 'the terms to search for', type: 'STRING', required: true });

        this.interact(async (context, options) => {
            let sub = options.getSubcommand(true);
            let result = context.music.check(context);

            if (result == -1) {
                if (sub == 'single') {
                    let url = options.getString('url', true);
                    if (url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm)) {
                        try {
                            let video = await ytdl.getBasicInfo(url);
                            let obj = {
                                author: video.videoDetails.author.name,
                                duration: parseInt(video.videoDetails.lengthSeconds) * 1000,
                                thumbnail: video.videoDetails.thumbnails[0].url,
                                title: video.videoDetails.title,
                                url: video.videoDetails.video_url
                            }

                            if (!context.music.instances.has(context.guild.id)) { context.music.setup(context) }
                            let instance = context.music.instances.get(context.guild.id);

                            context.music.add(context.guild.id, obj);

                            let content = `started playing **${Discord.Util.escapeMarkdown(obj.title)}**`;
                            if (instance.queue.length > 1) { content = `added **${Discord.Util.escapeMarkdown(obj.title)}** to the queue` }

                            let sent = await context.reply({ content: content, fetchReply: true });

                            setTimeout(() => {
                                try { sent.delete() }
                                catch(e) {}
                            }, 5000);
                        }
        
                        catch(error) { context.ephemeral('invalid url') }
                    }

                    else { context.ephemeral('invalid url') }
                }

                else if (sub == 'playlist') {
                    let url = options.getString('url', true);
                    if (url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm)) {
                        try {
                            let playlist = await ytpl(url, { limit: Infinity });
                            let arr = [];
                            for (let i = 0; i < playlist.items.length; i++) {
                                arr.push({
                                    author: playlist.items[i].author.name,
                                    duration: playlist.items[i].durationSec * 1000,
                                    thumbnail: playlist.items[i].bestThumbnail.url,
                                    title: playlist.items[i].title,
                                    url: playlist.items[i].shortUrl
                                });
                            }

                            if (!context.music.instances.has(context.guild.id)) { context.music.setup(context) }
                            context.music.playlist(context.guild.id, arr);
                            let sent = await context.reply({ content: `**${arr.length}** tracks have been added to the queue`, fetchReply: true });
                            setTimeout(() => {
                                try { sent.delete() }
                                catch(e) {}
                            }, 5000);
                        }
        
                        catch(error) { console.error(error); context.ephemeral('invalid url') }
                    }

                    else { context.ephemeral('invalid url') }
                }

                else if (sub == 'search') {
                    let terms = options.getString('terms', true);

                    let row = new Discord.MessageActionRow();
                    let select = new Discord.MessageSelectMenu();
                    select.setCustomId('yt-select');
                    select.setPlaceholder('Pick one');
            
                    let collection = await yts(terms);
                    let videos = collection.videos.slice(0, 10);

                    let arr = [];
                    for (let v = 0; v < videos.length; v++) {
                        arr.push({
                            label: videos[v].title,
                            description: moment.utc(videos[v].duration.seconds*1000).format('HH:mm:ss'),
                            value: `${v}`
                        });
                    }

                    select.addOptions(arr);
                    row.addComponents(select);

                    let sent = await context.reply({ content: 'Select a track', components: [row], fetchReply: true });

                    try {
                        let data = await sent.awaitMessageComponent({ filter: (interaction) => interaction.customId == 'yt-select' && interaction.user.id == context.user.id, time: 30000 });
                        let track = videos[parseInt(data.values[0])];

                        if (!context.music.instances.has(context.guild.id)) { context.music.setup(context) }

                        let content = `Added **${Discord.Util.escapeMarkdown(track.title)}** to the queue`;
                        if (context.music.instances.get(context.guild.id).queue.length == 0) { content = `Started playing **${Discord.Util.escapeMarkdown(track.title)}**` }

                        context.music.add(context.guild.id, {
                            author: track.author.name,
                            duration: track.duration.seconds * 1000,
                            thumbnail: track.thumbnail,
                            title: track.title,
                            url: track.url
                        });

                        await sent.edit({ content: content, components: [] });
                    }

                    catch(e) { await sent.edit({ content: 'selection expired...', components: [] }) }

                    setTimeout(() => {
                        try { sent.delete() }
                        catch(e) {}
                    }, 5000);
                }
            }

            else { context.ephemeral(context.music.errors[result]) }
        });
    }
}

