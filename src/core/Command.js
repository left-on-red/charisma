let CommandContext = require('./CommandContext.js');

/**
 * @typedef {Object} CommandParam
 * @property {string} type - the type of the parameter
 * @property {string} name - the name of the parameter
 * @property {boolean} required - whether or not the parameter is required
 * @property {string} value - the required value of the parameter
 */

/**
 * @typedef {Object} CommandStructure
 * @property {CommandParam[]} params
 * @property {(context: CommandContext, parameters: any[]) => {}} command
 */

/**
 * @typedef {Object} CommandConfig
 * @property {string} name
 * @property {string} description
 * @property {string[]} aliases
 * @property {string[]} permissions
 * @property {string[]} tags
 * @property {boolean} nsfw
 * @property {boolean} hidden
 * @property {number} cooldown
 */

module.exports = class Command {

    /**
     * 
     * @param {CommandConfig} obj 
     */
    constructor(obj = {}) {
        /** @type {string} - the name of the command */
        this.name = obj.name ? obj.name : '';

        /** @type {string} - the description of the command */
        this.description = obj.description ? obj.description : '';

        /** @type {string[]} - the aliases of the command */
        this.aliases = obj.aliases ? obj.aliases : [];

        /** @type {string[]} - the permissions of the command */
        this.permissions = obj.permissions ? obj.permissions : [];

        /** @type {string[]} - the tags associated with the command */
        this.tags = obj.tags ? obj.tags : [];

        /** @type {boolean} - whether or not this command is nsfw */
        this.nsfw = obj.nsfw ? obj.nsfw : false;

        /** @type {string} - whether or not this command is hidden */
        this.hidden = obj.hidden ? obj.hidden : false;

        /** @type {number} - the cooldown of this command (in milliseconds) */
        this.cooldown = obj.cooldown ? obj.cooldown : 0;

        /** @type {CommandStructure[]} */
        this.data = [];
    }

    /**
     * 
     * @param {CommandParam[]} params 
     * @param {(context: CommandContext, parameters: any[]) => {}} command 
     */
    push(params, command) { this.data.push({ params, command }) }
}