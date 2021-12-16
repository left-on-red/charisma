let ImageCommand = require('./../../core/templates/ImageCommand.js');

module.exports = class extends ImageCommand {
    constructor() {
        super('dither', 'dither an image');
        this.magick(data => { data.orderedDither('Red', '4x4').orderedDither('Green', '4x4').orderedDither('Blue', '4x4').orderedDither('Magenta', '4x4').orderedDither('Yellow', '4x4').orderedDither('Cyan', '4x4') });
    }
}