/**
 * let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'ping',
            description: 'gets the ping of the bot in milliseconds',
            tags: [ 'information', 'utility' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.local.guild.colors.accent);
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
 */

let Slash = require('./../core/Slash.js');

module.exports = class extends Slash {
    constructor() {
        super('ping', 'get the ping of the bot');

        this.interact((context, options) => {
            let was = Date.now();
            context.ephemeral('pinging...').then(() => {
                let is = Date.now();
                let diff = is - was;
                context.editReply(`I have a ping of ${diff}ms!`);
            });
        });
    }
}

