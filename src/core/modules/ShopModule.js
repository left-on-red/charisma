Math.seedrandom = require('seedrandom');
let BotContext = require('./../BotContext.js');
let CoreModule = require('./../CoreModule.js');

let min = 5;
let max = 25;

class ShopModule extends CoreModule {
    /**
     * 
     * @param {BotContext} context 
     */
    constructor(context) {
        super('shop');
        this.context = context;
    }

    getDay = () => Math.floor(Date.now() / (1000 * 60 * 60 * 24)+3)

    getPrice = (name, days) => {
        if (!days) { days = this.getDay() }

        Math.seedrandom(`${days}${name}`);
        let item = this.context.economy.items[name];
        let weekday = days % 7;
        if (weekday == 0) { return Math.floor(Math.random() * (item.value * 1.2) + (item.value * 0.8)) }
        else {
            let previous = this.getPrice(name, days-1);
            Math.seedrandom(`${days}${weekday}${name}`);
            let rng = Math.floor(Math.random() * 3);
            
            // increase
            if (rng == 0) { return Math.floor(previous * (((Math.floor(Math.random() * (max - min + 1) + min)) / 100) + 1)) }

            // stagnate
            else if (rng == 1) { return previous }

            // decrease
            else if (rng == 2) { return Math.floor(previous * ((Math.floor(Math.random() * ((100-max) - (100-min) + 1) + (100-min))) / 100)) }
        }
    }

    isAvailable = (name, days) => {
        if (!days) { days = this.getDay() }

        let item = this.context.economy.items[name];
        if (!item.shoppable) { return false }
        Math.seedrandom(`${days}${name}`);

        let rarity = 100;
    
        let odds = Math.floor(Math.random() * 1000);
        if (item.tags.includes('elusive')) { rarity = 800 }
        else if (item.tags.includes('rare')) { rarity = 700 }
        else if (item.tags.includes('uncommon')) { rarity = 500 }

        return odds > rarity;
    }

    getValue = (name, days) => {
        if (!days) { days = this.getDay() }

        let item = this.context.economy.items[name];

        let value = item.shoppable ? Math.floor(this.getPrice(name, days) * 0.75) : this.getPrice(name, days);
        if (days % 7 == 0) { value = value * 1.2 }

        return Math.floor(value);
    }
}

module.exports = ShopModule;