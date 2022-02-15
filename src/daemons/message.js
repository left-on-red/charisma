let parseMessage = require('./../parseMessage.js');
let BotContext = require('./../core/BotContext.js');

/**
 * 
 * @param {BotContext} context 
 */
module.exports = function(context) {
    context.messageListener = function() {
        context.client.on('messageCreate', function(message) {
            try { parseMessage(context, message) }
            catch(error) { context.logging.error(`guild.${message.guild.id}`, error) }
        });
    }
}