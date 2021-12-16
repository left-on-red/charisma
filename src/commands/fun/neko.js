var Discord = require('discord.js');
var https = require('https');

module.exports = {
    config: {
        permissions: [],
        description: 'gets a cute neko~! (*^ω^*)',
        hidden: false,
        nsfw: false,
        tags: ['fun'],
        params: []
    },

    command: function(imports) {
        var embed = new Discord.MessageEmbed();
        embed.setColor(context.config.bot.accent);
    
        if (imports.channel.nsfw) {
            https.get('https://nekos.life/api/v2/img/lewd', function(response) {
                var data = '';
                response.on('data', function(chunk) {
                    data += chunk;
                });
    
                response.on('end', function() {
                    var json = JSON.parse(data);
                    embed.setImage(json.url);
                    imports.channel.send({ embeds: [embed] });
                });
            });
        }
    
        else {
            https.get('https://nekos.life/api/v2/img/neko', function(response) {
                var data = '';
                response.on('data', function(chunk) {
                    data += chunk;
                });
    
                response.on('end', function() {
                    var json = JSON.parse(data);
                    embed.setImage(json.url);
                    imports.channel.send({ embeds: [embed] });
                });
            });
        }
    }
}