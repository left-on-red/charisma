let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'pay',
            description: 'pay someone some money!',
            tags: [ 'economy' ]
        });

        this.push([
            { type: 'mention', required: true, name: 'user' },
            { type: 'number', required: true, name: 'money' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let user = (await context.guild.members.fetch(parameters[0])).user;
            if (user.id == context.user.id) { embed.setDescription(`you can't pay yourself`); return context.channel.send({ embeds: [embed] }) }

            let from = await context.inventory.getMoney(context, context.user.id);

            if (parameters[1] > from) { embed.setDescription(`you don't have that much in your balance`); return context.channel.send({ embeds: [embed] }) }

            let to = await context.inventory.getMoney(context, user.id);

            if (parameters[1] > 5000) {
                embed.setDescription(`you're attempting to pay someone more than **5000g**`);
                context.accept.request(context, embed, async function(sent) {
                    let response = new context.Discord.MessageEmbed();
                    response.setColor(context.config.bot.accent);
                    response.setDescription(`you payed **${user.tag} ${parameters[1]}g**~!`);

                    await context.inventory.removeMoney(context, context.user.id, parameters[1]);
                    await context.inventory.addMoney(context, user.id, parameters[1]);

                    sent.edit({ embeds: [response] });
                }, true);
            }

            else {
                embed.setDescription(`you payed **${user.tag} ${parameters[1]}g**~!`);

                await context.inventory.removeMoney(context, context.user.id, parameters[1]);
                await context.inventory.addMoney(context, user.id, parameters[1]);
                
                context.channel.send({ embeds: [embed] });
            }
        });
    }
}