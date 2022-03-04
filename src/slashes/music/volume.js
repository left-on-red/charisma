let Slash = require('./../../core/Slash.js');

module.exports = class extends Slash {
    constructor() {
        super('volume', 'change the volume of the music stream');

        this.append(Slash.Integer('volume', 'the volume level', true).min(0).max(100));

        this.interact(async (context, options) => {
            let result = context.music.check(context);

            if (result == -1) {
                if (context.music.instances.has(context.guild.id)) {
                    let volume = options.getInteger('volume', true);
                    context.music.volume(context.guild.id, volume);
                    context.ephemeral(`set the music stream volume to \`${volume}\``);
                }

                else { context.ephemeral(`I'm not currently playing anything`) }
            }

            else { context.ephemeral(context.music.errors[result]) }
        });
    }
}