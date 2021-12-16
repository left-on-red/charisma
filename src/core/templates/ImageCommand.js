let gm = require('gm');
let Command = require('./../Command.js');

module.exports = class ImageCommand extends Command {
    constructor(name, description) {
        super({
            name: name,
            description: description,
            tags: [ 'fun', 'image', 'patreon' ]
        });

        this.fn = () => {};

        this.push([], async (context) => {
            let image = await context.image.getLastImage(context);

            let attachment;

            let embed = new context.Discord.MessageEmbed();
            embed.setColor(context.config.bot.accent);

            if (image) {
                try {
                    context.channel.sendTyping();

                    let data = gm(image.buffer, image.attachment.filename);
                    this.fn(data);

                    let buffer = await context.image.gmToBuffer(data);
                    attachment = new context.Discord.MessageAttachment(buffer, `${name}_${image.attachment.name}`);

                    embed.setImage(`attachment://${name}_${image.attachment.name}`);
                }

                catch(e) {
                    console.error(e);
                    embed.setDescription('an error occurred while trying to process your image!');
                }
            }

            else { embed.setDescription('no images were found') }

            context.channel.send({ embeds: [embed], files: [attachment] });
        });
    }

    /**
     * 
     * @param {(data: gm.State) => void} fn 
     */
    magick(fn) { this.fn = fn }
}