let CommandParameter = require('./../core/CommandParameter.js');

// is number and > 0
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: true, value: null }
            if (isNaN(input) || parseInt(input) <= 0) { output.pass = false }
            else { output.value = parseInt(input) }
            return output;
        });
    }
}