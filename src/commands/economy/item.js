let profit_arrow = '<:profit_arrow:816149408855883787>';
let loss_arrow = '<:loss_arrow:816153828381949953>';

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'item',
            description: 'look up an item',
            tags: [ 'economy' ]
        });

        // item <item>
        this.push([
            { type: 'item', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let item = context.economy.items[parameters[0]];
    
            embed.addField('emoji', item.emoji, true);
    
            if (item.shoppable) {
                let currentDay = context.shop.getDay();
                let lastAvailable = currentDay-1;
    
                while (!context.shop.isAvailable(parameters[0], lastAvailable)) { lastAvailable -= 1 }
    
                let dayDifference = currentDay - lastAvailable;
    
                if (context.shop.isAvailable(parameters[0])) {
                    let nowBuy = context.shop.getPrice(parameters[0]);
                    let thenBuy = context.shop.getPrice(parameters[0], lastAvailable);
                    let buyReflect = nowBuy > thenBuy ? profit_arrow : loss_arrow;
                    embed.addField('buy price', `${nowBuy}g ${buyReflect}${dayDifference > 1 ? ` *(last available ${dayDifference} days ago)*` : ''}`);
                }
    
                else { embed.addField('buy price', `${dayDifference > 1 ? `*last available ${dayDifference} days ago*` : 'currently not available'}`) }
    
                let nowSell = context.shop.getValue(parameters[0]);
                let thenSell = context.shop.getValue(parameters[0], lastAvailable);
                let sellReflect = nowSell > thenSell ? profit_arrow : loss_arrow;
                embed.addField('sell price', `${nowSell}g ${sellReflect}`, true);
            }
    
            //if (item.shoppable) { embed.addField('buy price', context.shop.isAvailable(parameters[0]) ? `${context.shop.getPrice(parameters[0])}g ${context.shop.getPrice(parameters[0]) > item.value ? ':arrow_up:' : ':arrow_down:'}` : `currently not available`, true) }
            //if (!(item.tags.includes('key') || item.tags.includes('container'))) { embed.addField('sell price', `${context.shop.getValue(parameters[0])}g ${context.shop.getValue(parameters[0]) > item.value ? ':arrow_up:' : ':arrow_down:'}`, true) }
    
            embed.setFooter(item.tags.join(', '));
    
            //console.log(item);
    
            context.channel.send({ embeds: [embed] });
        });
    }
}