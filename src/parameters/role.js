let CommandParameter = require('./../core/CommandParameter.js');

// is a role mention or starts with the name of a role
module.exports = class extends CommandParameter {
    constructor() {
        super(async (input, context) => {
            let output = { pass: false, value: null }

            if (input.startsWith('<@&')) {
                input = input.split('<@&')[1].substring(0, input.split('<@&')[1].length - 1);
                if (context.guild.roles.fetch(input)) { output.pass = true; output.value = input }
            }

            else {
                let roles = (await context.guild.roles.fetch()).cache.filter(function(role) { return role.name.toLowerCase().includes(input.toLowerCase()) });
                if (roles.array().length > 0) {
                    let startsWith = roles.filter(function(role) { return role.name.toLowerCase().startsWith(input.toLowerCase()) });

                    // prioritizes roles that start with input over roles that simply contain input
                    if (startsWith.array().length > 0) { output.pass = true; output.value = startsWith.first().id }
                    else if (roles.array().length > 0) { output.pass = true; output.value = roles.first().id }
                }
            }

            return output;
        });
    }
}