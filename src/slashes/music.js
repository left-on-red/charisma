let yts = require('yt-search');
let moment = require('moment');
let ytdl = require('ytdl-core');
let ytpl = require('ytpl');

let Slash = require('./../core/Slash.js');
let Discord = require('discord.js');

module.exports = class extends Slash {
    constructor() {
        super('music', 'music playing functionality!');

        this.append(
            Slash.SubcommandGroup('play', 'add music to the queue')
            .append(
                Slash.Subcommand('single', 'add a single track to the queue')
                .append(
                    Slash.String('url', 'the url of the track', true)
                    .interact(async (context, options) => {
                        let result = context.music.check(context);
                        if (result == -1) {
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
                                    }, 10000);
                                }
                
                                catch(error) { context.ephemeral('invalid url') }
                            }

                            else { context.ephemeral('invalid url') }
                        }

                        else { context.ephemeral(context.music.errors[result]) }
                    })
                )
            )
            .append(
                Slash.Subcommand('playlist', 'add an entire playlist to the queue')
                .append(
                    Slash.String('url', 'the url of the playlist', true)
                    .interact(async (context, options) => {
                        let result = context.music.check(context);
                        if (result == -1) {
                            let url = options.getString('url', true);
                            if (url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm)) {
                                try {
                                    let playlist = await ytpl(url, { limit: 200 });
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
                                    }, 10000);
                                }
                
                                catch(error) { console.error(error); context.ephemeral('invalid url') }
                            }

                            else { context.ephemeral('invalid url') }
                        }

                        else { context.ephemeral(context.music.errors[result]) }
                    })
                )
            )
            .append(
                Slash.Subcommand('search', 'search for music to add to the queue')
                .append(
                    Slash.String('terms', 'the terms to search for', true)
                    .interact(async (context, options) => {
                        let result = context.music.check(context);
                        if (result == -1) {
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
                            }, 10000);
                        }
                    })
                )
            )
        );

        this.append(Slash.Subcommand('queue', 'inspect the music queue').interact(async (context) => {
            let result = context.music.check(context);
            if (result == -1) {
                if (context.music.instances.has(context.guild.id)) {
                    let queue = context.music.instances.get(context.guild.id).queue;

                    let maxPage = Math.ceil(queue.length / 10) - 1;
                    let page = 0;
                    let ended = false;

                    let getEmbed = () => {
                        let embed = new Discord.MessageEmbed();
                        embed.setColor(context.config.guild.colors.accent);

                        let arr = [];
                        for (let i = 0; i < 10; i++) {
                            if (queue[(page * 10) + i]) {
                                if (page == 0 && i == 0) { arr.push(`**${(page * 10) + i + 1}: ${queue[(page * 10) + i].title}**`) }
                                else { arr.push(`${(page * 10) + i + 1}: ${queue[(page * 10) + i].title}`) }
                            }
                        }

                        embed.setDescription(arr.join('\n'));
                        embed.setFooter({ text: `page ${page + 1}/${maxPage + 1}` });

                        return embed;
                    }

                    let getComponent = () => {
                        let row = new Discord.MessageActionRow();

                        let back = new Discord.MessageButton()
                            .setCustomId('queue-back')
                            .setLabel('<')
                            .setStyle('SECONDARY')
                            .setDisabled(ended || page == 0);

                        let forward = new Discord.MessageButton()
                            .setCustomId('queue-forward')
                            .setLabel('>')
                            .setStyle('SECONDARY')
                            .setDisabled(ended || page == maxPage)

                        row.addComponents([back, forward]);
                        return row;
                    }

                    let message = await context.reply({
                        ephemeral: true,
                        embeds: [getEmbed()],
                        components: [getComponent()],
                        fetchReply: true
                    });

                    let loop = async () => {
                        try {
                            let data = await message.awaitMessageComponent({ filter: (interaction) => interaction.user.id == context.user.id, time: 30000 });
                            if (data.customId == 'queue-back') { page -= 1 }
                            else if (data.customId == 'queue-forward') { page += 1 }

                            data.deferUpdate();

                            message = await context.editReply({
                                ephemeral: true,
                                embeds: [getEmbed()],
                                components: [getComponent()],
                                fetchReply: true
                            });

                            await loop();
                        }

                        catch(e) { await context.editReply({ content: 'message interaction expired...', embeds: [getEmbed()], components: [getComponent()] }) }
                    }

                    await loop();
                }

                else { await context.ephemeral('the queue is currently empty') }
            }

            else { await context.reply(context.music.errors[result]) }
        }));

        this.append(Slash.Subcommand('jukebox', 'create a jukebox message for the current music stream').interact(async (context) => {
            let result = context.music.check(context);
            if (result == -1) {
                await context.music.createJukeboxEmbed(context);
            }

            else { await context.ephemeral(context.music.errors[result]) }
        }));

        this.append(Slash.Subcommand('volume', 'change the volume of the music stream')
            .append(
                Slash.Integer('volume', 'the volume level', true).min(0).max(100)
                .interact(async (context, options) => {
                    let result = context.music.check(context);

                    if (result == -1) {
                        if (context.music.instances.has(context.guild.id)) {
                            let volume = options.getInteger('volume', true);
                            context.music.volume(context.guild.id, volume);
                            await context.ephemeral(`set the music stream volume to \`${volume}\``);
                        }
        
                        else { await context.ephemeral(`I'm not currently playing anything`) }
                    }
        
                    else { await context.ephemeral(context.music.errors[result]) }
                })
            )
        );

        this.append(Slash.Subcommand('shuffle', 'shuffle the music queue').interact(async (context) => {
            let result = context.music.check(context);
            if (result == -1) {
                let instance = context.music.instances.get(context.guild.id);
                
                if (instance) {
                    context.music.shuffle(context.guild.id);
                    await context.reply(`shuffled the music queue`);
                }

                else { await context.ephemeral(`there's no music in the queue`) }
            }

            else { await context.ephemeral(context.music.errors[result]) }
        }));

        this.append(Slash.Subcommand('pause', 'pause the music stream').interact(async (context) => {
            let result = context.music.check(context);
            if (result == -1) {
                let instance = context.music.instances.get(context.guild.id);
                
                if (instance) {
                    if (instance.state == 'PLAYING') {
                        context.music.pause(context.guild.id);
                        await context.reply(`paused the music stream`);
                    }

                    else if (instance.state == 'PAUSED') { await context.ephemeral(`the music stream is already paused`) }
                }

                else { await context.ephemeral(`the music stream isn't playing anything`) }
            }

            else { await context.ephemeral(context.music.errors[result]) }
        }));

        this.append(Slash.Subcommand('unpause', 'unpause the music stream').interact(async (context) => {
            let result = context.music.check(context);
            if (result == -1) {
                let instance = context.music.instances.get(context.guild.id);
                
                if (instance) {
                    if (instance.state == 'PAUSED') {
                        context.music.resume(context.guild.id);
                        await context.reply(`unpaused the music stream`);
                    }

                    else if (instance.state == 'PLAYING') { await context.ephemeral(`the music stream is already unpaused`) }
                }

                else { await context.ephemeral(`the music stream isn't playing anything`) }
            }

            else { await context.ephemeral(context.music.errors[result]) }
        }));

        this.after((context, options) => {
            if (options.getSubcommand() != 'jukebox') {
                setTimeout(() => {
                    // deletes reply after 10s if not ephemeral and jukebox is active (excludes actual /jukebox command)
                    if (!context.interaction.ephemeral && context.music.jukeboxes.get(context.guild.id).message) { context.deleteReply() }
                }, 10000);
            }
        });
    }
}

