let CommandContext = require('./../core/CommandContext.js');
// if name of a slash command

/**
 * 
 * @param {string} input 
 * @param {CommandContext} passthrough 
 * @returns
 */
module.exports = function(input, passthrough) {
    let output = { pass: true, value: null }

    input = input.toLowerCase();
    if (!passthrough.slashes.has(input)) { output.pass = false }
    else { output.value = input }

    return output;
}