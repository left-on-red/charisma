let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'skip',
            description: `skips the song that's currently playing`,
            tags: [ 'fun', 'music' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let result = context.music.check(context);
            if (result == -1) {
                if (['PAUSED', 'PLAYING'].includes(context.music.instances.get(context.guild.id).state)) {
                    let song = context.music.instances.get(context.guild.id).queue[0];
                    let title = song.title;
                    context.music.instances.get(context.guild.id).player.stop();
                    embed.setDescription(`skipped **${context.Discord.Util.escapeMarkdown(title)}**`);
                }

                else { embed.setDescription(`nothing is currently playing`) }
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}