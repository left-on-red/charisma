let Command = require('./../../core/Command.js');

let profit_arrow = '<:profit_arrow:940457372701327430>';
let loss_arrow = '<:loss_arrow:940457354607095808>';
let neutral_dash = '<:neutral_dash:940457381832323182>';

module.exports = class extends Command {
    constructor() {
        super({
            name: 'prices',
            description: 'look up the prices of an item',
            tags: [ 'economy' ]
        });

        // prices buy <item>
        this.push([
            { type: 'string', required: true, value: 'buy' },
            { type: 'item', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let currentDay = context.shop.getDay();
    
            embed.setTitle(`${parameters[1]} buy prices (last 10 days)`);
            embed.setFooter('*sunday');

            let arr = [];

            for (let i = 9; i >= 0; i--) {
                let sunday = (currentDay-i) % 7 == 0;
                if (sunday) { arr.push(`--------- start of week ---------`) }
                let str = `${neutral_dash} (${i == 0 ? 'today' : `day ${Math.abs(i - 10)}`}) - was not available`;
                if (context.shop.isAvailable(parameters[1], currentDay-i)) {
                    let lastAvailable = currentDay-i-1;
                    while (!context.shop.isAvailable(parameters[1], lastAvailable)) { lastAvailable -= 1 }
                    let now = context.shop.getPrice(parameters[1], currentDay-i);
                    let then = context.shop.getPrice(parameters[1], lastAvailable);
                    let reflect = now == then ? neutral_dash : now > then ? profit_arrow : loss_arrow;
                    str = `${reflect} (${i == 0 ? `today${sunday ? '\\*' : ''}` : `day ${Math.abs(i - 10)}`}${sunday ? '\\*' : ''}) - sold for **${now}g**`;
                }

                arr.push(str);
            }

            embed.setDescription(arr.join('\n'));

            context.channel.send({ embeds: [embed] });
        });

        // prices sell <item>
        this.push([
            { type: 'string', required: true, value: 'sell' },
            { type: 'item', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let currentDay = context.shop.getDay();
    
            embed.setTitle(`${parameters[1]} sell prices (last 10 days)`);
            embed.setFooter('*sunday');

            let arr = [];
            for (let i = 9; i >= 0; i--) {
                let sunday = (currentDay-i) % 7 == 0;
                if (sunday) { arr.push(`--------- start of week ---------`) }
                let now = context.shop.getValue(parameters[1], currentDay-i);
                let then = context.shop.getValue(parameters[1], currentDay-i-1);
                let reflect = now == then ? neutral_dash : now > then ? profit_arrow : loss_arrow;
                arr.push(`${reflect} (${i == 0 ? `today${sunday ? '\\*' : ''}` : `day ${Math.abs(i - 10)}${sunday ? '\\*' : ''}`}) - bought for **${now}g**`);
            }

            embed.setDescription(arr.join('\n'));

            context.channel.send({ embeds: [embed] });
        });
    }
}