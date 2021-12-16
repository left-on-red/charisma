String.prototype.replaceAll = function(str1, str2, ignore) { return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2) } 

function clone(obj) {
    var copy;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) { copy[i] = clone(obj[i]) }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]) }
        return copy;
    }
}

function get(input) {
    var array = [];
    for(var item in input) { if ( input.hasOwnProperty(item) ) { for( var i=0; i<input[item]; i++ ) { array.push(item) } } }
    return array[Math.floor(Math.random() * array.length)];
}

let dialogue = {
    angelfish: `you caught an :tropical_fish: wonder if that means the ocean is heavenfish`,
    blowfish: `you caught a :blowfish:! bet you're pretty blown away right now`,
    crab: `you caught a :crab: I wonder how they taste raw`,
    dolphin: `you caught a :dolphin:! it's probably smarter than you`,
    fish: `you caught a :fish: that's about as basic as it gets`,
    lobster: `you caught a :lobster:! that's the crabs classy cousin!`,
    octopus: `WOAH! you just caught an :octopus: ! now it's a shockedopus!`,
    shrimp: `you just caught a :shrimp: they're shrimpy fellas`,
    squid: `you just caught a :squid:! hope it doesn't ink you up!`,
    whale: `WOAH! you just caught a :whale:! how in the world did you manage that?`
}

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'fish',
            description: 'go fishing!',
            tags: [ 'economy' ],
            cooldown: 45000
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let inventory = new context.inventory(context.user.id, context);
            await inventory.init();
            
            let table = clone(context.economy.tables.fishing.default);
            let items = context.economy.items;
    
            if (inventory.keys.has('fishingpole')) {
                let bait = false;
    
                    //Our number.
                    //var number = 120;
                    
                    //The percent that we want to get.
                    //i.e. We want to get 50% of 120.
                    //var percentToGet = 50;
                    
                    //Calculate the percent.
                    //var percent = (percentToGet / 100) * number;
                    
                    //Alert it out for demonstration purposes.
                    //alert(percentToGet + "% of " + number + " is " + percent);
                    
                    //The result: 50% of 120 is 60
    
                if (inventory.items.has('bait')) { bait = (Math.random() * 100) > 25 }
    
            
                if (bait) { for (let t in table) { if (table[t] > 250) { delete table[t] } } }
                let roll = get(table);
    
                
                //if (dialogue[roll]) { embed.setDescription(dialogue[roll]) }
    
                if (roll == 'lootbag') {
                    let meta = { items: {} };
    
                    let lootTable = context.economy.tables.lootbag.fishing;
    
                    let count = Math.floor(Math.random() * 10) + 10;
                    for (let c = 0; c < count; c++) {
                        let bagRoll = get(lootTable);
                        if (meta.items[bagRoll] == undefined) { meta.items[bagRoll] = 1 }
                        else { meta.items[bagRoll] += 1 }
                    }
    
                    inventory.containers.add('lootbag', meta);
                }
    
                else { inventory.items.add(roll, 1) }
    
                embed.setDescription(`you caught a ${items[roll].emoji}${bait ? ' using a :meat_on_bone:': ''}!`);
                if (bait) { inventory.items.remove('bait') }
            }
    
            else { context.local.user.cooldowns.fish = -1; embed.setDescription(`you don't currently have a :fishing_pole_and_fish: equipped...`) }
    
            embed.setDescription(inventory.obtainedText(embed.description));
    
            await inventory.append();
            
            context.channel.send({ embeds: [embed] });
        });
    }
}