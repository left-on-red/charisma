let CommandContext = require('./CommandContext.js');

/**
 * @typedef {(input: string, context: CommandContext) => { pass: boolean, value: any }} ParameterHandler
 */

class CommandParameter {
    /** @param {ParameterHandler} handler */
    constructor(handler) {
        /** @type {ParameterHandler} */
        this.handler = handler;
    }
}

module.exports = CommandParameter;