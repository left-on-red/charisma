let progressBar = require('progress-string');
let ytdl = require('ytdl-core');

function overHour(ms) { return ms >= 3600000 }
function convert(ms, isHours) {
    if (overHour(ms) || isHours) {
        let hours = Math.floor(ms / 3600000);
        let minutes = Math.floor((ms % 3600000) / 60000);
        let seconds = (((ms % 3600000) % 60000) / 1000).toFixed(0);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    else {
        let minutes = Math.floor(ms / 60000);
        let seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'playing',
            description: `see what's currently playing`,
            tags: [ 'fun', 'music' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            let result = context.music.check(context);
            if (result == -1) {
                if (context.music.instances.get(context.guild.id).queue.length > 0) {
                    let queue = context.music.instances.get(context.guild.id).queue;
                    let song = queue[0];
                    embed.setURL(song.url);
                    embed.setTitle(song.title);
                    embed.setThumbnail(song.thumbnail);

                    let streamTime = context.music.instances.get(context.guild.id).resource.playbackDuration;
                    let songLength = song.duration;

                    let progress = overHour(songLength) ? `${convert(streamTime, true)}/${convert(songLength)}` : `${convert(streamTime)}/${convert(songLength)}`;
                    
                    let bar = progressBar({ total: songLength, width: 15, incomplete: ' ', complete: '=', style: function(complete, incomplete) { return `\`[${complete}>${incomplete}]\`` } })
                    progress = `${bar(streamTime)} **(${progress})**${queue.length - 1 == 0 ? '' : `\n*(${queue.length - 1} songs after this)*`}`;

                    let label = 'progress';
                    if (context.music.instances.get(context.guild.id).state == 'PAUSED') { label = `${label} [paused]` }
                    embed.addField(label, `${progress}`);
                    
                    let data = (await ytdl.getBasicInfo(queue[0].url)).videoDetails;
                    
                    let description = data.description;
                    embed.addField('description', description.length > 1000 ? description.substring(0, 1000 - 3) + '...' : description);

                    embed.setAuthor(data.author.name, data.author.thumbnails[0].url);
                    if (data.keywords) { embed.setFooter(data.keywords.join(', ')) }
                }

                else { embed.setDescription(`nothing's currently playing`) }
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}