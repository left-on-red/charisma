function parseDate(milliseconds) {
    var seconds = Math.floor(milliseconds / 1000);
    
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    var hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    var days = Math.floor(hours / 24);
    hours = hours % 24;

    var suffixes = ['hours', 'minutes', 'seconds'];
    var values = [hours, minutes, seconds];
    var suffs = new Array();
    var vals = new Array();

    for (v in values) {
        if (values[v] != 0) {
            suffs.push(suffixes[v]);
            vals.push(values[v]);
        }
    }

    var output = '';

    for (var v = 0; v < vals.length; v++) {
        if (v != vals.length-1) {
            if (vals[v] > 1) {
                output += vals[v] + ' ' + suffs[v] + ', ';
            }
            
            else {
                output += vals[v] + ' ' + suffs[v].substring(0, suffs[v].length - 1) + ', ';
            }
        }
        else {
            if (vals[v] > 1) {
                output += 'and ' + vals[v] + ' ' + suffs[v];
            }

            else {
                output += 'and ' + vals[v] + ' ' + suffs[v].substring(0, suffs[v].length - 1);
            }
        }
    }
    return output;
}

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'daily',
            description: 'get your daily reward',
            tags: [ 'economy' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            let date = new Date();
            let day = date.getDate();
            let lastDaily = context.local.user.daily;
            if (day != lastDaily) {
                await context.inventory.addMoney(context, context.user.id, 200);
                context.local.user.daily = day;
                embed.setDescription(`**200g** was added to your balance`);
            }
    
            else {
                var to = new Date();
                to.setDate(day+1);
                to.setHours(0, 0, 0, 0);
                var difference = to.getTime() - date.getTime();
                embed.setDescription(`you can get your next daily in **${parseDate(difference)}**`);
            }
    
            context.channel.send({ embeds: [embed] });
        });
    }
}