let SlashContext = require('./SlashContext.js');
let Discord = require('discord.js');

/**
 * @typedef {'SUB_COMMAND'|'SUB_COMMAND_GROUP'|'STRING'|'INTEGER'|'BOOLEAN'|'USER'|'CHANNEL'|'ROLE'|'MENTIONABLE'|'NUMBER'|'ATTACHMENT'} SlashOptionType
 */

/**
 * @typedef {name:string, value:string|number} SlashOptionChoice
 */

/**
 * @typedef {'GUILD_TEXT'|'DM'|'GUILD_VOICE'|'GROUP_DM'|'GUILD_CATEGORY'|'GUILD_NEWS'|'GUILD_NEWS_THREAD'|'GUILD_PUBLIC_THREAD'|'GUILD_PRIVATE_THREAD'|'GUILD_STAGE_VOICE'} ChannelType
 */

/**
 * @typedef {{name: string, description: string, type: SlashOptionType, required: boolean, autocomplete: boolean, min: number, max: number, channels: ChannelType[]}} SlashOptionRaw
 */

class Slash {

    /**
     * @type {SlashOption[]}
     */
    _options = [];

    /**
     * @type {Slash}
     */
    _parent = null;

    _interaction = () => {};
    _after = null;

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     */
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    /**
     * 
     * @param {SlashOption|SlashOption[]} opt 
     * @return {Slash}
     */
    append(opt) {
        if (!(opt instanceof Array)) { opt = [opt] }
        for (let o = 0; o < opt.length; o++) {
            opt[o]._parent = this;
            this._options.push(opt[o]);
        }

        return this;
    }

    /**
     * runs on command interaction
     * @param {(context: SlashContext, options: Discord.CommandInteractionOptionResolver) => {}} fn 
     * @returns {Slash}
     */
     interact(fn) {
        this._interaction = fn;
        return this;
    }

    /**
     * runs after the execution of a command interaction
     * @param {(context: SlashContext, options: Discord.CommandInteractionOptionResolver) => {}} fn 
     * @returns {Slash}
     */
    after(fn) {
        this._after = fn;
        return this;
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description
     * @returns {SlashOption}
     */
     static Subcommand(name, description) {
        return new SlashOption(name, description, 'SUB_COMMAND');
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description
     * @returns {SlashOption} 
     */
    static SubcommandGroup(name, description) {
        return new SlashOption(name, description, 'SUB_COMMAND_GROUP');
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static String(name, description, required) {
        return new SlashOption(name, description, 'STRING', required);
    }


    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Integer(name, description, required) {
        return new SlashOption(name, description, 'INTEGER', required)
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Boolean(name, description, required) {
        return new SlashOption(name, description, 'BOOLEAN', required);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static User(name, description, required) {
        return new SlashOption(name, description, 'USER', required);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Channel(name, description, required) {
        return new SlashOption(name, description, 'CHANNEL', required);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Role(name, description, required) {
        return new SlashOption(name, description, 'ROLE', required);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Mentionable(name, description, required) {
        return new SlashOption(name, description, 'MENTIONABLE', required);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Number(name, description, required) {
        return new SlashOption(name, description, 'NUMBER', required);
    }

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {boolean} required 
     * @returns {SlashOption}
     */
    static Attachment(name, description, required) {
        return new SlashOption(name, description, 'ATTACHMENT', required);
    }

    /**
     * converts the `Slash` hierarchy into raw API friendly data
     * @returns {Discord.ApplicationCommandData}
     */
    raw() {
        let obj = {
            name: this.name,
            description: this.description
        }

        if (this._options) { obj.options = [] }

        /**
         * @param {any} src
         * @param {SlashOption} opt 
         */
        function recur(src, opt) {
            let opt_obj = {
                name: opt.name,
                description: opt.description,
                type: opt.type
            }

            if (opt.required != undefined) { opt_obj.required = opt.required }
            if (opt.autocomplete != undefined) { opt_obj.autocomplete = opt.autocomplete }
            if (opt.choices) { opt_obj.choices = opt.choices }

            if (['INTEGER', 'NUMBER'].includes(opt_obj.type)) {
                if (opt.min) { opt_obj.minValue = opt.min }
                if (opt.max) { opt_obj.maxValue = opt.max }
            }

            if (opt_obj.type == 'CHANNEL' && opt.channels) { opt_obj.channelTypes = opt.channels }

            if (opt._options.length > 0) { opt_obj.options = [] }
            for (let o = 0; o < opt._options.length; o++) { recur(opt_obj, opt._options[o]) }

            src.options.push(opt_obj);
        }
        
        for (let o = 0; o < this._options.length; o++) { recur(obj, this._options[o]) }

        return obj;
    }
}

class SlashOption extends Slash {

    /** @type {SlashOptionChoice[]} */
     choices = [];

     /** @type {ChannelType[]} */
     channels = [];

    /**
     * @param {string} name 
     * @param {string} description 
     * @param {SlashOptionType} type 
     * @param {boolean} required 
     */
    constructor(name, description, type, required) {
        super(name, description);
        
        this.type = type;
        this.required = required ? true : false;
        this.autocomplete = false;
    }

    /**
     * 
     * @param {SlashOption|SlashOption[]} opt 
     * @return {SlashOption}
     */
     append(opt) {
        if (!(opt instanceof Array)) { opt = [opt] }
        for (let o = 0; o < opt.length; o++) {
            opt[o]._parent = this;
            this._options.push(opt[o]);
        }

        return this;
    }

    /**
     * push a choice to the choices array
     * @param {string} name 
     * @param {string|number} value
     * @return {SlashOption} 
     */
    choice(name, value) {
        this.choices.push({ name, value });
        return this;
    }
    
    /**
     * push multiple choices to the choices array
     * @param {{name: string, value: string|number}[]} array 
     * @return {SlashOption}
     */
    choices(array) {
        for (let a = 0; a < array.length; a++) { this.choices.push({ name: array[a].name, value: array[a].value }) }
        return this;
    }

    /**
     * push a `ChannelType` to the channels array
     * @param {ChannelType} name 
     * @return {SlashOption}
     */
    channel(name) {
        this.channels.push(name);
        return this;
    }

    /**
     * push multiple `ChannelType`'s to the channels array
     * @param {ChannelType[]} array 
     * @return {SlashOption}
     */
    channels(array) {
        for (let a = 0; a < array.length; a++) { this.channels.push(array[a]) }
        return this;
    }

    /**
     * sets the `min_value` attribute
     * @param {number} value 
     * @returns {SlashOption}
     */
    min(value) {
        this.min = value;
        return this;
    }

    /**
     * sets the `max_value` attribute
     * @param {number} value 
     * @returns {SlashOption}
     */
    max(value) {
        this.max = value;
        return this;
    }
}

module.exports = Slash;