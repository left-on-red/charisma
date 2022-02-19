let modes = [
    'none',
    'discrete',
    'full'
]

let CommandParameter = require('./../core/CommandParameter.js');

// is an item identifier
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: false, value: null }
            if (modes.includes(input.toLowerCase())) { output.pass = true; output.value = input.toLowerCase() }
        });
    }
}