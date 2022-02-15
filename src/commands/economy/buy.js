let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'buy',
            description: 'buy something from the shop',
            tags: [ 'economy' ]
        });

        this.push([
            { type: 'item', required: true },
            { type: 'number', required: false, name: 'quantity' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let name = parameters[0];
    
            let quantity = 1;
            if (parameters[1]) { quantity = parameters[1] }
            
            let items = context.economy.items;
            let item = items[name];
    
            let inventory = context.inventory.get(context.user.id);
            await inventory.init();
    
            if (context.shop.isAvailable(name)) {
                let price = context.shop.getPrice(name);
                let balance = await context.inventory.getMoney(context, context.user.id);
                if (balance >= (price * quantity)) {
                    if (inventory.items.get(name) == undefined || inventory.items.get(name) + quantity <= 1000000) {
                        await inventory.removeMoney(price * quantity);
                        inventory.items.add(name, quantity);
                        await inventory.append();
    
                        let individual = quantity == 1 ? '' : ` *(${price}g each)*`;
    
                        embed.setDescription(`you purchased ${item.emoji}x${quantity} for **${price * quantity}g**${individual}`);
                    }
    
                    else { embed.setDescription(`you can't buy that much ${item.emoji}`); }
                }
    
                else { embed.setDescription(`you don't have enough money to buy that`) }
            }
    
            else { embed.setDescription(`that item isn't available`) }
    
            embed.setDescription(inventory.obtainedText(embed.description));

            context.channel.send({ embeds: [embed] });
        });
    }
}