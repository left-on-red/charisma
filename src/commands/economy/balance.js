let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'balance',
            description: 'gets your balance',
            aliases: [ 'bal' ],
            tags: [ 'economy', 'information' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let inventory = context.inventory.get(context.user.id);
            let balance = await inventory.getMoney();
    
            embed.setDescription(`**${balance}g**`);
            context.channel.send({ embeds: [embed] });
        });
    }
}