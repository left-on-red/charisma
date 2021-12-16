let Command = require('./../../core/Command.js');
let parseMessage = require('./../../parseMessage.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'sudo',
            description: 'runs a command as if you were whoever you specify',
            permissions: [ 'BOT.MASTER' ],
            tags: [ 'management', 'utility', 'master' ]
        });

        this.push([
            { type: 'mention', required: true, name: 'possessionee' },
            { type: 'string', required: true, name: 'command' }
        ], async (context, parameters) => {
            let member = await context.guild.members.fetch(parameters[0]);
    
            let message = {
                author: member.user,
                member: member,
                channel: context.channel,
                guild: context.guild,
                content: context.local.guild.prefix + parameters[1]
            }
    
            parseMessage(context, message);
        });
    }
}