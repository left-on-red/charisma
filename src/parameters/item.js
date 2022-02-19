let emoji = require('discord-emoji-converter');
let CommandParameter = require('./../core/CommandParameter.js');

// is an item identifier
module.exports = class extends CommandParameter {
    constructor() {
        super((input, context) => {
            let output = { pass: false, value: null }
            let items = context.economy.items;
            if (!items[input]) { for (let i in items) { if (items[i].emoji == emoji.shortcodify(input).split(' ').join('')) { input = i } } }
            if (items[input]) { output.pass = true; output.value = input }    
            return output;
        });
    }
}