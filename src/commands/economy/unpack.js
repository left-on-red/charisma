var Discord = require('discord.js');
let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'unpack',
            description: 'unpack a container',
            aliases: [ 'open' ],
            tags: [ 'economy' ]
        });

        // unpack <item> [slot]
        this.push([
            { type: 'item', required: true },
            { type: 'number', required: false, name: 'slot' }
        ], async (context, parameters) => {
            let items = context.economy.items;
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            if (!items[parameters[0]].tags.includes('container')) { embed.setDescription(`${items[parameters[0]].emoji} isn't a container item`); return context.channel.send({ embeds: [embed] }) }
    
            let inventory = new context.inventory(context.user.id, context);
            await inventory.init();
    
            if (!inventory.containers.has(parameters[0])) { embed.setDescription(`you don't have a ${items[parameters[0]].emoji} to unpack`); return context.channel.send({ embeds: [embed] }) }
            if (parameters[1] < 1) { embed.setDescription(`please pick a valid slot number`); return context.channel.send({ embeds: [embed] }) }
            if (parameters[1] > inventory.containers.get(parameters[0]).length) { embed.setDescription(`that slot number is too high`); return context.channel.send({ embeds: [embed] }) }
    
            let slot = 0;
            if (parameters[1]) { slot = parameters[1] - 1 }
            let item = inventory.containers.get(parameters[0])[slot];
    
            let boxed = [];
            for (let i in item.items) { boxed.push(`${items[i].emoji}x${item.items[i]}`) }
            
            embed.setDescription(`are you sure you want to unpack ${items[parameters[0]].emoji}${!item.origin ? '' : item.origin != context.user.id ? '' : `(${boxed.join(' ')})`}?`);
    
            context.accept.request(context, embed, async function(sent) {
                let response = new Discord.MessageEmbed();
                response.setColor(sent.embeds[0].hexColor);
                await inventory.refresh();
    
                try {
                    inventory.containers.remove(parameters[0], slot);
                    for (let i in item.items) { inventory.items.add(i, item.items[i]) }
                    await inventory.append();
                    response.setDescription(`you opened the ${items[parameters[0]].emoji} and got:\n${boxed.join(' ')}`);
                }
    
                catch(error) { context.log.error(error); response.setDescription(`an error occured while unpacking...`) }
    
                sent.edit({ embeds: [response] });
            });
        });
    }
}