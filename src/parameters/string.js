let CommandParameter = require('./../core/CommandParameter.js');

// is a string (always true)
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: true, value: input }
            return output;
        });
    }
}