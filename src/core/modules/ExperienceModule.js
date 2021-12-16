let Discord = require('discord.js');
let CommandContext = require('./../CommandContext.js');

let colors = {
    local: '#6190ff',
    global: '#ffed61'
}

let emoji = {
    local: '751542184246771903',
    global: '751542184418738216'
}

class ExperienceModule {
    _get(level, factor) { return Math.floor((800 * Math.pow(level + 1, factor)) / 5) + 200 };
    
    expToLevel(exp, factor) {
        let level = 0;
        let required = this._get(level + 1, factor);
        while (exp > required) {
            exp -= required;
            level += 1;
            required = this._get(level + 1, factor);
        }

        return level;
    }

    levelToExp(level, factor) {
        let exp = 0;
        for (let l = 0; l < level; l++) { exp += this._get(l + 1, factor) }
        return exp;
    }

    getRelative(exp, factor) {
        let level = this.expToLevel(exp, factor);
        let currentExp = this.levelToExp(level, factor);
        let nextExp = this.levelToExp(level + 1, factor);
        let relativeExp = exp - currentExp;
        let relativeMax = nextExp - currentExp;

        return [relativeExp, relativeMax];
    }

    /**
     * 
     * @param {CommandContext} context 
     * @param {*} exp 
     */
    add = async (context, exp) => {
        let data = await context.data.experience.get(context.user.id);

        let proc_exp = async (scope) => {
            let factor;
            if (scope == 'local') { factor = context.local.guild.leveling.localCurve }
            else if (scope == 'global') { factor = 4 }

            let current;
            if (scope == 'local') {
                if (!data.member[context.guild.id]) { data.member[context.guild.id] = 0 }
                current = data.member[context.guild.id];
            }

            else if (scope == 'global') { current = data.user }

            let before = this.expToLevel(current, factor);
            let after = this.expToLevel(current + exp, factor);

            if (scope == 'local') { data.member[context.guild.id] += exp }
            else if (scope == 'global') { data.user += exp }

            if (after > before) {
                if (context.local.guild.leveling[`${scope}NotificationMode`] == 'full') {
                    let embed = new Discord.MessageEmbed();
                    embed.setColor(colors[scope]);

                    embed.attachFiles([{
                        attachment: context.buffers[`${scope}_arrow`],
                        name: 'arrow.png'
                    }]);

                    embed.setFooter(`level up (${scope})`, 'attachment://arrow.png');

                    if ((after - before) == 1) { embed.setDescription(`**${context.user.tag}** has advanced to **level ${after}**`) }
                    else { embed.setDescription(`**${context.user.tag}** has skipped **${after - before} levels** and advanced to **level ${after}**`) }
                    context.channel.send({ embeds: [embed] });
                }

                else if (context.local.guild.leveling[`${scope}NotificationMode`] == 'discrete') {
                    context.message.react(emoji[scope]);
                }
            }
        }

        if (context.local.guild.options.leveling) { await proc_exp('local') }
        await proc_exp('global');

        await context.data.experience.update(context.user.id, data);
    }
}

module.exports = ExperienceModule;