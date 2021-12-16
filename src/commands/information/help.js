let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'help',
            aliases: [ 'h' ],
            description: 'get information related to certain commands'
        });
        
        // help <search terms> [page]
        this.push([
            { type: 'string', required: true, name: 'search terms' },
            { type: 'number', required: false, name: 'page' }
        ],
        
        async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            let page = parameters[1] ? parameters[1] - 1 : 0;

            let configs = context.commands.configs;
            let list = {};

            let obj = Array.from(configs).reduce(function(obj, [key, value]) { obj[key] = value; return obj; }, {});
            for (let o in obj) {
                let usable = await context.command.canUse(o, context);
                if (usable.usable && usable.visible && obj[o].tags && obj[o].tags.includes(parameters[0])) { list[o] = obj[o] } }

            let arr = [];

            for (let l in list) { arr.push([l, list[l]]) }
            let max = Math.ceil(arr.length / 10) - 1;
            if (page > max) {
                if (arr.length == 0) { embed.setDescription('no commands were found') }
                else { embed.setDescription('please specify a smaller page number') }
            }

            else {
                for (let i = 0; i < 10; i++) {
                    if (arr[(page * 10) + i]) {
                        let syntax = context.command.syntax(context.local.guild.prefix, arr[(page * 10) + i][0]);
                        embed.addField(arr[(page * 10) + i][0], `\`${syntax}\``);
                    }
                }

                embed.setFooter(`page ${page + 1}/${max + 1}`);
            }

            context.channel.send({ embeds: [embed] });
        });

        // help [page]
        this.push([
            { type: 'number', required: false, name: 'page' }
        ],
        
        async (context, parameters) => {

            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let page = parameters[0] ? parameters[0] - 1 : 0;
            let configs = context.commands.configs;
            let arr = [];

            let obj = Array.from(configs).reduce(function(obj, [key, value]) { obj[key] = value; return obj; }, {});
            for (let o in obj) {
                let usable = await context.command.canUse(o, context);
                if (usable.usable && usable.visible) { arr.push([o, obj[o]]) }
            }

            var max = Math.ceil(arr.length / 10) - 1;
            if (page > max) {
                if (arr.length == 0) { embed.setDescription(`no commands were found`) }
                else { embed.setDescription(`please specify a smaller page number`) }
            }

            else {
                for (var i = 0; i < 10; i++) {
                    if (arr[(page * 10) + i]) {
                        var syntax = context.command.syntax(context.local.guild.prefix, arr[(page * 10) + i][0]);
                        embed.addField(arr[(page * 10) + i][0], `\`${syntax}\``);
                    }
                }

                embed.setFooter(`page ${page + 1}/${max + 1}`);
            }

            context.channel.send({ embeds: [embed] });
        });

        this.push([
            { type: 'command', required: true, name: 'command' }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let name = parameters[0];
            if (context.commands.aliases.get(name)) { name = context.commands.aliases.get(name) }
            let config = context.commands.configs.get(name);
            if (config) {
                let usable = await context.command.canUse(name, context);
                if (!usable.usable) { embed.setDescription(`you don't have permission to view that command`) }
                //if (config.permissions.includes('BOT.MASTER') && imports.config.master != imports.user.id) { embed.setDescription(`you don't have permission to view that command`) }
                else {
                    embed.addField('description', config.description, true);
                    embed.addField('usage', `\`${context.command.syntax(context.config.guild.prefix, name)}\``, true);
                    if (config.tags) { embed.addField('tags', config.tags.join(', '), true) }
                    if (config.permissions.length > 0) {
                        let arr = [];
                        for (let p = 0; p < config.permissions.length; p++) { arr.push(`\`${config.permissions[p]}\``) }
                        embed.addField('permissions', arr.join(', '));
                    }

                    embed.addField('nsfw', `${config.nsfw}`, true);
                }
            }

            else { embed.setDescription(`that command doesn't exist`) }
            
            context.channel.send({ embeds: [embed] });
        });
    }
}