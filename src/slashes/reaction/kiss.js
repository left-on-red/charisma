let ReactionSlash = require('./../../core/templates/ReactionSlash.js');

module.exports = class extends ReactionSlash {
    constructor() {
        super('kiss', 'kiss', 'kissed');
    }
}