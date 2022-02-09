let Discord = require('discord.js');

let BotContext = require('./BotContext.js');
let Configs = require('./Configs');

class CommandContext extends BotContext {
    /**
     * 
     * @param {any} context 
     * @param {Discord.Client} client
     * @param {Discord.Message} message 
     * @param {Object} blacklist 
     * @param {Object} whitelist 
     * @param {Configs.LocalConfig} local
     */ 
     
    constructor(context, client, message, blacklist, whitelist, local) {
        super(client);
        Object.assign(this, context);

        this.log = this.logging.getReference(`guild.${message.guild.id}`);

        this.guild = message.guild;
        this.channel = message.channel;
        this.user = message.author;
        this.member = message.member;
        this.message = message;

        this.blacklist = blacklist;
        this.whitelist = whitelist;
        this.local = local;

        /**
         * 
         * @param {Discord.MessageEmbed} embed 
         * @returns {Promise<Discord.Message>}
         */
        this.sendEmbed = (embed) => this.channel.send({ embeds: [ embed ] })
    }
}

module.exports = CommandContext;