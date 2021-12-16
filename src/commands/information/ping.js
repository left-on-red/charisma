let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'ping',
            description: 'gets the ping of the bot in milliseconds',
            tags: [ 'information', 'utility' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            embed.setDescription('pinging...');

            let timestamp1 = Date.now();
            let message = await context.channel.send({ embeds: [embed] });
            let timestamp2 = Date.now();

            let newEmbed = new context.Discord.MessageEmbed();
            newEmbed.setColor(message.embeds[0].hexColor);
            newEmbed.setDescription(`${timestamp2 - timestamp1}ms`);
            message.edit(newEmbed);
        })
    }
}