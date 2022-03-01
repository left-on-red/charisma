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

    /**
     * @param {string|Discord.InteractionReplyOptions} message
     * @returns {Promise<Discord.Message>|Promise<void>}
     */
    reply(message) { return this.interaction.reply(message) }

    /**
     * @param {string|Discord.InteractionReplyOptions} message
     * @returns {Promise<Discord.Message|void>}
     */
    editReply(message) { return this.interaction.editReply(message) }

    /** @returns {Promise<Discord.Message>} */
    fetchReply() { return this.interaction.fetchReply() }

    /** @returns {Promise<void>} */
    deleteReply() { return this.interaction.deleteReply() }

    /**
     * @param {string|Discord.InteractionReplyOptions} message
     * @returns {Promise<Discord.Message|void>}
     */
    followUp(message) { return this.interaction.followUp(message) }

    /**
     * 
     * @param {Discord.InteractionDeferReplyOptions} opts 
     * @returns {Promise<Discord.Message|void>}
     */
    defer(opts) { return this.interaction.deferReply(opts) }

    /** @param {string} message */
    ephemeral(message) { return this.interaction.reply({ content: message, ephemeral: true }) }
}

module.exports = SlashContext;