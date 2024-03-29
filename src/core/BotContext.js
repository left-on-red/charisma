let fs = require('fs');
let Discord = require('discord.js');
let Configs = require('./Configs.js');
let LoggingManager = require('./LoggingManager.js');

let CommandConfig = require('./CommandConfig.js');

class BotContext {
    /**
     * 
     * @param {Discord.Client} client 
     */
    constructor(client) {
        this.client = client;

        this.logging = new LoggingManager();
        this.system = this.logging.getReference('system');

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
            permissions: {},
            
            /** @type {Map<string, (context: CommandContext, parameters: any[]) => {}>} */
            functions: new Map(),
            
            /** @type {Map<string, CommandConfig>} */
            configs: new Map(),

            /** @type {Map<string, string>} */
            aliases: new Map(),

            /** @type {Map<string, (input: string, context: CommandContext) => { pass: boolean, value: any }>} */
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
        this.accept = new (require('./modules/AcceptModule.js'))(this);
        this.experience = new (require('./modules/ExperienceModule.js'))(this);
        this.music = new (require('./modules/MusicModule.js'))(this);
        this.reactions = new (require('./modules/ReactionsModule.js'))(this);
        this.flavors = new (require('./modules/FlavorsModule.js'))(this);
        this.economy = new (require('./modules/EconomyModule.js'))(this);
        this.inventory = new (require('./modules/InventoryModule.js'))(this);
        this.image = new (require('./modules/ImageModule.js'))(this);
        this.shop = new (require('./modules/ShopModule.js'))(this);
        this.tenor = new (require('./modules/TenorModule.js'))(this);

        this.messageListener = null;

        this.Discord = Discord;
    }
}

module.exports = BotContext;