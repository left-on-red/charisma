let yts = require('yt-search');
let moment = require('moment');

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'play',
            description: 'play a song',
            tags: [ 'fun', 'music' ]
        });

        // <search terms>
        this.push([{ type: 'string', required: true, name: 'search terms' }], async (context, parameters) => {
            let result = context.music.check(context);
            if (result == -1) {
                let menuEmbed = new context.Discord.MessageEmbed();
                menuEmbed.setColor(context.config.bot.accent);
        
                let collection = await yts(parameters[0]);
                let videos = collection.videos.slice(0, 10);
    
                let arr = [];
                for (let v = 0; v < videos.length; v++) { arr.push(`**[${v+1}] - ${videos[v].title} - ${moment.utc(videos[v].duration.seconds*1000).format('HH:mm:ss')}**`) }
                menuEmbed.setDescription(arr.join('\n'));
                menuEmbed.setFooter('pick one by entering 1-10; expires in 20 seconds');
                menuEmbed.setAuthor(`results for "${parameters[0]}"`);
                let menuMessage = await context.channel.send({ embeds: [menuEmbed] });
    
                try {
                    let collector = context.channel.createMessageCollector({ filter: (m) => m.content > 0 && m.content < videos.length+1 && m.author.id == context.user.id, time: 20000, max: 1 })
                    collector.on('end', (collected) => {
                        if (collected.size > 0) {
                            let message = collected.first();
                            let successEmbed = new context.Discord.MessageEmbed();
                            successEmbed.setColor(context.config.bot.accent);
    
                            let data = videos[parseInt(message.content) - 1];
    
                            context.music.add(context.guild.id, {
                                author: data.author.name,
                                duration: data.duration.seconds * 1000,
                                thumbnail: data.thumbnail,
                                title: data.title,
                                url: data.url
                            });
    
                            if (context.music.instances.get(context.guild.id).queue.length >= 1) { successEmbed.setDescription(`added **"${data.title}"** to the queue`) }
                            else { successEmbed.setDescription(`started playing **"${data.title}"**`) }
                            
                            successEmbed.setThumbnail(data.thumbnail);
                            menuMessage.edit({ embeds: [successEmbed] });
                        }

                        else {
                            let errorEmbed = new context.Discord.MessageEmbed();
                            errorEmbed.setColor(context.config.bot.accent);
                            errorEmbed.setDescription(`the song selection has expired...`);
                            menuMessage.edit({ embeds: [errorEmbed] });
                        }
                    });
                }
    
                catch(error) {
                    context.log.error(error);
                    let errorEmbed = new context.Discord.MessageEmbed();
                    errorEmbed.setColor(context.config.bot.accent);
                    errorEmbed.setDescription(`an error occurred...`);
                    menuMessage.edit({ embed: [errorEmbed] });
                }
            }

            else {
                let embed = new context.Discord.MessageEmbed();
                embed.setColor(context.config.bot.accent);
                embed.setDescription(context.music.errors[result]);
                context.channel.send({ embeds: [embed] });
            }
        });

        // <YouTube Video URL>
        this.push([{ type: 'youtubeVideo', required: true, name: 'YouTube Video URL' }], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let result = context.music.check(context);
            if (result == -1) {
                context.music.add(context.guild.id, parameters[0]);
                if (context.music.instances.get(context.guild.id).queue.length > 1) { embed.setDescription(`added **"${parameters[0].title}"** to the queue`) }
                else { embed.setDescription(`started playing **"${parameters[0].title}"**`) }
            }
            

            else { embed.setDescription(`that's an invalid video url`) }

            context.channel.send({ embeds: [embed] });
        });

        // <YouTube Playlist URL>
        this.push([{ type: 'youtubePlaylist', required: true, name: 'YouTube Playlist URL' }], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let result = context.music.check(context);

            if (result == -1) {
                context.music.playlist(context.guild.id, parameters[0]);
                embed.setDescription(`**${parameters[0].length}** tracks have been added to the queue`);
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}