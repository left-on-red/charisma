let Command = require('./../../core/Command.js');

// TODO: role whitelists
module.exports = class extends Command {
    constructor() {
        super({
            name: 'whitelist',
            description: 'used for managing command whitelisting',
            permissions: [ 'GUILD.MANAGE' ],
            tags: [ 'management', 'admin' ]
        });

        // whitelist get <command>
        this.push([
            { type: 'string', required: true, value: 'get' },
            { type: 'command', required: true }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (context.local.guild.whitelist[parameters[1]] && context.local.guild.whitelist[parameters[1]].length > 0) {
                let members = [];
                for (let m = 0; m < context.local.guild.whitelist[parameters[1]].length; m++) {
                    let member = await context.guild.members.fetch(context.local.guild.whitelist[parameters[1]][m]);
                    members.push(member.user.tag);
                }

                embed.setTitle(`${context.local.guild.prefix}${parameters[1]} whitelist`);
                embed.setDescription(members.join(', '));
            }

            else { embed.setDescription(`that command doesn't have a whitelist`) }
        
            context.channel.send({ embeds: [embed] });
        });

        // whitelist add <command> <user>
        this.push([
            { type: 'string', required: true, value: 'add' },
            { type: 'command', required: true },
            { type: 'mention', required: true, name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let member = await context.guild.members.fetch(parameters[2]);

            if (!context.local.guild.whitelist[parameters[1]]) { context.local.guild.whitelist[parameters[1]] = [] }

            if (!context.local.guild.whitelist[parameters[1]].includes(parameters[2])) {
                context.local.guild.whitelist[parameters[1]].push(parameters[2]);
                embed.setDescription(`**${member.user.tag}** has been added to the **${parameters[1]}** whitelist`);
            }

            else { embed.setDescription(`that command is already whitelisted for that user`) }
        
            context.channel.send({ embeds: [embed] });
        });

        // whitelist remove <command> <user>
        this.push([
            { type: 'string', required: true, value: 'remove' },
            { type: 'command', required: true },
            { type: 'mention', required: true, name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (context.local.guild.whitelist[parameters[1]] && context.local.guild.whitelist[parameters[1]].length > 0) {
                if (context.local.guild.whitelist[parameters[1]].includes(parameters[2])) {
                    let member = await context.guild.members.fetch(parameters[2]);
                    let index = context.local.guild.whitelist[parameters[1]].indexOf(parameters[2]);
                    context.local.guild.whitelist[parameters[1]].splice(index, 1);
                    if (context.local.guild.whitelist[parameters[1]].length == 0) { delete context.local.guild.whitelist[parameters[1]] }
                    embed.setDescription(`**${member.user.tag}** has been removed from the **${parameters[1]}** whitelist`);
                }

                else { embed.setDescription(`that command isn't whitelisted for that user`) }
            }

            else { embed.setDescription(`that command doesn't have a whitelist`) }
        
            context.channel.send({ embeds: [embed] });
        });

        // whitelist clear <command>
        this.push([
            { type: 'string', required: false, value: 'clear' },
            { type: 'command', required: true }
        ], async (context, parameters) => {
            if (context.local.guild.whitelist[parameters[1]]) {
                let embed1 = new context.Discord.MessageEmbed();
                embed1.setColor(context.config.bot.accent);
                embed1.setDescription(`are you sure you want to clear the whitelist for that command?`);
                context.accept.request(context, embed1, (sent) => {
                    let embed2 = new context.Discord.MessageEmbed();
                    embed2.setColor(sent.embeds[0].hexColor);
                    embed2.setDescription(`the **${parameters[1]}** whitelist has been cleared`);

                    delete context.local.guild.whitelist[parameters[1]];

                    sent.edit({ embeds: [embed2] });
                });
            }

            else {
                let embed = new context.Discord.MessageEmbed();
                embed.setColor(context.config.bot.accent);
                embed.setDescription(`that command doesn't have a whitelist`);
                context.channel.send({ embeds: [embed] });
            }
        });
    }
}