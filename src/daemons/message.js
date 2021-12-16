let parseMessage = require('./../parseMessage.js');

function is_bad(str) {
    if (str.toLowerCase()
        .replace(/0/g, 'o')
        .replace(/3/g, 'e')
        .includes('female dog')
    ) { return true }
}

module.exports = function(imports) {
    imports.messageListener = function() {
        imports.client.on('messageCreate', function(message) {
            if (is_bad(message.content)) { return message.delete() }
            try { parseMessage(imports, message) }
            catch(error) { console.error(error) }
        });

        imports.client.on('messageUpdate', function(oldMessage, newMessage) {
            if (is_bad(newMessage.content)) { return newMessage.delete() }
        });
    }
}