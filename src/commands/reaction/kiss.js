let ReactionCommand = require('./../../core/templates/ReactionCommand.js');

module.exports = class extends ReactionCommand {
    constructor() {
        super('kiss', 'kiss', 'kissed');
    }
}