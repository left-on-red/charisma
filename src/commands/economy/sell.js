var Discord = require('discord.js');
let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'sell',
            description: 'sell something',
            tags: [ 'economy' ]
        });

        // sell <item> [quantity]
        this.push([
            { type: 'item', required: true },
            { type: 'number', required: false, name: 'quantity' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let quantity = 1;
            if (parameters[1]) { quantity = parameters[1] }
        
            let inventory = new context.inventory(context.user.id, context);
            await inventory.init();

            if (!(context.economy.items[parameters[0]].tags.includes('key') || context.economy.items[parameters[0]].tags.includes('container'))) {
                if (inventory.items.has(parameters[0])) {
                    if (inventory.items.get(parameters[0]) < quantity) { embed.setDescription(`you don't have ${context.economy.items[parameters[0]].emoji}x${quantity}`) }
                    else {
                        let value = context.shop.getValue(parameters[0]);
                        let total = value * quantity;
    
                        inventory.items.remove(parameters[0], quantity);
                        let individuals = quantity == 1 ? '' : ` *(${Math.floor(total / quantity)}g each)*`;
    
                        inventory.money.add(total);
                        await inventory.append();
    
                        embed.setDescription(`you sold ${context.economy.items[parameters[0]].emoji}x${quantity} and got **${total}g**${individuals}`);
                    }
                }
    
                else { embed.setDescription(`you don't have any ${context.economy.items[parameters[0]].emoji}'s`) }
            }

            else { embed.setDescription(`${context.economy.items[parameters[0]].emoji} isn't a sellable item`) }

            embed.setDescription(`${inventory.obtainedText(embed.description)}`);
            context.channel.send({ embeds: [embed] });
        });

        // sell <item> all
        this.push([
            { type: 'item', required: true },
            { type: 'string', required: true, value: 'all' }
        ], async (context, parameters) => {
            let embed = new Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (!(context.economy.items[parameters[0]].tags.includes('key') || context.economy.items[parameters[0]].tags.includes('container'))) {
                let inventory = new context.inventory(context.user.id, context);
                await inventory.init();

                if (inventory.items.has(parameters[0])) {
                    let quantity = inventory.items.get(parameters[0]);

                    if (quantity > 10) {
                        embed.setDescription(`you're attempting to sell more than ${context.economy.items[parameters[0]].emoji}x10`);

                        context.accept.request(context, embed, async function(sent) {
                            let editEmbed = new context.Discord.MessageEmbed();
                            editEmbed.setColor(sent.embeds[0].hexColor);
                            
                            await inventory.refresh();
                            quantity = inventory.items.get(parameters[0]);
                            let value = context.shop.getValue(parameters[0]);
                            let total = value * quantity;

                            inventory.items.remove(parameters[0], quantity);
                            let individuals = quantity == 1 ? '' : ` *(${value}g each)*`;

                            inventory.money.add(total);
                            inventory.append();

                            editEmbed.setDescription(`you sold ${context.economy.items[parameters[0]].emoji}x${quantity} and got **${total}g**${individuals}`)
                            sent.edit({ embeds: [editEmbed] });
                        });
                    }

                    else {
                        let value = context.shop.getValue(parameters[0]);
                        let total = value * quantity;

                        inventory.items.remove(parameters[0], quantity);
                        let individuals = quantity == 1 ? '' : ` *(${value}g each)*`;

                        inventory.money.add(total);
                        await inventory.append();

                        embed.setDescription(`you sold ${context.economy.items[parameters[0]].emoji}x${quantity} and got **${total}g**${individuals}`);
                        context.channel.send({ embeds: [embed] });
                    }
                }
    
                else { embed.setDescription(`you don't have any ${context.economy.items[parameters[0]].emoji}`); context.channel.send({ embeds: [embed] }) }
            }

            else { embed.setDescription(`${context.economy.items[parameters[0]].emoji} isn't a sellable item`); context.channel.send({ embeds: [embed] }) }
        });
    }
}