let SlashContext = require('./SlashContext.js');
let Discord = require('discord.js');

/**
 * @typedef {'SUB_COMMAND'|'SUB_COMMAND_GROUP'|'STRING'|'INTEGER'|'BOOLEAN'|'USER'|'CHANNEL'|'ROLE'|'MENTIONABLE'|'NUMBER'} SlashOptionType
 */

/**
 * @typedef {name:string, value:string|number} SlashOptionChoice
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
     * @param {string} name 
     * @param {string} description 
     * @param {SlashOptionType} type 
     * @param {boolean} required 
     */
    option(name, description, type, required) {
        let opt = new SlashOption(name, description, type, required);
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
                type: opt.type,
                required: opt.required ? true : false
            }

            if (['SUB_COMMAND', 'SUB_COMMAND_GROUP'].includes(opt_obj.type)) { delete opt_obj.required }

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
     */
    constructor(name, description, type, required) {
        super(name, description);
        
        this.type = type;
        this.required = required;
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