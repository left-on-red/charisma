let BotContext = require('./../core/BotContext.js');
let SlashContext = require('./../core/SlashContext.js');

function clone(obj) {
    var copy;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) { copy[i] = clone(obj[i]) }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]) }
        return copy;
    }

    throw new Error(`unable to copy obj! it's type isn't supported`);
}

/**
 * 
 * @param {BotContext} context 
 */
module.exports = async function(context) {
    context.client.on('interactionCreate', async (interaction) => {
        if (interaction.isCommand()) {
            if (!context.data) {
                guild = context.config.defaults.guild;
                user = context.config.defaults.user;
            }
        
            else {
        
                function iterate(base, obj) {
                    /*for (let b in base) {
                        if (obj[b] == undefined) {
                            if (base[b] instanceof Array) {
                                obj[b] = [];
                                for (let i = 0; i < base[b].length; i++) { obj[b].push(base[b][i]) }
                            }
                        }
        
                        else {
                            if (typeof base[b] == 'object' && base[b] != null) {
                                obj[b] = {};
                                iterate(base[b], obj[b]);
                            }
        
                            else { obj[b] = base[b] }
                        }
                    }*/
        
                    for (let b in base) {
                        if (obj[b] == undefined) { obj[b] = clone(base[b]) }
                        else if (typeof obj[b] == 'object' && !(obj[b] instanceof Array)) { iterate(base[b], obj[b]) }
                    }
                }
        
                guild = await context.data.guild.get(interaction.guild.id);
                iterate(context.config.defaults.guild, guild);
                if (!guild.members[interaction.user.id]) { guild.members[interaction.user.id] = clone(context.config.defaults.member) }
                else { iterate(context.config.defaults.member, guild.members[interaction.user.id]) }
                user = await context.data.user.get(interaction.user.id);
                iterate(context.config.defaults.user, user);
            }
        
            var local = {
                guild: guild,
                user: user
            }
        
            if (context.data) { local.member = guild.members[interaction.user.id] }

            let slash_context = new SlashContext(context, interaction, local);
            
            if (context.slashes[interaction.commandName]) { context.slashes[interaction.commandName]._interaction(slash_context, interaction.options) }
        }
    });
}