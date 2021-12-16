let fs = require('fs');
let emoji = require('discord-emoji-converter');

let items = {};
let tables = {};

function recur(path) {
    let files = fs.readdirSync(`${__dirname}/../../economy/${path}`);
    for (let f = 0; f < files.length; f++) {
        let isFolder = fs.statSync(`${__dirname}/../../economy/${path}/${files[f]}`).isDirectory();
        if (isFolder) { recur(`${path}/${files[f]}`) }
        else {
            let item = require(`./../../economy/${path}/${files[f]}`);
            items[files[f].split('.json')[0]] = item;
        }
    }
}

recur(`items`);

let tableFiles = fs.readdirSync(`${__dirname}/../../economy/tables/`);
for (let f = 0; f < tableFiles.length; f++) {
    let table = require(`./../../economy/tables/${tableFiles[f]}`);
    tables[tableFiles[f].split('.js')[0]] = table;
}

class EconomyModule {
    constructor() {
        this.items = items;
        this.tables = tables;
    }

    itemFromEmoji(emote) {
        let toReturn = null;
        for (let i in this.items) { if (this.items[i].emoji == emoji.getShortcode(emote).split(' ').join('')) { toReturn = i } }
        return toReturn;
    }
}

module.exports = EconomyModule;