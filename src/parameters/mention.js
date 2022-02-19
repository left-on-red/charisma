let CommandParameter = require('./../core/CommandParameter.js');

// is a mention or starts with the name/nick of a user
module.exports = class extends CommandParameter {
    constructor() {
        super(async (input, context) => {
            let output = { pass: true }
            if (input.startsWith('<@')) {
                var input = input.split('<@')[1].substring(0, input.split('<@')[1].length - 1);
                if (input.startsWith('!')) { input = input.substr(1) }
            }

            else {
                let members = (await context.guild.members.fetch()).filter(function(member) { return (member.nickname && member.nickname.toLowerCase().includes(input)) || member.user.username.toLowerCase().includes(input) });
                members.size
                if (members.size > 0) {
                    var startsWith = members.filter(function(member) { return (member.nickname && member.nickname.toLowerCase().startsWith(input)) || member.user.username.toLowerCase().startsWith(input) });
                    if (startsWith.size > 0) { input = startsWith.first().id }
                    else if (members.size > 0) { input = members.first().id }
                }

                else { output.pass = false }
            }

            if (output.pass) { output.value = input }
            else { output.value = null }

            return output;
        });
    }
}