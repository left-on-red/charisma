let ytdl = require('ytdl-core');
let voice = require('@discordjs/voice');
let Discord = require('discord.js');
let progressBar = require('progress-string');

let BotContext = require('./../BotContext.js');
let CommandContext = require('./../CommandContext.js');
let SlashContext = require('./../SlashContext.js');
let CoreModule = require('./../CoreModule.js');

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

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

class MusicModule extends CoreModule {
    /**
     * 
     * @param {BotContext} context 
     */
    constructor(context) {
        super('music');
        this.context = context;

        /**
         * @type {Map<string, {connection: voice.VoiceConnection, player: voice.AudioPlayer, resource: voice.AudioResource, queue: string[], state: string, volume: number}>}
         */
        this.instances = new Map();
        
        /**
         * @type {Map<string, {inactive: number, message: Discord.Message}>}
         */
        this.jukeboxes = new Map();

        this.errors = [
            `you're not in a voice channel`,
            `I'm not in that voice channel`,
            `I don't have permission to speak in this channel`
        ];

        this.timer = setInterval(() => {
            this.jukeboxes.forEach(async (v, k) => {
                let message = await v.message.channel.messages.fetch(v.message.id);
                if (!message) { this.jukeboxes.delete(k); return; }
                if (!this.instances.get(k)) {
                    v.inactive += 100;
                    if (v.inactive >= 600 * 1000) {
                        v.message.delete();
                        this.jukeboxes.delete(k);
                    }
                }
            });
        }, 100);

        this.onUnload(() => {
            this.instances.forEach((value) => { value.connection.destroy() });
            clearInterval(this.timer);
        });
    }

    /**
     * 
     * @param {CommandContext} context 
     */
    setup(context) {
        let id = context.guild.id;

        let connection = voice.joinVoiceChannel({
            channelId: context.member.voice.channel.id,
            guildId: context.member.guild.id,
            adapterCreator: context.guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: false
        });

        let player = voice.createAudioPlayer();
        connection.subscribe(player);

        this.instances.set(id, {
            connection: connection,
            player: player,
            resource: null,
            queue: [],
            state: 'PLAYING',
            volume: 100
        });

        this.instances.get(id).player.on(voice.AudioPlayerStatus.Idle, () => {
            if (this.instances.get(id).state == 'SHUFFLED') { this.play(id, this.instances.get(id).queue[0]) }
            else if (this.instances.get(id).state == 'PLAYING') {
                this.instances.get(id).queue.shift();
                this.play(id, this.instances.get(id).queue[0]);
            }
        });

        this.instances.get(id).connection.on('stateChange', (old_state, new_state) => {
            if (new_state.status == voice.VoiceConnectionStatus.Disconnected) {
                if (this.instances.get(id)) { this.instances.get(id).player.stop() }
                else { this.context.logging.debug(id, this.instances.get(id)) }
                this.updateJukeboxEmbed(id);
                this.instances.delete(id);
            }
        });

        // skips current track if it errors out
        this.instances.get(id).player.on('error', (error) => {
            this.context.logging.error(`guild.${id}`, error);
            this.instances.get(id).queue.shift();
            this.play(id, this.instances.get(id).queue[0]);
        });
    }

    play(id, song) {
        if (song) {
            let jukebox = this.jukeboxes.get(id);
            if (jukebox) { jukebox.inactive = 0 }
            
            this.instances.get(id).state = 'PLAYING';

            let stream = ytdl(this.instances.get(id).queue[0].url, { filter: 'audioonly', highWaterMark: 1 << 25 });
            let resource = voice.createAudioResource(stream, { inputType: voice.StreamType.Arbitrary, inlineVolume: true });
            resource.volume.setVolume(this.instances.get(id).volume / 100);

            this.instances.get(id).resource = resource;
            this.instances.get(id).player.play(resource);
            this.context.logging.ok(`guild.${id}`, `started playing song: ${this.instances.get(id).queue[0].url}`)
        }

        else {
            this.instances.get(id).resource = null;
            this.instances.get(id).state = 'IDLE';
            this.instances.get(id).connection.disconnect();
            this.context.logging.ok(`guild.${id}`, 'music player reached the end of the queue...');
        }

        this.updateJukeboxEmbed(id);
    }

    volume(id, vol) {
        this.instances.get(id).volume = vol;
        if (this.instances.get(id).resource) { this.instances.get(id).resource.volume.setVolume(this.instances.get(id).volume / 100) }
        this.updateJukeboxEmbed(id);
    }

    pause(id) {
        this.instances.get(id).state = 'PAUSED';
        this.instances.get(id).player.pause(true);
        this.updateJukeboxEmbed(id);
    }

    resume(id) {
        this.instances.get(id).state = 'PLAYING';
        this.instances.get(id).player.unpause();
        this.updateJukeboxEmbed(id);
    }

    skip(id) {
        this.instances.get(id).player.stop();
        this.updateJukeboxEmbed(id);
    }

    shuffle(id) {
        let instance = this.instances.get(id);
        shuffle(instance.queue);
        instance.state = 'SHUFFLED';
        instance.player.stop();
        this.updateJukeboxEmbed(id);
    }

    add(id, video) {
        this.instances.get(id).queue.push(video);
        if (!this.instances.get(id).playing) {
            if (this.instances.get(id).queue.length == 1) {
                this.play(id, video);
            }
        }

        this.context.logging.ok(`guild.${id}`, `added song: ${video.url}`);
    }

    playlist(id, arr) { for (let a = 0; a < arr.length; a++) { this.add(id, arr[a]) } }

    /**
     * 
     * @param {CommandContext} context 
     * @returns {number}
     */
    check(context) {
        if (context.member.voice.channel) {
            if (!context.guild.me.voice.channel || (context.member.voice.channel.id == context.guild.me.voice.channel.id)) {
                if (context.member.voice.channel.permissionsFor(context.client.user).has('SPEAK')) { return -1 }
                else { return 2 }
            }
    
            else { return 1 }
        }
    
        else { return 0 }
    }

    /**
     * 
     * @param {CommandContext} context 
     * @returns {Discord.MessageEmbed}
     */
    getJukeboxEmbed(id) {
        let embed = new Discord.MessageEmbed();
        let instance = this.instances.get(id);

        let queue = instance.queue;
        let song = queue[0];

        embed.setFooter({ text: 'Jukebox' });
        embed.setTimestamp(Date.now());

        if (song) {
            embed.addField(`Currently Playing${instance.state == 'PAUSED' ? ' [PAUSED]' : ''}`, `[${song.title}](${song.url})`);
            embed.addField('Author', song.author);
    
            let ms = 0;
            for (let q = 1; q < queue.length; q++) { ms += queue[q].duration }
            let remaining = convert(ms, overHour(ms));
    
            embed.addField(`Remaining`, `${queue.length - 1} Tracks *(${remaining} total)*`);

            embed.addField('Next', `${queue[1] ? queue[1].title : '---'}`);
    
            let bar = progressBar({ total: 100, width: 10, incomplete: ' ', complete: '=', style: function(complete, incomplete) { return `\`[${complete}>${incomplete}]\`` } });
            embed.addField(`Volume`, `${bar(instance.volume)} (${instance.volume}/100)`);
            embed.setThumbnail(song.thumbnail);
        }

        else {
            embed.addField(`Currently Playing`, '---');
            embed.addField('Author', '---');
            embed.addField('Remaining', `0 Tracks *(0:00 total)*`);
            embed.addField('Next', '---');
            embed.addField('volume', '---');
        }

        return embed;
    }

    updateJukeboxEmbed(id) {
        let instance = this.instances.get(id);
        let jukebox = this.jukeboxes.get(id);
        if (instance && jukebox) {
            let embed = this.getJukeboxEmbed(id);
            let message = jukebox.message;
            embed.setColor(message.embeds[0].color);
            message.edit({ embeds: [embed] });
        }
    }

    /**
     * 
     * @param {SlashContext} context 
     */
    async createJukeboxEmbed(context) {
        let id = context.guild.id;
        let instance = this.instances.get(id);
        let embed = this.getJukeboxEmbed(id);
        embed.setColor(context.config.guild.colors.accent);
        let message = await context.reply({ embeds: [embed], fetchReply: true });

        let controls = '⏯ ⏭ 🔀 🔉 🔊'.split(' ');
        for (let c = 0; c < controls.length; c++) { await message.react(controls[c]) }

        this.jukeboxes.set(id, { inactive: 0, message: message });

        let collect = async () => {
            let jukebox = this.jukeboxes.get(id);
            if (jukebox) {
                let errored = false;
                let collector = message.createReactionCollector({ filter: (reaction) => controls.includes(reaction.emoji.name), time: 10000 });
                collector.on('collect', async (reaction, user) => {
                    try {
                        if (user.id == context.client.user.id) { return }
                        let index = controls.indexOf(reaction.emoji.name);
    
                        // play/pause
                        if (index == 0) {
                            let paused = instance.state == 'PAUSED';
                            if (paused) { this.resume(id) }
                            else { this.pause(id) }
                        }
    
                        // skip
                        else if (index == 1) { this.skip(id) }
    
                        // shuffle
                        else if (index == 2) { this.shuffle(id) }
    
                        // volume down
                        else if (index == 3) {
                            let volume = instance.volume;
                            if (volume < 0) { this.volume(id, 0) }
                            else { this.volume(id, volume - 10) }
                        }
    
                        // volume up
                        else if (index == 4) {
                            let volume = instance.volume;
                            if (volume > 100) { this.volume(id, 100) }
                            else { this.volume(id, volume + 10) }
                        }
    
                        await reaction.users.remove(user.id);
                    }
                    
                    catch(e) { errored = true }
                });

                collector.on('end', () => { if (!errored) { collect() } });
            }
        }

        collect();
    }
}

module.exports = MusicModule;