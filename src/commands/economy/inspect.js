let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'inspect',
            description: 'inspect something in your inventory',
            tags: [ 'economy' ]
        });

        this.push([
            { type: 'item', required: true, name: 'container' },
            { type: 'number', required: false, name: 'slot' }
        ], async (context, parameters) => {
            let items = context.economy.items;

            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (items[parameters[0]].tags.includes('container')) {
                let inventory = context.inventory.get(context.user.id);
                await inventory.init();

                if (inventory.containers.has(parameters[0])) {
                    let slot = 1;
                    if (parameters[1] > 1) { slot = parameters[1] }
                    let containers = inventory.containers.get(parameters[0]);
                    if (containers[slot-1] != undefined) {
                        let contents = containers[slot-1].items;
                        let arr = [];

                        for (let c in contents) { arr.push(`${items[c].emoji}x${contents[c]}`) }

                        embed.setDescription(arr.join(' '));
                        embed.setFooter(`${parameters[0]} @ slot ${slot}`);
                    }

                    else { embed.setDescription(`you don't have a ${items[parameters[0]].emoji} @ slot ${slot}`) }
                }

                else { embed.setDescription(`you don't have any ${items[parameters[0]].emoji}`) }
            }

            else { embed.setDescription(`${items[parameters[0]].emoji} isn't a type of container`) }

            context.channel.send({ embeds: [embed] });
        });
    }
}