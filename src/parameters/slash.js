let CommandParameter = require('./../core/CommandParameter.js');

// is the name of a slash command
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: true, value: null }

            input = input.toLowerCase();
            if (!context.slashes.has(input)) { output.pass = false }
            else { output.value = input }

            return output;
        });
    }
}