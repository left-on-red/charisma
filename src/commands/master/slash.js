var Discord = require('discord.js');
let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'slash',
            description: 'register or unregister slash command data structures',
            permissions: [ 'BOT.MASTER' ]
        });
        
        // slash register global <slash>
        this.push([
            { type: 'string', required: true, value: 'register' },
            { type: 'string', required: true, value: 'global' },
            { type: 'slash', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let command = context.slashes.get(parameters[2].toLowerCase()).raw();
            context.client.application.commands.create(command);
            embed.setDescription(`registered \`${parameters[2]}\` globally`);
            
            context.channel.send({ embeds: [embed] });
        });

        // slash register local <slash>
        this.push([
            { type: 'string', required: true, value: 'register' },
            { type: 'string', required: true, value: 'local' },
            { type: 'slash', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let command = context.slashes.get(parameters[2]).raw();
            context.guild.commands.create(command);
            embed.setDescription(`registered \`${parameters[2]}\` locally`)
    
            context.channel.send({ embeds: [embed] });
        });

        // slash unregister global <slash>
        this.push([
            { type: 'string', required: true, value: 'unregister' },
            { type: 'string', required: true, value: 'global' },
            { type: 'slash', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let command = (await context.client.application.commands.fetch()).find(v => v.name == parameters[2]).id;
            context.client.application.commands.delete(command);
            embed.setDescription(`unregistered \`${parameters[2]}\` globally`);
            
            context.channel.send({ embeds: [embed] });
        });

        // slash unregister local <slash>
        this.push([
            { type: 'string', required: true, value: 'unregister' },
            { type: 'string', required: true, value: 'local' },
            { type: 'slash', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let command = (await context.guild.commands.fetch()).find(v => v.name == parameters[2]).id;
            context.guild.commands.delete(command);
            embed.setDescription(`unregistered \`${parameters[2]}\` locally`);
            
            context.channel.send({ embeds: [embed] });
        });
    }
}