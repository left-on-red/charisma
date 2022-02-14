let rethink = require('rethinkdb');
let BotContext = require('./../BotContext.js');
let Configs = require('./../Configs.js');
let CoreModule = require('./../CoreModule.js');

let defaults = {
    guild: Configs.GuildConfig,
    member: Configs.MemberConfig,
    user: Configs.UserConfig,
    inventory: Configs.InventoryConfig,
    karma: Configs.KarmaConfig,
    experience: Configs.ExperienceConfig,
}

class DataModule extends CoreModule {
    /**
     * 
     * @param {BotContext} context 
     */
    constructor(context) {
        super('data');

        this.context = context;

        this.name = 'charisma';
        this.config = null;
        this.connection = null;

        // tables that exist on a per-bot-instance basis
        this.privates = [ 'guild', 'user' ];

        // tables that exist globally for all bot instances
        this.globals = [ 'inventory', 'karma', 'experience' ];

        /*
        delete imports.config.defaults.guild.prefix;
        delete imports.config.defaults.guild.colors.accent;
        config = { host: imports.config.data.host, port: imports.config.data.port, variation: imports.config.main.variation }
        */
    }

    async start() {
        this.config = {
            host: this.context.config.data.host,
            port: this.context.config.data.port,
            variation: this.context.config.bot.variation
        }

        this.connection = await rethink.connect({
            host: this.config.host,
            port: this.config.port
        });

        let databases = await rethink.dbList().run(this.connection);
        if (!databases.includes(this.name)) { await rethink.dbCreate(this.name).run(this.connection) }
        
        let tables = await rethink.db(this.name).tableList().run(this.connection);

        for (let g = 0; g < this.globals.length; g++) { if (!tables.includes(this.globals[g])) { await rethink.db(this.name).tableCreate(this.globals[g]).run(this.connection) } }
        for (let p = 0; p < this.privates.length; p++) { if (!tables.includes(`${this.config.variation}_${this.privates[p]}`)) { await rethink.db(this.name).tableCreate(`${this.config.variation}_${this.privates[p]}`).run(this.connection) } }

        this.context.system.ok(`connected to rethink://${this.config.host}:${this.config.port}`);
        this.connection.addListener('close', () => {
            this.context.system.error('lost connection to the database...');
            process.emit('SIGINT');
        });
    }

    /**
     * 
     * @param {String} table the name of the table
     * @param {String} id the id of the resource
     * @returns {Object}
     */
    async _get(table, id) {
        let actual = table;
        if (this.privates.includes(table)) { actual = `${this.config.variation}_${table}` }

        let json = await rethink.db(this.name).table(actual).get(id).run(this.connection);
        let obj = new defaults[table]();

        if (json == null) {
            obj.id = id;
            await rethink.db(this.name).table(actual).get(id).replace(obj).run(this.connection);
        }

        else { Object.assign(obj, json) }

        delete obj.id;

        return obj;
    }

    /**
     * 
     * @param {String} table the name of the table
     * @param {String} id the id of the resource
     * @param {Object} data an object representing the data
     */
    async _update(table, id, data) {
        let actual = table;
        if (this.privates.includes(table)) { actual = `${this.config.variation}_${table}` }

        data.id = id;
        await rethink.db(this.name).table(actual).get(id).replace(data).run(this.connection);
    }

    karma = {
        get: async (id) => { return await this._get('karma', id) },
        update: async (id, obj) => { await this._update('karma', id, obj) }
    }

    guild = {
        get: async (id) => {
            let guild = Configs.GuildConfig.cast(await this._get('guild', id));
            return guild;
        },

        /**
         * 
         * @param {string} id 
         * @param {Configs.GuildConfig} guild 
         */
        update: async (id, guild) => {
            await this._update('guild', id, guild);
        }
    }

    user = {
        /**
         * 
         * @param {string} id
         * @returns {Configs.UserConfig}
         */
        get: async (id) => await this._get('user', id),
        update: async (id, data) => await this._update('user', id, data)
    }

    experience = {
        /**
         * 
         * @param {string} id 
         * @returns {Configs.ExperienceConfig}
         */
        get: async (id) => await this._get('experience', id),
        update: async (id, data) => this._update('experience', id, data)
    }

    inventory = {
        /**
         * 
         * @param {string} id 
         * @returns {Configs.InventoryConfig}
         */
        get: async (id) => await this._get('inventory', id),
        update: async (id, data) => this._update('inventory', id, data)
    }
}

module.exports = DataModule;