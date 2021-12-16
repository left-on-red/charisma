let Discord = require('discord.js');

let BotContext = require('./BotContext.js');
let Configs = require('./Configs');

class SlashContext extends BotContext {
    /**
     * 
     * @param {BotContext} context 
     * @param {Discord.CommandInteraction} interaction
     * @param {Configs.LocalConfig} local
     */ 
    constructor(context, interaction, local) {
        super(interaction.client);
        Object.assign(this, context);

        this.guild = interaction.guild;
        this.channel = interaction.channel;
        this.user = interaction.member;
        this.member = interaction.member;

        this.interaction = interaction;

        this.local = local;
    }

    /** @param {string} message */
    reply(message) { return this.interaction.reply(message) }

    /** @param {string} message */
    editReply(message) { return this.interaction.editReply(message) }

    fetchReply() { return this.interaction.fetchReply() }

    deleteReply() { return this.interaction.deleteReply() }

    /** @param {string} message */
    followUp(message) { return this.interaction.followUp(message) }

    editDefer() { return this.interaction.defer() }

    /** @param {string} message */
    ephemeral(message) { return this.interaction.reply({ content: message, ephemeral: true }) }
}

module.exports = SlashContext;