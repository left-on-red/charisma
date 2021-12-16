let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'avatar',
            description: 'gets a users avatar',
            tags: [ 'utility', 'information' ]
        });

        this.push([
            { type: 'mention', required: false, name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let id = context.user.id;
            if (parameters[0]) { id = parameters[0] }
    
            let member = await context.guild.members.fetch(id);
            let avatar = member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 })
    
            embed.setImage(avatar);
    
            context.channel.send({ embeds: [embed] });
        });
    }
}