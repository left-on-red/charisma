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
            let slash_command = context.slashes.get(interaction.commandName);

            if (slash_command) {
                let options = interaction.options;
                let fn = slash_command._interaction;

                let recur = (data, slash) => {
                    for (let d = 0; d < data.length; d++) {
                        for (let s = 0; s < slash.length; s++) {
                            if (data[d].name == slash[s].name) {
                                if (data[d].options && data[d].options.length > 0) { recur(data[d].options, slash[s]._options) }
                                else {
                                    fn = slash[s]._interaction;
                                    return;
                                }
                            }
                        }
                    }
                }

                recur(options.data, slash_command._options);

                if (fn) {
                    if (fn.constructor.name == 'AsyncFunction') { await fn(slash_context, interaction.options) }
                    else { fn(slash_context, interaction.options) }
                }

                let node = slash_command;

                while (node != null) {
                    if (node._after) {
                        if (node._after.constructor.name == 'AsyncFunction') { await node._after(slash_context, interaction.options) }
                        else { node._after(slash_context, interaction.options) }
                    }

                    node = node._parent;
                }
    
                //console.log(options.data, slash_command);
            }

            //if (context.slashes.get(interaction.commandName)) { context.slashes.get(interaction.commandName)._interaction(slash_context, interaction.options) }
        }
    });
}