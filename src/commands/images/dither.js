let ImageCommand = require('./../../core/templates/ImageCommand.js');

module.exports = class extends ImageCommand {
    constructor() {
        super('dither', 'dither an image');
        this.magick(data => {
            data
                .orderedDither('Red', '2x2')
                .orderedDither('Green', '2x2')
                .orderedDither('Blue', '2x2')
                .orderedDither('Magenta', '2x2')
                .orderedDither('Yellow', '2x2')
                .orderedDither('Cyan', '2x2') });
    }
}