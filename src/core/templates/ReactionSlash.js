let Slash = require('./../Slash.js');
let fetch = require('node-fetch');

module.exports = class ReactionSlash extends Slash {
    constructor(action, endpoint, proper) {
        super(action, `${action} someone~!`);

        this.append(Slash.User('recipient', `the user you wish to ${action}`, true).interact(async (context, options) => {
            let response = await fetch(`https://nekos.life/api/v2/img/${endpoint}`);
            let url = (await response.json()).url;

            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            embed.setFooter({ text: 'powered by https://nekos.life/' });

            let to = options.getMember('recipient', true);
            let from = context.member;

            let to_name = context.Discord.Util.escapeMarkdown(to.user.tag);
            let from_name = context.Discord.Util.escapeMarkdown(from.user.tag);

            let description = `**${from_name}** just ${proper} **${to_name}**~!`;

            if (to.id == from.id) { description = `**${from_name}** just ${proper} themselves~!` }
            if (to.id == context.guild.me.id) { description = `**${from_name}** just ${proper} me~!` }

            embed.setDescription(description);
            embed.setImage(url);

            context.reply({ embeds: [embed] });
        }));
    }
}