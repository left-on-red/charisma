let ReactionCommand = require('./../../core/templates/ReactionCommand.js');

module.exports = class extends ReactionCommand {
    constructor() {
        super('pat', 'pat', 'pat');
    }
}