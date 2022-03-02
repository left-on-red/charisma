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

class Slash {

    /**
     * @type {SlashOption[]}
     */
    _options = [];

    _interaction = () => {};

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
     * @param {{name: string, description: string, type: SlashOptionType, required: boolean, autocomplete: boolean, min: number, max: number, channels: ChannelType[]}} obj 
     */
    option(obj) {
        let opt = new SlashOption(obj.name, obj.description, obj.type, obj.required, obj.autocomplete, obj.channels, obj.min, obj.max);
        this._options.push(opt);
        return opt;
    }

    /**
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
            if (opt._choices) { opt_obj.choices = opt._choices }

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

    /**
     * @param {(context: SlashContext, options: Discord.CommandInteractionOptionResolver) => {}} fn 
     */
     interact(fn) { this._interaction = fn; }
}

class SlashOption extends Slash {

    /**
     * @type {SlashOptionChoice[]}
     */
     _choices = [];

    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {SlashOptionType} type 
     * @param {boolean} required 
     * @param {boolean} autocomplete
     * @param {ChannelType[]} channels
     * @param {number} min
     * @param {number} max
     */
    constructor(name, description, type, required, autocomplete, channels, min, max) {
        super(name, description);
        
        this.type = type;
        this.required = required ? true : false;
        this.autocomplete = autocomplete ? true : false;

        if (channels) { this.channels = channels }
        if (min != undefined) { this.min = min }
        if (max != undefined) { this.max = max }
    }

    /**
     * 
     * @param {string} name 
     * @param {string|number} value 
     */
    choice(name, value) {
        this._choices.push({ name, value });
        return this;
    }
}

module.exports = Slash;