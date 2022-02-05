let CommandContext = require('./../core/CommandContext.js');
let config = require('./../../config.json');
// if equal to either a command name or a command alias

/**
 * 
 * @param {*} input 
 * @param {CommandContext} passthrough 
 * @returns 
 */
module.exports = function(input, passthrough) {
    let output = { pass: true, value: null }
    input = input.toLowerCase();
    let name = passthrough.commands.aliases.get(input) ? passthrough.commands.aliases.get(input) : input;
    let command = passthrough.commands.configs.get(name);
    if (command && ((command.permissions.includes('BOT.MASTER') && passthrough.user.id == config.master) || !command.permissions.includes('BOT.MASTER'))) { output.value = name }
    else { output.pass = false }

    return output;
}