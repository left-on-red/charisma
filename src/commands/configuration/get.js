function size(obj) {
    let s = 0, key;
    for (key in obj) { if (obj.hasOwnProperty(key)) s++ }
    return s;
}

function index(obj, is, value) {
    try {
        if (typeof is == 'string') { return index(obj,is.split('.'), value) }
        else if (is.length == 1 && value !== undefined) { return obj[is[0]] = value }
        else if (is.length == 0) { return obj }
        else { return index(obj[is[0]], is.slice(1), value) }
    }

    catch(error) {}
}

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'get',
            description: 'gets a value from whatever you specify',
            tags: [ 'management', 'information' ]
        });

        // get
        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            let gets = context.gets.data;
            for (let g in gets) { embed.addField(g, `**${size(gets[g])} items**`, true) }
            context.channel.send({ embeds: [embed] });
        });

        // get <path>
        this.push([
            { type: 'string', required: true, name: 'path' }
        ], async (context, parameters) => {
            var embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
        
            let gets = context.gets.data;
            let value = index(gets, parameters[0]);
            if (value != undefined) {
                if (value.function) {
                    let authorized = true;
                    for (let p = 0; p < value.permissions.length; p++) {
                        let perms = await context.command.hasPermission(value.permissions[p], context);
                        if (!perms.userPerms) { authorized = false }
                    }
        
                    if (authorized) { embed.setDescription(`${value.function.constructor.name == 'AsyncFunction' ? await value.function(context, parameters[0]) : value.function(context, parameters[0])}`) }
                    else { embed.setDescription(`you don't have permission to view that property`) }
                }
    
                else {
                    let obj = {};
                    for (let v in value) {
                        let authorized = true;
                        if (value[v] == null) { obj[v] = '`null`' }
                        else if (value[v].function) {
                            for (let p = 0; p < value[v].permissions.length; p++) {
                                if (!(await context.command.hasPermission(value[v].permissions[p], context))) { authorized = false }
                            }
        
                            if (authorized) {
                                if (value[v].function.constructor.name == 'AsyncFunction') { obj[v] = await value[v].function(context, `${parameters[0]}.${v}`) }
                                else { obj[v] = value[v].function(context, `${parameters[0]}.${v}`) }
                            }
                        }
    
                        else { obj[v] = `**${size(value[v])} items**` }
                    }
    
                    if (size(obj) > 0) {
                        for (let o in obj) {
                            embed.addField(o, `${obj[o]}`, true);
                        }
                    }
    
                    else { embed.setDescription(`you don't have permission to view any of those properties`) }
                }
            }
    
            else { embed.setDescription(`\`${parameters[0]}\` does not exist`) }
        
            context.channel.send({ embeds: [embed] });
        });
    }
}