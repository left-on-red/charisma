let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'pause',
            description: 'pause the music player',
            tags: [ 'fun', 'music' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let result = context.music.check(context);
            if (result == -1) {
                if (context.music.instances.get(context.guild.id).state == 'PLAYING') {
                    context.music.pause(context.guild.id);
                    embed.setDescription(`paused the music player`);
                }

                else if (context.music.instances.get(context.guild.id).state == 'IDLE') { embed.setDescription(`the player currently isn't playing anything`) }
                

                else { embed.setDescription(`the player is already paused`) }
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}