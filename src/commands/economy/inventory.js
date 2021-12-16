function inventoryHelper(context) {
    let self = this;
    self.context = context;
    self.inventory = new self.context.inventory(self.context.user.id, context);

    self.init = async function() { await self.inventory.init() }

    self.items = function() { return self.inventory.items.getAll() }
    self.keys = function() { return self.inventory.keys.getAll() }
    self.containers = function() { return self.inventory.containers.getAll() }

    self.itemsText = function(expanded) {
        let items = self.items();
        let arr = [];
        for (let i in items) { arr.push(`${self.context.economy.items[i].emoji}x${items[i]}${expanded ? ` (${i})` : ''}`) }

        return arr.length > 0 ? arr.join(' ') : '[nothing]'
    }

    self.keysText = function(expanded) {
        let keys = self.keys();
        let arr = [];
        for (let k in keys) { arr.push(`${self.context.economy.items[k].emoji}${expanded ? ` (${k})` : ''}`) }

        return arr.length > 0 ? arr.join(' ') : '[nothing]'
    }

    self.containersText = function(expanded) {
        let containers = self.containers();
        let arr = [];
        for (let c in containers) { arr.push(`${self.context.economy.items[c].emoji}x${containers[c].length}${expanded ? ` (${c})` : ''}`) }

        return arr.length > 0 ? arr.join(' ') : '[nothing]'
    }
}

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'inventory',
            description: `look to see what's in your inventory`,
            aliases: [ 'inv' ],
            tags: [ 'economy' ]
        });

        // inventory
        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let helper = new inventoryHelper(context);
            await helper.init();

            embed.addField('items', helper.itemsText());
            embed.addField('key items', helper.keysText());

            if (helper.containers().length > 0) { embed.addField('containers', helper.containersText()) }
    
            context.channel.send({ embeds: [embed] });
        });

        // inventory expanded
        this.push([
            { type: 'string', required: true, value: 'expanded' }
        ], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let helper = new inventoryHelper(context);
            await helper.init();

            embed.addField('items', helper.itemsText(true));
            embed.addField('key items', helper.keysText(true));

            if (helper.containers().length > 0) { embed.addField('containers', helper.containersText(true)) }
    
            context.channel.send({ embeds: [embed] });
        });

        // inventory export
        this.push([
            { type: 'string', required: true, value: 'export' }
        ], async (context) => {
            let inventory = new context.inventory(context.user.id, context);
            await inventory.init();

            let json = JSON.stringify(inventory.data);
            let attachment = new context.Discord.MessageAttachment(Buffer.from(json, 'utf8'), 'export.json');
            
            context.channel.send({ files: [attachment] })
        });
    }
}