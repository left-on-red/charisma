var Discord = require('discord.js');
let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'spawn',
            description: 'spawns things with magic or something',
            permissions: [ 'BOT.MASTER' ]
        });

        // spawn money <amount> [mention]
        this.push([
            { type: 'string', required: true, value: 'money' },
            { type: 'number', required: true, name: 'amount' },
            { type: 'mention', required: false }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let member = context.member;
            if (parameters[2]) { member = await context.guild.members.fetch(parameters[2]) }
    
            await context.inventory.addMoney(context, member.id, parameters[1]);

            embed.setDescription(`added **${parameters[1]}g** to **${member.user.tag}'s** balance`);
            context.channel.send({ embeds: [embed] });
        });

        // spawn experience <amount>
        this.push([
            { type: 'string', required: true, value: 'experience' },
            { type: 'number', required: true, name: 'amount' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            context.experience.add(context, parameters[1]);
            embed.setDescription(`added **${parameters[1]} experience** to **${context.user.username}#${context.user.discriminator}**`);
    
            context.channel.send({ embeds: [embed] });
        });

        // spawn item <item> [quantity] [mention]
        this.push([
            { type: 'string', required: true, value: 'item' },
            { type: 'item', required: true },
            { type: 'number', required: false, name: 'quantity' },
            { type: 'mention', required: false }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let member = context.member;
            if (parameters[3]) { member = await context.guild.members.fetch(parameters[3]) }
    
            let item = parameters[1];

            if (!context.economy.items[item].tags.includes('key') && !context.economy.items[item].tags.includes('container')) {
                let count = parameters[2] || 1;
                //if (parameters[2]) { count = parameters[2] }
                //if (count < 1) { count = 1 }
    
                let inventory = new context.inventory(member.id, context);
                await inventory.init();
                inventory.items.add(item, count);
                await inventory.append();
    
                if (member.id == context.user.id) { embed.setDescription(`you gave yourself ${context.economy.items[item].emoji}x${count}`) }
                else { embed.setDescription(`**${member.user.tag}** was given ${context.economy.items[item].emoji}x${count}`) }
            }

            else { embed.setDescription(`${context.economy.items[item].emoji} is not a normal item`) }

            context.channel.send({ embeds: [embed] });
        });

        // spawn key <item> [mention]
        this.push([
            { type: 'string', required: true, value: 'key' },
            { type: 'item', required: true, name: 'item' },
            { type: 'mention', required: false }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (context.economy.items[parameters[1]].tags.includes('key')) {
                let member = context.member;
                if (parameters[2]) { member = await context.guild.members.fetch(parameters[2]) }

                try {
                    let inventory = new context.inventory(member.id, context);
                    await inventory.init();
                    inventory.keys.add(parameters[1]);

                    if (member.id == context.user.id) { embed.setDescription(`you gave yourself ${context.economy.items[parameters[1]].emoji}`) }
                    else { embed.setDescription(`**${member.user.tag}** was given ${context.economy.items[parameters[1]].emoji}`) }

                    await inventory.append();
                }

                catch(e) { console.error(e); embed.setDescription(`an error occured!`) }
            }

            else { embed.setDescription(`${context.economy.items[parameters[1]].emoji} is not a key item`) }

            context.channel.send({ embeds: [embed] });
        });
    }
}