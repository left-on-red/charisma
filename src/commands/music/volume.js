let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'volume',
            description: 'set the volume of the music stream',
            tags: [ 'fun', 'music' ]
        });

        this.push([{ type: 'number', required: true, name: '0-200' }], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let result = context.music.check(context);
            if (result == -1) {
                if (0 <= parameters[0] && parameters[0] <= 200) {
                    context.music.volume(context.guild.id, parameters[0]);
                    embed.setDescription(`the volume has been set to \`${parameters[0]}\``);
                }

                else { embed.setDescription(`the volume has to be 0-100`) }
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}