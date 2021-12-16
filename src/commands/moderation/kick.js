let Command = require('./../../core/Command.js');

// TODO: add a check to make sure it doesn't try to kick anyone that's hierarchically above the bot or allow someone to kick someone that's above them
module.exports = class extends Command {
    constructor() {
        super({
            name: 'kick',
            description: 'kicks whoever you specify',
            permissions: [ 'DISCORD.KICK_MEMBERS' ],
            tags: [ 'management', 'admin' ]
        });

        this.push([
            { type: 'mention', required: true, name: 'member' },
            { type: 'string', required: false, name: 'reason' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let id = parameters[0];
            let reason = null;
            if (parameters[1] != undefined) { reason = parameters[1] }
        
            if (context.user.id != id) {
                let member = await context.guild.members.fetch(id);
                
                if (reason) {
                    await member.kick(reason);
                    embed.setDescription(`**${member.user.tag}** has been kicked for **"${reason}"**`);
                }
                else {
                    await member.kick();
                    embed.setDescription(`**${member.user.tag}** has been kicked`);
                }
            }
        
            else { embed.setDescription(`you can't kick yourself`) }
    
            context.channel.send({ embeds: [embed] });
        });
    }
}