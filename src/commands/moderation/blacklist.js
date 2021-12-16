var Discord = require('discord.js');
let Command = require('./../../core/Command.js');

// TODO: role blacklists
module.exports = class extends Command {
    constructor() {
        super({
            name: 'blacklist',
            description: 'used for managing command blacklisting',
            permissions: [ 'GUILD.MANAGE' ],
            tags: [ 'management', 'utility' ]
        });

        // blacklist get <user>
        this.push([
            { type: 'string', required: true, value: 'get' },
            { type: 'mention', required: true, name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let member = await context.guild.members.fetch(parameters[1]);

            if (!context.local.guild.blacklist[parameters[1]] || context.local.guild.blacklist[parameters[1]].length == 0) { embed.setDescription(`**${member.user.tag}** doesn't have any commands blacklisted`) }
            else {
                embed.setTitle(`${member.user.tag}'s blacklist`);
                embed.setDescription(context.local.guild.blacklist[parameters[1]].join(',\n'));
            }
    
            context.channel.send({ embeds: [embed] });
        });

        // blacklist add <user> <command>
        this.push([
            { type: 'string', required: true, value: 'add' },
            { type: 'mention', required: true, name: 'user' },
            { type: 'command', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let member = await context.guild.members.fetch(parameters[1]);
            if (!context.local.guild.blacklist[parameters[1]]) { context.local.guild.blacklist[parameters[1]] = [] }
            if (context.local.guild.blacklist[parameters[1]].includes(parameters[2])) { embed.setDescription(`**${member.user.tag}** is already blacklisted from using **${parameters[2]}**`) }
            else {
                context.local.guild.blacklist[parameters[1]].push(parameters[2]);
                embed.setDescription(`**${member.user.tag}** has been blacklisted from using the **${parameters[2]}** command`);
            }
    
            context.channel.send({ embeds: [embed] });
        });

        // blacklist remove <user> <command>
        this.push([
            { type: 'string', required: true, value: 'remove' },
            { type: 'mention', required: true, name: 'user' },
            { type: 'command', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let member = await context.guild.members.fetch(parameters[1]);
            if (!context.local.guild.blacklist[parameters[1]]) { context.local.guild.blacklist[parameters[1]] = [] }
            if (context.local.guild.blacklist[parameters[1]].includes(parameters[2])) {
                let index = context.local.guild.blacklist[parameters[1]].indexOf(parameters[2]);
                context.local.guild.blacklist[parameters[1]].splice(index, 1);
                if (context.local.guild.blacklist[parameters[1]].length == 0) { delete context.local.guild.blacklist[parameters[1]] }
                embed.setDescription(`**${member.user.tag}** is no longer blacklisted from using the **${parameters[2]}** command`);
            }

            else { embed.setDescription(`that command isn't blacklisted`) }
    
            context.channel.send({ embeds: [embed] });
        });

        // blacklist clear <user>
        this.push([
            { type: 'string', required: true, value: 'clear' },
            { type: 'mention', required: true, name: 'user' }
        ], async (context, parameters) => {
            let member = await context.guild.members.fetch(parameters[1]);
            if (context.local.guild.blacklist[parameters[1]]) {
                let embed1 = new context.Discord.MessageEmbed();
                embed1.setColor(context.config.bot.accent);
                embed1.setDescription(`are you sure you want to clear the blacklist for that user?`);
                context.accept.request(context, embed1, (sent) => {
                    let embed2 = new context.Discord.MessageEmbed();
                    embed2.setColor(sent.embeds[0].hexColor);
                    embed2.setDescription(`**${member.user.tag}**'s blacklist has been cleared`);
                    delete context.local.guild.blacklist[parameters[1]];

                    sent.edit({ embeds: [embed2] });
                });
            }

            else {
                let embed = new context.Discord.MessageEmbed();
                embed.setDescription(context.local.guild.colors.accent);
                embed.setDescription(`**${member.user.tag}** has no blacklisted commands`);
                context.channel.send({ embeds: [embed] });
            }
        });
    }
}