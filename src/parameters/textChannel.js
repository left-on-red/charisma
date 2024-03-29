let CommandParameter = require('./../core/CommandParameter.js');

// is a channel mention or starts with a channel name
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: false, value: null }
            let channel;
            if (input.startsWith('<#') && input.endsWith('>')) {
                let id = input.split('<#')[1].substring(0, input.split('<#')[1].length - 1);
                if (input.startsWith('!')) { id = input.substr(1) }
                channel = context.guild.channels.cache.get(id);
            }

            else {
                let channels = context.guild.channels.cache.filter(function(channel) { return channel.type == 'text' && channel.name.includes(input) });
                let startsWith = channels.filter(function(channel) { return channel.name.startsWith(input) });
                if (startsWith.array().length > 0) { channel = startsWith.first() }
                else if (channels.array().length > 0) { channel = channels.first() }
            }

            if (channel) { output.pass = true; output.value = channel }

            return output;
        });
    }
}