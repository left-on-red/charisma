var Discord = require('discord.js');
let CommandContext = require('./../core/CommandContext.js');
let config = require('./../../config.json');

module.exports = {
    // direct integration with the discord.js permission flags
    // checks both the user and the bot for permissions

    /**
     * 
     * @param {string} permission 
     * @param {CommandContext} context 
     * @returns 
     */
    DISCORD: async function(permission, context) {
        var toReturn = { userPerms: false, botPerms: false, master: false }
        if (context.Discord.Permissions.FLAGS[permission]) {
            if (!context.member.permissions.has(Discord.Permissions.FLAGS[permission])) { toReturn.userPerms = false }
            if (!context.guild.me.permissions.has(Discord.Permissions.FLAGS[permission])) { toReturn.botPerms = false }
        }

        return toReturn;
    },

    /**
     * 
     * @param {string} permission 
     * @param {CommandContext} context 
     */
    BOT: async function(permission, context) {
        let toReturn = { userPerms: true, botPerms: true, master: false }

        if (permission == 'MASTER') {
            toReturn.userPerms = false;
            if (context.user.id == config.master) { toReturn.userPerms = true }
        }

        else {
            if (context.Discord.Permissions.FLAGS[permission]) {
                if (!context.guild.me.permissions.has(Discord.Permissions.FLAGS[permission])) { toReturn.botPerms = false }
            }
        }

        return toReturn;
    },

    /*BOT: {
        // is the user the "bot master"
        MASTER: async function(permission, context) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (context.member.user.id != context.config.main.master) { toReturn.userPerms = false; toReturn.master = true; }
            return toReturn;
        }
    },*/

    GUILD: {
        // is the user the owner of the guild
        OWNER: async function(permission, passthrough) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (passthrough.member.user.id != passthrough.guild.ownerID) { toReturn.userPerms = false }
            return toReturn;
        },

        // can the user manage the guild (only checks the user, not the bot)
        MANAGE: async function(permission, passthrough) {
            var toReturn = { userPerms: true, botPerms: true, master: false }
            if (!passthrough.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD)) { toReturn.userPerms = false }
            return toReturn;
        }
    }
}