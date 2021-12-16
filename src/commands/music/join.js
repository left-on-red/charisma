let Command = require('./../../core/Command.js');
let voice = require('@discordjs/voice');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'join',
            description: 'make me join a voice channel!',
            tags: [ 'fun', 'music' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (context.member.voice.channel.id) {
                if (context.member.voice.channel.joinable) {
                    let connection = voice.joinVoiceChannel({
                        channelId: context.member.voice.channel.id,
                        guildId: context.member.guild.id,
                        adapterCreator: context.guild.voiceAdapterCreator,
                        selfMute: false,
                        selfDeaf: false
                    });

                    let player = voice.createAudioPlayer();
                    connection.subscribe(player);

                    context.music.instances.set(context.guild.id, {
                        connection: connection,
                        player: player,
                        resource: null,
                        queue: [],
                        state: 'PLAYING',
                        volume: 100
                    });

                    context.music.setup(context.guild.id);

                    embed.setDescription(`connected to \`${context.member.voice.channel.name}\``);
                }

                else { embed.setDescription(`I don't have permission to join that voice channel`) }
            }

            else { embed.setDescription(`you're not in a voice channel`) }

            context.channel.send({ embeds: [embed] });
        });
    }
}