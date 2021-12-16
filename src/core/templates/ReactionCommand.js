let Command = require('./../Command.js');
let fetch = require('node-fetch');

module.exports = class ReactionCommand extends Command {
    constructor(action, endpoint, proper) {
        super({
            name: action,
            description: `${action} someone~!`,
            nsfw: false,
            tags: [ 'fun' ]
        });

        this.push([
            { type: 'mention', required: true, name: 'user' }
        ], async (context, parameters) => {
            let response = await fetch(`https://nekos.life/api/v2/img/${endpoint}`);
            let url = (await response.json()).url;

            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            embed.setFooter('powered by https://nekos.life/');

            let to = await context.guild.members.fetch(parameters[0]);
            let from = context.member;

            let to_name = context.Discord.Util.escapeMarkdown(to.user.tag);
            let from_name = context.Discord.Util.escapeMarkdown(from.user.tag);

            let description = `**${from_name}** just ${proper} **${to_name}**~!`;

            if (to.id == from.id) { description = `**${from_name}** just ${proper} themselves~!` }
            if (to.id == context.guild.me.id) { description = `**${from_name}** just ${proper} me~!` }

            embed.setDescription(description);
            embed.setImage(url);

            context.channel.send({ embeds: [embed] });

            //context.channel.send({ embeds: [await context.reactions.getEmbed(action, context.member, await context.guild.members.fetch(parameters[0]), context)] });
        });
    }
}