let Slash = require('./../core/Slash.js');

module.exports = class extends Slash {
    constructor() {
        super('jukebox', 'create a jukebox message for the current music stream');

        this.interact(async (context, options) => {
            let result = context.music.check(context);
            if (result == -1) {
                await context.music.createJukeboxEmbed(context);
            }

            else { context.reply(result) }
        });
    }
}

