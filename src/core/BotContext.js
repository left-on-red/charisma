let fs = require('fs');
let Discord = require('discord.js');
let Configs = require('./Configs.js');

class BotContext {
    /**
     * 
     * @param {Discord.Client} client 
     */
    constructor(client) {
        this.client = client;

        this.buffers = {
            local_arrow: fs.readFileSync(`${__dirname}/../images/local_arrow.png`),
            global_arrow: fs.readFileSync(`${__dirname}/../images/global_arrow.png`)
        }

        this.config = {
            data: new Configs.DataConfig(),
            guild: new Configs.GuildConfig(),
            member: new Configs.MemberConfig(),
            user: new Configs.UserConfig(),
            inventory: new Configs.InventoryConfig(),
            karma: new Configs.KarmaConfig(),
            experience: new Configs.KarmaConfig(),
            bot: new Configs.BotOptionsConfig(),

            defaults: {
                guild: new Configs.GuildConfig(),
                member: new Configs.MemberConfig(),
                user: new Configs.UserConfig()
            }
        }

        this.commands = {
            functions: new Map(),
            configs: new Map(),
            permissions: {},
            aliases: new Map(),
            parameters: new Map()
        }
        
        this.slashes = new Map(),

        this.gets = {
            inits: [],
            data: {}
        }

        this.sets = {
            inits: [],
            data: {}
        }

        this.command = new (require('./modules/CommandModule.js'))(this);

        this.data = new (require('./modules/DataModule.js'))(this);
        this.accept = new (require('./modules/AcceptModule.js'))();
        this.experience = new (require('./modules/ExperienceModule.js'))();
        this.music = new (require('./modules/MusicModule.js'))(this);
        this.reactions = new (require('./modules/ReactionsModule.js'))(this);
        this.flavors = new (require('./modules/FlavorsModule.js'))();
        this.economy = new (require('./modules/EconomyModule.js'))();
        this.inventory = require('./modules/InventoryModule.js');
        this.image = require('./modules/ImageModule.js');
        this.shop = new (require('./modules/ShopModule.js'))(this);
        this.tenor = new (require('./modules/TenorModule.js'))(this);

        this.messageListener = null;

        this.Discord = Discord;
    }
}

module.exports = BotContext;