let Discord = require('discord.js');
let CommandContext = require('./../CommandContext.js');

class AcceptModule {
    constructor() {
        this.cache = new Map();
    }

    /**
     * 
     * @param {CommandContext} context 
     * @param {Discord.MessageEmbed} embed 
     * @param {(sent: Discord.Message) => {}} callback 
     * @param {boolean} hasCode 
     * @returns 
     */
    request(context, embed, callback, hasCode = false) {
        let guild = context.guild.id;
        let channel = context.channel.id;
        let user = context.user.id;

        if (typeof guild != 'string') { guild = guild.id }
        if (typeof channel != 'string') { channel = channel.id }
        if (typeof user != 'string') { user = user.id }

        if (!this.cache.get(guild)) { this.cache.set(guild, new Map()) }
        if (!this.cache.get(guild).get(channel)) { this.cache.get(guild).set(channel, new Map()) }
        if (this.cache.get(guild).get(channel).get(user) == undefined) {
            if (hasCode) {
                let code = [];
                for (let i = 0; i < 4; i++) { code.push(Math.floor(Math.random() * 9)) }
                this.cache.get(guild).get(channel).set(user, code.join(''));
                embed.setFooter(`do ${context.local.guild.prefix}accept ${code.join('')} to confirm`);
            }

            else {
                this.cache.get(guild).get(channel).set(user, false);
                embed.setFooter(`do ${context.local.guild.prefix}accept to confirm`);
            }

            context.channel.send({ embeds: [embed] }).then((sent) => {
                let count = 0;
                let interval = setInterval(() => {
                    count += 1;
                    if (this.cache.get(guild).get(channel).get(user) == true) {
                        this.cache.get(guild).get(channel).delete(user);
                        if (this.cache.get(guild).get(channel).size == 0) { this.cache.get(guild).delete(channel) }
                        if (this.cache.get(guild).size == 0) { this.cache.delete(guild) }
                        clearInterval(interval);
                        callback(sent);
                    }

                    else if (count == 300) {
                        this.cache.get(guild).get(channel).delete(user);
                        if (this.cache.get(guild).get(channel).size == 0) { this.cache.get(guild).delete(channel) }
                        if (this.cache.get(guild).size == 0) { this.cache.delete(guild) }

                        let timeout = new Discord.MessageEmbed();
                        timeout.setColor(sent.embeds[0].hexColor);
                        timeout.setDescription(`the request has timed out!`);
                        clearInterval(interval);
                        sent.edit({ embeds: [timeout] })
                    }
                }, 100)
            });
        }

        else {
            embed.setDescription(`you already have a pending request!`);
            context.channel.send({ embeds: [embed] });
        }
    }
}

module.exports = AcceptModule;