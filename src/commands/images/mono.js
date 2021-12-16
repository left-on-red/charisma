let ImageCommand = require('./../../core/templates/ImageCommand.js');

module.exports = class extends ImageCommand {
    constructor() {
        super('mono', 'monochrome an image!');
        this.magick((data) => { data.monochrome() });
    }
}