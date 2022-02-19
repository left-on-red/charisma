let CommandParameter = require('./../core/CommandParameter.js');

// is equal to either a command name or a command alias
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: false, value: null }
            input = input.toLowerCase();
            let name = context.commands.aliases.get(input) ? context.commands.aliases.get(input) : input;
            let command = context.commands.configs.get(name);
            if (command) { output.value = name; output.pass = true; }
            return output;
        });
    }
}