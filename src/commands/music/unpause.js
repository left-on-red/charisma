let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'unpause',
            description: 'unpause the music player',
            tags: [ 'fun', 'music' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let result = context.music.check(context);
            if (result == -1) {
                if (context.music.instances.get(context.guild.id).state == 'PAUSED') {
                    context.music.resume(context.guild.id);
                    embed.setDescription(`unpaused the music player`);
                }

                else { embed.setDescription(`the player isn't paused`) }
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}