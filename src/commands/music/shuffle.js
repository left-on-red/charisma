function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

let Command = require('./../../core/Command.js');

module.exports = class extends Command {
    constructor() {
        super({
            name: 'shuffle',
            description: 'shuffles the music queue',
            tags: [ 'fun', 'music' ]
        });

        this.push([], async (context) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
            
            let result = context.music.check(context);
            if (result == -1) {
                shuffle(context.music.instances.get(context.guild.id).queue);
                
                context.music.instances.get(context.guild.id).state = 'SHUFFLED';
                context.music.instances.get(context.guild.id).player.stop();

                embed.setDescription(`shuffled the queue`);
            }

            else { embed.setDescription(context.music.errors[result]) }

            context.channel.send({ embeds: [embed] });
        });
    }
}