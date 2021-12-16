let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'queue',
            description: 'get the queue of selected songs',
            tags: [ 'fun', 'music' ]
        });

        this.push([{ type: 'number', required: false, name: 'page' }], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let result = context.music.check(context);
            if (result == -1) {
                let queue = context.music.instances.get(context.guild.id).queue;

                if (queue.length > 0) {

                    let maxPage = Math.ceil(queue.length / 10) - 1;
                    let page = parameters[0] ? parameters[0] - 1 : 0;
                    if (page < 0) { page = 0 }

                    let arr = [];
                    if (page <= maxPage) {
                        for (let i = 0; i < 10; i++) {
                            if (queue[(page * 10) + i]) {
                                if (page == 0 && i == 0) { arr.push(`**${(page * 10) + i + 1}: ${queue[(page * 10) + i].title}**`) }
                                else { arr.push(`${(page * 10) + i + 1}: ${queue[(page * 10) + i].title}`) }
                            }
                        }

                        embed.setDescription(arr.join('\n'));
                        embed.setFooter(`page ${page + 1}/${maxPage + 1}`);
                    }

                    else { embed.setDescription(`please specify a smaller page number`) }
                }

                else { embed.setDescription(`there's currently no music in the queue`) }
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}