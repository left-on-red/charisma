let Slash = require('./../../core/Slash.js');
let Discord = require('discord.js');

module.exports = class extends Slash {
    constructor() {
        super('queue', 'inspect the music queue');

        this.interact(async (context, options) => {
            let result = context.music.check(context);

            if (result == -1) {
                if (context.music.instances.has(context.guild.id)) {
                    let queue = context.music.instances.get(context.guild.id).queue;

                    let maxPage = Math.ceil(queue.length / 10) - 1;
                    let page = 0;

                    let getEmbed = () => {
                        let embed = new Discord.MessageEmbed();
                        embed.setColor(context.config.guild.colors.accent);

                        let arr = [];
                        for (let i = 0; i < 10; i++) {
                            if (queue[(page * 10) + i]) {
                                if (page == 0 && i == 0) { arr.push(`**${(page * 10) + i + 1}: ${queue[(page * 10) + i].title}**`) }
                                else { arr.push(`${(page * 10) + i + 1}: ${queue[(page * 10) + i].title}`) }
                            }
                        }

                        embed.setDescription(arr.join('\n'));
                        embed.setFooter(`page ${page + 1}/${maxPage + 1}`);

                        return embed;
                    }

                    let getComponent = () => {
                        let row = new Discord.MessageActionRow();

                        let back = new Discord.MessageButton()
                            .setCustomId('queue-back')
                            .setLabel('◀')
                            .setStyle('SECONDARY')
                            .setDisabled(page == 0);

                        let forward = new Discord.MessageButton()
                            .setCustomId('queue-forward')
                            .setLabel('▶')
                            .setStyle('SECONDARY')
                            .setDisabled(page == maxPage)

                        row.addComponents([back, forward]);
                        return row;
                    }

                    let message = await context.reply({
                        ephemeral: true,
                        embeds: [getEmbed()],
                        components: [getComponent()],
                        fetchReply: true
                    });

                    let loop = async () => {
                        try {
                            let data = await message.awaitMessageComponent({ filter: (interaction) => interaction.user.id == context.user.id, time: 30000 });
                            if (data.customId == 'queue-back') { page -= 1 }
                            else if (data.customId == 'queue-forward') { page += 1 }

                            data.deferUpdate();

                            message = await context.editReply({
                                ephemeral: true,
                                embeds: [getEmbed()],
                                components: [getComponent()],
                                fetchReply: true
                            });

                            await loop();
                        }

                        catch(e) { await context.editReply({ content: 'interaction ended...', embeds: [], components: [] }) }
                    }

                    await loop();
                }

                else { context.ephemeral('the queue is currently empty') }
            }

            else { context.ephemeral(context.music.errors[result]) }
        });
    }
}