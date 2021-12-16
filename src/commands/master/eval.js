let Command = require('./../../core/Command.js');

// detects whether or not an object is circular (cannot JSON.stringify circular objects)
function isCyclic(obj) {
    let seenObjects = [];
  
    function detect(obj) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1) { return true }
            seenObjects.push(obj);
            for (var key in obj) { if (obj.hasOwnProperty(key) && detect(obj[key])) { return true } }
        }
        
        return false;
    }
  
    return detect(obj);
}

module.exports = class extends Command {
    constructor() {
        super({
            name: 'eval',
            description: 'evaluates the given statement and returns the output',
            permissions: [ 'BOT.MASTER' ],
            tags: [ 'management', 'utility', 'master' ]
        });

        this.push([
            { type: 'string', required: false }
        ], async (context, parameters) => {
            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);
    
            try {
                var result = await eval(parameters[0]);
                if (result != undefined) {
                    if (typeof result == 'object' || !isCyclic(result)) {
                        var object = JSON.stringify(result, null, 4);
                        if (object.length > 1990) {
                            object = Buffer.from(object);
                            var attachment = new context.Discord.MessageAttachment(object, 'eval.json');
                            context.channel.send({ files: [attachment] });
                        }
    
                        else { embed.setDescription(`\`\`\`json\n${object}\n\`\`\``) }
                    }
    
                    else { embed.setDescription('undefined') }
                }
            }
    
            catch(error) { embed.setDescription(`\`\`\`${error.stack}\`\`\``) }

        });
    }
}