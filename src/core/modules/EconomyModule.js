let fs = require('fs');
let emoji = require('discord-emoji-converter');
let CoreModule = require('./../CoreModule.js');

let recur = (path, callback) => {
    if (fs.statSync(path).isDirectory()) {
        let dir = fs.readdirSync(path);
        for (let d = 0; d < dir.length; d++) { recur(`${path}/${dir[d]}`, callback) }
    }

    else { callback(path) }
}

class EconomyModule extends CoreModule {
    constructor() {
        super('economy');

        this.items = {};
        this.tables = {};

        recur('./src/economy/items', (path) => {
            let name = path.split('/')[path.split('/').length - 1].split('.json')[0];
            this.items[name] = JSON.parse(fs.readFileSync(path));
        });

        recur('./src/economy/tables', (path) => {
            let name = path.split('/')[path.split('/').length - 1].split('.json')[0];
            this.tables[name] = JSON.parse(fs.readFileSync(path));
        });
    }

    itemFromEmoji(emote) {
        let toReturn = null;
        for (let i in this.items) { if (this.items[i].emoji == emoji.getShortcode(emote).split(' ').join('')) { toReturn = i } }
        return toReturn;
    }
}

module.exports = EconomyModule;