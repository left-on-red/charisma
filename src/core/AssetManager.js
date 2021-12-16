let BotContext = require('./BotContext.js');
let Command = require('./Command.js');
let Slash = require('./Slash.js');

class AssetManager {
    /**
     * 
     * @param {BotContext} context 
     */
    constructor(context) {
        this.context = context;
    }

    registerCommand(path) {
        let command = require(path);
        if (command.prototype instanceof Command) {
            let instance = new command();
            for (let a = 0; a < instance.aliases.length; a++) { this.context.commands.aliases.set(instance.aliases[a], instance.name) }

            let params = [];
            let commands = [];

            for (let d = 0; d < instance.data.length; d++) {
                params.push(instance.data[d].params);
                commands.push(instance.data[d].command);
            }

            this.context.commands.configs.set(instance.name, {
                name: instance.name,
                description: instance.description,
                aliases: instance.aliases,
                tags: instance.tags,
                permissions: instance.permissions,
                nsfw: instance.nsfw,
                hidden: instance.hidden,
                params: params
            });

            this.context.commands.parameters.set(instance.name, params);
            this.context.commands.functions.set(instance.name, commands);

            return true;
        }

        return false;
    }

    registerSlash(path) {
        let slash = require(path);
        if (slash.prototype instanceof Slash) {
            let instance = new slash();
            this.context.slashes.set(instance.name, instance);
            return true;
        }

        return false;
    }

    registerParameter(path) {
        path = path.replace(/\\/g, '/');
        let name = path.split('/')[path.split('/').length - 1].split('.')[0];
        this.context.commands.parameters.set(name, require(path));

        return true;
    }

    async registerDaemon(path) {
        let daemon = require(path);
        if (daemon.constructor.name === 'AsyncFunction') { await daemon(this.context) }
        else { daemon(this.context) }

        return true;
    }
}

module.exports = AssetManager;