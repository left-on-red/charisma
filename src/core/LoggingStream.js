let { Writable } = require('stream');
let fs = require('fs');
let moment = require('moment');

class LoggingStream extends Writable {
    constructor(name) {
        super();
        this.name = name;
    }

    _write(chunk, encoding, next) {
        if (!fs.existsSync(`./logs/#${this.name}`)) { fs.mkdirSync(`./logs/#${this.name}`) }

        let path = `./logs/#${this.name}/${moment().format('MM-DD-YY')}.log`;
        let exists = fs.existsSync(path);
        let file = '';
        if (exists) { file = fs.readFileSync(path).toString() }
        file += chunk;
        file = file.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        fs.writeFileSync(path, file);
        next();
    }
}

module.exports = LoggingStream;