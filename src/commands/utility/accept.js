let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'accept',
            description: 'accept something!',
            tags: [ 'management', 'utility' ]
        });

        this.push([
            { type: 'string', required: false, name: 'code' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let guild = context.guild.id;
            let channel = context.channel.id;
            let user = context.user.id;

            if (context.accept.cache.get(guild) && context.accept.cache.get(guild).get(channel) && context.accept.cache.get(guild).get(channel).get(user) != undefined) {
                let isPassword = context.accept.cache.get(guild).get(channel).get(user) != false;
                let accepted = false;
                if (isPassword) { if (parameters[0] && parameters[0] == context.accept.cache.get(guild).get(channel).get(user)) { accepted = true } }
                else { accepted = true }
    
                if (!accepted) { embed.setDescription(`incorrect password`) }
                else { context.accept.cache.get(guild).get(channel).set(user, true) }
            }
    
            else { embed.setDescription(`there's no pending requests`) }
    
            if (embed.description) { context.channel.send({ embeds: [embed] }) }
        });
    }
}