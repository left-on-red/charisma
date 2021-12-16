let request = require('request');
let extensions = [ 'png', 'jpg', 'jpeg', 'gif' ];

let CommandContext = require('./../CommandContext.js');

async function getBuffer(url) {
    return new Promise(function(resolve, reject) {
        request({ url, encoding: null }, function(error, response, buffer) {
            if (error) { reject(error) }
            else { resolve(buffer) }
        });
    });
}

class ImageModule {
    static gmToBuffer(data) {
        return new Promise(function(resolve, reject) {
            data.stream(function(err, stdout, stderr) {
                if (err) { return reject(err) }
                let chunks = []
                stdout.on('data', function(chunk) { chunks.push(chunk) })
                stdout.once('end', function() { resolve(Buffer.concat(chunks)) })
                stderr.once('data', function(data) { reject(String(data)) })
            });
        });
    }

    /**
     * 
     * @param {CommandContext} context 
     * @returns 
     */
    static async getLastImage(context) {
        let messages = await context.channel.messages.fetch({ limit: 20 });

        messages.sort((msg1, msg2) => msg1.createdTimestamp - msg2.createdTimestamp);

        let attachment;
        messages.forEach((msg, key, map) => {
            if (msg.attachments.size > 0) {
                let file = msg.attachments.last();
                let name = file.name;
                if (extensions.includes(name.split('.')[name.split('.').length - 1].toLowerCase())) {
                    attachment = file;
                    return;
                }
            }

            if (msg.embeds.length > 0) {
                let embed = msg.embeds[msg.embeds.length - 1];
                if (embed.image) {
                    // pseudo attachment object
                    // there's probably a better way of doing this
                    attachment = {
                        url: embed.image.url,
                        name: embed.image.url.split('/')[embed.image.url.split('/').length - 1].split('?')[0]
                    }

                    return;
                }
            }

            if (msg.content.match(/https?:[^\s]+/g)) {
                attachment = {
                    url: msg.content.match(/https?:[^\s]+/g)[0],
                    name: msg.content.match(/https?:[^\s]+/g)[0].split('/')[msg.content.match(/https?:[^\s]+/g)[0].split('/').length - 1].split('?')[0]
                }

                return;
            }
        });

        if (attachment) {
            return {
                attachment: attachment,
                buffer: await getBuffer(attachment.url)
            }
        }

        else { return null }
    }
}

module.exports = ImageModule;