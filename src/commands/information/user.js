let moment = require('moment');

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'user',
            description: 'gets information related to a user',
            aliases: [ 'userinfo' ],
            tags: [ 'information', 'utility' ]
        });

        // user [user]
        this.push([
            { type: 'mention', required: false, name: 'user' }
        ], async (context, parameters) => {
            var embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let member = context.member;
            if (parameters[0]) { member = await context.guild.members.fetch(parameters[0]) }
        
            embed.setTitle(member.user.tag);
            embed.addField('id', member.id, true);
            if (member.nickname) { embed.addField('nickname', member.nickname, true) }

            embed.addField('joined', moment(member.joinedAt).format('llll'));
            embed.addField('created', moment(member.user.createdAt).format('llll'));
            
            embed.setThumbnail(member.user.avatarURL({ format: 'png' }));
    
            context.channel.send({ embeds: [embed] });
        });

        this.push([
            { type: 'string', required: true, value: 'permissions' },
            { type: 'mention', required: false, name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let member = context.member;
            if (parameters[1]) { member = await context.guild.members.fetch(parameters[1]) }

            embed.setAuthor(`${member.user.tag} - permissions`, member.user.avatarURL({ format: 'png' }));

            let permArr = [];
            let discordPerms = member.permissions.serialize();
            for (let d in discordPerms) { if (discordPerms[d]) { permArr.push(`\`DISCORD.${d}\``) } }
    
            embed.setDescription(permArr.join(', '));

            context.channel.send({ embeds: [embed] });
        });
    }
}