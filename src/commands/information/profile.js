//let gm = require('gm');

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'profile',
            description: 'get your or someone elses profile card!',
            tags: [ 'information', 'utility', 'economy' ]
        });

        this.push([
            { required: false, type: 'mention', name: 'user' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let member;
            if (parameters[0]) { member = await context.guild.members.fetch(parameters[0]) }
            else { member = context.member }

            let money = await context.inventory.getMoney(context, member.id);
            let karma = await context.data.karma.get(member.id);
            let experience = (await context.data.experience.get(member.id)).user;

            let currentLevel = context.experience.expToLevel(experience, 4);
            let relative = context.experience.getRelative(experience, 4)

            if (member.id != context.member.id) { embed.setAuthor(`requested by ${context.user.tag}`, context.user.avatarURL({ dynamic: true })) }

            embed.addField('money', `$${money}`, true);
            embed.addField('karma', `:outbox_tray: given: ${karma.given}\n:inbox_tray: received: ${karma.received}`, true);
            embed.addField('level', `${currentLevel+1} (${relative[0]}/${relative[1]})\ntotal: ${experience}`, true);
            
            context.channel.send({ embeds: [embed] });
        });
    }
}