let Discord = require('discord.js');
let BotContext = require('./../BotContext.js');
let CommandContext = require('./../CommandContext.js');
let CoreModule = require('./../CoreModule.js');

class ReactionModule extends CoreModule {
    /**
     * 
     * @param {BotContext} context 
     */
    constructor(context) {
        super('reactions');
        this.context = context;
    }

    /**
     * 
     * @param {string} type 
     * @param {Discord.GuildMember} from 
     * @param {Discord.GuildMember} to 
     * @param {CommandContext} context 
     */
    getText(type, from, to, context) {
        let special;
        let output;
        switch (type) {
            case 'hug': special = 'hugged'; break;
            case 'pat': special = 'pat'; break;
            case 'poke': special = 'poked'; break;
            case 'kiss': special = 'kissed'; break;
            case 'cuddle': special = 'cuddled'; break;
            case 'slap': special = 'slapped'; break;
            case 'bite': special = 'bit'; break;
            case 'lick': special = 'licked'; break;
            case 'tickle': special = 'tickled'; break;
            case 'nuzzle': special = 'nuzzled'; break;
        }

        let fromName = from.displayName;
        let toName = to.displayName;

        if (context.flavors.get(context.local.guild.flavor)[type]) {
            if (context.user.id == to.id) {
                output = context.flavors.variables(context.flavors.pick(context.local.guild.flavor, type, 'self'),
                [{ name: 'user', value: from.displayName }]);
            }

            else if (to.id == context.client.user.id) {
                output = context.flavors.variables(context.flavors.pick(context.local.guild.flavor, type, 'bot'),
                [{ name: 'user', value: from.displayName }]);
            }

            else {
                output = context.flavors.variables(context.flavors.pick(context.local.guild.flavor, type, 'standard'),
                [{ name: 'user', value: from.displayName }, { name: 'target', value: to.displayName }])
            }

        }

        else { output = `**${fromName}** just ${special} **${toName}**~!` }

        return output;
    }

    getUrl = async (type) => await this.context.tenor.randomGif(`anime ${type}`);

    /**
     * 
     * @param {string} type 
     * @param {Discord.GuildMember} from 
     * @param {Discord.GuildMember} to 
     * @param {CommandContext} context 
     */
    getEmbed = async (type, from, to, context) => {
        let text = this.context.reactions.getText(type, from, to, context);
        let url = await this.context.reactions.getUrl(type);

        let embed = new Discord.MessageEmbed();
        embed.setColor(context.local.guild.colors.accent);
        embed.setDescription(text);
        embed.setImage(url);

        return embed;
    }
}

module.exports = ReactionModule;