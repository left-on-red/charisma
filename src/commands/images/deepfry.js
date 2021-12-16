let ImageCommand = require('./../../core/templates/ImageCommand.js');

module.exports = class extends ImageCommand {
    constructor() {
        super('deepfry', 'deepfry an image');
        this.magick(data => { data.modulate(120, 400).contrast(10).quality(0.001).sharpen(10, 1) })
    }
}