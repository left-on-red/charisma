let ytdl = require('ytdl-core');
let voice = require('@discordjs/voice');

let BotContext = require('./../BotContext.js');
let CommandContext = require('./../CommandContext.js');
let CoreModule = require('./../CoreModule.js');

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
        this.errors = [
            `you're not in a voice channel`,
            `I'm not in a voice channel`,
            `I'm not in that voice channel`,
            `I don't have permission to speak in this channel`
        ];

        this.onUnload(() => {
            this.instances.forEach((value) => { value.connection.destroy() });
        });
    }

    setup(id) {
        this.instances.get(id).player.on(voice.AudioPlayerStatus.Idle, () => {
            if (this.instances.get(id).state == 'SHUFFLED') { this.play(id, this.instances.get(id).queue[0]) }
            else if (this.instances.get(id).state == 'PLAYING') {
                this.instances.get(id).queue.shift();
                this.play(id, this.instances.get(id).queue[0]);
            }
        });

        this.instances.get(id).connection.on('stateChange', (old_state, new_state) => {
            if (new_state.status == voice.VoiceConnectionStatus.Disconnected) {
                this.instances.get(id).player.stop();
                //this.instances.get(id).connection.disconnect();
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
            this.context.logging.ok(`guild.${id}`, 'music player reached the end of the queue...');
        }
    }

    volume(id, vol) {
        this.instances.get(id).volume = vol;
        if (this.instances.get(id).resource) { this.instances.get(id).resource.volume.setVolume(this.instances.get(id).volume / 100) }
    }

    pause(id) {
        this.instances.get(id).state = 'PAUSED';
        this.instances.get(id).player.pause(true);
    }

    resume(id) {
        this.instances.get(id).state = 'PLAYING';
        this.instances.get(id).player.unpause();
    }

    add(id, video) {
        this.instances.get(id).queue.push(video);
        if (!this.instances.get(id).playing) {
            if (this.instances.get(id).queue.length == 1) {
                this.play(id, video);
            }
        }

        this.context.logging.ok(`guild.${id}`, `added song: ${video.url}`);
        this.context.logging.debug(`guild.${id}`, video);
    }

    playlist(id, arr) { for (let a = 0; a < arr.length; a++) { this.add(id, arr[a]) } }

    /**
     * 
     * @param {CommandContext} context 
     * @returns {number}
     */
    check(context) {
        if (context.member.voice.channel) {
            if (context.guild.me.voice.channel) {
                if (context.member.voice.channel.id == context.guild.me.voice.channel.id) {
                    if (context.member.voice.channel.permissionsFor(context.client.user).has('SPEAK')) { return -1 }
                    else { return 3 }
                }
    
                else { return 2 }
            }
    
            else { return 1 }
        }
    
        else { return 0 }
    }
}

module.exports = MusicModule;