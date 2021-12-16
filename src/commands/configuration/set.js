Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
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
            name: 'set',
            description: 'sets a value to whatever you specify',
            tags: [ 'management', 'admin' ]
        });

        this.push([
            { type: 'string', required: true, name: 'path' },
            { type: 'string', required: true, name: 'value' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let obj = index(context.sets.data, parameters[0]);
    
            if (obj != undefined) {
                if (typeof obj == 'object' && obj.function) {
                    let authorized = true;
                    for (let p = 0; p < obj.permissions.length; p++) {
                        let perms = await context.command.hasPermission(obj.permissions[p], context);
                        if (!perms.userPerms) { authorized = false }
                    }
    
                    if (authorized) {
                        let result;
                        if (context.commands.parameters.get(obj.type).constructor.name == 'AsyncFunction') { result = await context.commands.parameters.get(obj.type)(parameters[1], context) }
                        else { result = context.commands.parameters.get(obj.type)(parameters[1], context) }
                        if (result.pass) {
                            let value = result.value;
                            let set = obj.function.constructor.name == 'AsyncFunction' ? await obj.function(value, context, parameters[0]) : obj.function(value, context, parameters[0]);
                            embed.setDescription(`set \`${parameters[0]}\` to ${set}`);
                        }
    
                        else { embed.setDescription(`value \`${parameters[1]}\` is not of type \`${obj.type}\``) }
                    }
    
                    else { embed.setDescription(`you don't have permission to change that property`) }
                }
    
                else { embed.setDescription(`\`${parameters[0]}\` does not exist`) }
            }
    
            else { embed.setDescription(`\`${parameters[0]}\` does not exist`) }
        
            context.channel.send({ embeds: [embed] });
        });
    }
}