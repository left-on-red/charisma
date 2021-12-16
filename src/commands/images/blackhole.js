let ImageCommand = require('./../../core/templates/ImageCommand.js');

module.exports = class extends ImageCommand {
    constructor() {
        super('blackhole', 'transform an image into a blackhole!');
        this.magick(data => { data.swirl(100).swirl(100).swirl(100).implode(1) });
    }
}