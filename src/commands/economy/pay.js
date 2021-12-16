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

            let from = new context.inventory(context.user.id, context);
            await from.init();

            if (parameters[1] > from.money.get()) { embed.setDescription(`you don't have that much in your balance`); return context.channel.send({ embeds: [embed] }) }

            let to = new context.inventory(user.id, context);
            await to.init();

            if (parameters[1] > 5000) {
                embed.setDescription(`you're attempting to pay someone more than **5000g**`);
                context.accept.request(context, embed, async function(sent) {
                    let response = new context.Discord.MessageEmbed();
                    response.setColor(context.config.bot.accent);
                    response.setDescription(`you payed **${user.tag} ${parameters[1]}g**~!`);

                    await from.refresh();
                    await to.refresh();

                    await from.money.remove(parameters[1]);
                    await to.money.add(parameters[1]);

                    await from.append();
                    await to.append();

                    sent.edit({ embeds: [response] });
                }, true);
            }

            else {
                embed.setDescription(`you payed **${user.tag} ${parameters[1]}g**~!`);

                from.money.remove(parameters[1]);
                to.money.add(parameters[1]);
                
                await from.append();
                await to.append();
                
                context.channel.send({ embeds: [embed] });
            }
        });
    }
}