let CommandParameter = require('./../core/CommandParameter.js');

// true or false
module.exports = class extends CommandParameter {
    constructor() {
        super((input, passthrough) => {
            let output = { pass: true, value: null }
            if (input.toLowerCase() == 'true') { output.value = true }
            else if (input.toLowerCase() == 'false') { output.value = false }
            else { output.pass = false }
            return output;
        });
    }
}