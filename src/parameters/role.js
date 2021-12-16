// is a mention or start of the name/nick of a user
module.exports = async function(input, passthrough) {
    var output = { pass: false, value: null }

    if (input.startsWith('<@&')) {
        input = input.split('<@&')[1].substring(0, input.split('<@&')[1].length - 1);
        if (passthrough.guild.roles.fetch(input)) { output.pass = true; output.value = input }
    }

    else {
        let roles = (await passthrough.guild.roles.fetch()).cache.filter(function(role) { return role.name.toLowerCase().includes(input.toLowerCase()) });
        if (roles.array().length > 0) {
            let startsWith = roles.filter(function(role) { return role.name.toLowerCase().startsWith(input.toLowerCase()) });

            // prioritizes roles that start with input over roles that simply contain input
            if (startsWith.array().length > 0) { output.pass = true; output.value = startsWith.first().id }
            else if (roles.array().length > 0) { output.pass = true; output.value = roles.first().id }
        }
    }

    return output;
}