let Slash = require('./../core/Slash.js');

module.exports = class extends Slash {
    constructor() {
        super('ping', 'get the ping of the bot');

        this.interact((context, options) => {
            let was = Date.now();
            context.ephemeral('pinging...').then(() => {
                let is = Date.now();
                let diff = is - was;
                context.editReply(`I have a ping of ${diff}ms!`);
            });
        });
    }
}

