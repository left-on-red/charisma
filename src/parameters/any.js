let CommandParameter = require('./../core/CommandParameter.js');

// is anything(always true)
module.exports = class extends CommandParameter {
    constructor() {
        super((input, passthrough) => {
            return { pass: true, value: input } 
        });
    }
}