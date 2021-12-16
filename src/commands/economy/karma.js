let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'karma',
            description: 'give someone karma!',
            tags: [ 'economy' ],
            aliases: [ 'rep', 'r', 'k' ],
            cooldown: 86400000
        });

        this.push([
            { required: true, type: 'mention', name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            if (parameters[0] != context.user.id) {
                let to = await context.data.karma.get(parameters[0]);
                to.received += 1;
    
                let from = await context.data.karma.get(context.user.id);
                from.given += 1;
    
                let member = await context.guild.members.fetch(parameters[0]);
    
                await context.data.karma.update(parameters[0], to);
                await context.data.karma.update(context.user.id, from);
    
                embed.setDescription(`you gave **${member.user.tag}** +1 karma!`);
            }
    
            else { embed.setDescription(`you can't give yourself karma!`); context.local.user.cooldowns.karma = -1; }
            
            context.channel.send({ embeds: [embed] });
        });
    }
}