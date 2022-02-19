let CommandParameter = require('./../core/CommandParameter.js');

// is a valid charisma flavor
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: false, value: null }
            if (context.flavors.get(input.toLowerCase())) { output.pass = true; output.value = input.toLowerCase(); }
            return output;
        });
    }
}