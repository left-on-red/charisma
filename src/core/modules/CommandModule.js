let Discord = require('discord.js');
let BotContext = require('./../BotContext.js');
let CommandContext = require('./../CommandContext.js');

class CommandModule {
    /**
     * 
     * @param {BotContext} context 
     */
    constructor(context) {
        this.context = context;
    }

    get = (command) => this.context.commands.configs.get(command);

    /**
     * 
     * @param {string} permission 
     * @param {*} context 
     */
    hasPermission = async (permission, context) => {
        var toReturn;
        async function recur(obj, perm) {
            var path = perm.split('.');
            path = path.filter(Boolean);
            if (obj[path[0]]) {
                if (obj[path[0]] instanceof Function) {
                    if (path[1]) { toReturn = await obj[path[0]](path[1], context) }
                    else { toReturn = await obj[path[0]](path[0], context) }
                }

                else { var shifted = path.shift(); await recur(obj[shifted], path.join('.')) }
            }
        }

        await recur(this.context.commands.permissions, permission);
        return toReturn;
    }

    /**
     * 
     * @param {*} command 
     * @param {CommandContext} context 
     * @returns {object}
     */
    canUse = async (command, context) => {
        let config = await this.status(command, context);
        if (config.userUsable && config.whitelisted && !config.blacklisted) { return { usable: true, visible: config.visible } }
        else { return { usable: false, visible: false } }
    }

    /**
     * 
     * @param {*} command 
     * @param {CommandContext} context 
     * @returns 
     */
    status = async (command, context) => {
        let config = this.context.commands.configs.get(command);

        if (config) {
            let required = config.permissions;
            let missingPerm = false;
            let userUsable = true;
            let botUsable = true;
            let visible = true;
            let nsfw = false;
            let blacklisted = false;
            let whitelisted = true;
            let master = false;
            let cooldown = false;

            let blacklist = [];
            if (context.local.guild.blacklist[context.member.id]) { blacklist = context.local.guild.blacklist[context.member.id] }
            
            let whitelist = [];
            if (context.local.guild.whitelist[command]) { whitelist = context.local.guild.whitelist[command] }

            for (let b in blacklist) { if (blacklist[b] == command) { blacklisted = true } }
            if (whitelist.length != 0) { if (!whitelist.includes(context.member.id)) { whitelisted = false } }

            for (let r = 0; r < required.length; r++) {
                var permission = await this.hasPermission(required[r], context);
                if (!permission.userPerms) { missingPerm = true }
                if (!permission.botPerms) { botUsable = false }
                if (permission.master) { master = true }

                if (Discord.Permissions.FLAGS[required[r]]) {
                    if (!context.member.permissions.has(Discord.Permissions.FLAGS[required[r]])) { missingPerm = true }
                    if (!context.guild.me.permissions.has(Discord.Permissions.FLAGS[required[r]])) { botUsable = false }
                }
            }

            if (blacklisted || !whitelisted || missingPerm ) { userUsable = false }
            if (missingPerm) { userUsable = false }
            if (config.cooldown) {
                if (!context.local.user.cooldowns[command]) { context.local.user.cooldowns[command] = -1 }
                var usedWhen = context.local.user.cooldowns[command];
                var date = new Date();
                var now = date.getTime();
                if (usedWhen != -1) {
                    var difference = now - usedWhen;

                    if (difference < config.cooldown) { cooldown = true; userUsable = false; }
                }
            }

            if (config.hidden) { visible = false }
            if (config.nsfw) { nsfw = true }

            if (nsfw && !context.channel.nsfw) { userUsable = false }

            return {
                userUsable: userUsable,
                botUsable: botUsable,

                visible: visible,
                nsfw: nsfw,

                missingPerm: missingPerm,

                blacklisted: blacklisted,
                whitelisted: whitelisted,
                cooldown: cooldown,
                master: master
            }
        }
    }

    /**
     * 
     * @param {any} inputs 
     * @param {any} params 
     * @param {CommandContext} context 
     * @returns 
     */
    evaluateParams = async (inputs, params, context) => {
        let toReturn = [];
        for (let i = 0; i < inputs.length; i++) {
            if (i < params.length) {
                if (this.context.commands.parameters.get(params[i].type).constructor.name == 'AsyncFunction') {
                    let result = await this.context.commands.parameters.get(params[i].type)(inputs[i], context);
                    toReturn.push(result.value);
                }
    
                else { toReturn.push(this.context.commands.parameters.get(params[i].type)(inputs[i], context).value) }
            }

            else {
                if (params[params.length - 1].type == 'string') { toReturn[toReturn.length - 1] = `${toReturn[toReturn.length - 1]} ${inputs[i]}` }
            }
        }

        return toReturn;
    }

    /**
     * 
     * @param {string} name 
     * @param {string[]} parameters 
     * @param {CommandContext} context 
     */
    check = async (name, parameters, context) => {
        let config = this.context.commands.configs.get(name);

        for (let c = config.params.length - 1; c >= 0; c--) {
            let error = false;
            for (let p = 0; p < config.params[c].length; p++) {
                if (parameters[p]) {
                    let checkFunc = this.context.commands.parameters.get(config.params[c][p].type);
                    let checked;
                    if (checkFunc.constructor.name == 'AsyncFunction') { checked = await checkFunc(parameters[p], context) }
                    else { checked = checkFunc(parameters[p], context) }

                    if (!checked.pass) { error = true; break; }

                    if (config.params[c][p].value) { if (config.params[c][p].value != checked.value) { error = true; break; } }
                }

                else if (config.params[c][p].required) { error = true; break; }
            }

            if (!error) { return c }
        }

        if (config.params.length == 0) { return 0 }

        return -1;
    }

    /**
     *
     * @param {string} prefix
     * @param {any} command 
     * @returns 
     */
    syntax = (prefix, command) => {
        let config = this.context.commands.configs.get(command);
        if (config) {
            let syntax = config.params.length == 0 ? [[`${prefix + command}`]] : [];
            if (config.params && config.params.length > 0) {
                for (let p = 0; p < config.params.length; p++) {
                    syntax.push([`${prefix + command}`]);
                    for (let pp = 0; pp < config.params[p].length; pp++) {
                        let insert = config.params[p][pp].type;
                        if (config.params[p][pp].name) { insert = config.params[p][pp].name }
                        if (config.params[p][pp].value != undefined && typeof config.params[p][pp].value == 'string') {
                            if (config.params[p][pp].required) { syntax[p].push(config.params[p][pp].value) }
                            else { syntax[p].push(`${config.params[p][pp].value}?`) }
                        }

                        else {
                            if (config.params[p][pp].required) { syntax[p].push(`<${insert}>`) }
                            else { syntax[p].push(`[${insert}]`) }
                        }
                    }
                }
            }

            let arr = [];
            for (let s = 0; s < syntax.length; s++) { arr.push(syntax[s].join(' ')) }

            return arr.join('\n');
        }
    }
}

module.exports = CommandModule;