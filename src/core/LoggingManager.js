let colors = require('./../colors.js');
let LoggingStream = require('./LoggingStream.js');
let util = require('util');

function trace() {
    let error = new Error();
    //console.info(error.stack.split('\n')[3]);
    let location = error.stack.split('\n')[3].split('\\')[error.stack.split('\n')[3].split('\\').length - 1];
    if (location.endsWith(')')) { location = location.slice(0, -1) }
    return location;
}

let info_color = colors.fg.getRGB(1, 1, 5);
let ok_color = colors.fg.getRGB(1, 5, 1);
let warn_color = colors.fg.getRGB(5, 5, 1);
let error_color = colors.bg.getRGB(5, 0, 0) + colors.fg.getRGB(0, 0, 0);
let debug_color = colors.fg.getRGB(5, 3, 2);

let construct_string = (token, string, prepend = '') => {
    let raw = token.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
    let padding = ''.padEnd(raw.length, ' ');
    let lines = string.split('\n');
    for (let l = 0; l < lines.length; l++) {
        let starter = l == 0 ? token : padding;
        lines[l] = `${prepend}${starter} ${lines[l]}`;
    }

    return lines.join('\n');
}

class LoggingManager {
    constructor() {
        /**
         * @type {Map<string, LoggingStream>}
         */
        this.streams = new Map();
        this.addStream('system');
    }

    addStream(channel) {
        if (!this.active) { this.active = channel }

        let stream = new LoggingStream(channel);
        this.streams.set(channel, stream);
    }


    log(channel, string) {
        if (!this.streams.has(channel)) { this.streams.addStream(channel) }
        this.streams.get(channel).write(`${string}\n`);
        if (this.active == channel) { process.stdout.write(`${string}\n`) }
    }

    info(channel, out) {
        let token = `${info_color}[#${channel}/INFO]${colors.reset}`;
        this.log(channel, construct_string(token, out));
    }

    ok(channel, out) {
        let token = `${ok_color}[#${channel}/OK]${colors.reset}`;
        this.log(channel, construct_string(token, out));
    }

    warn(channel, out) {
        let token = `${warn_color}[#${channel}/WARN]${colors.reset}`;
        this.log(channel, construct_string(token, out));
    }

    error(channel, out) {
        let token = `${error_color}[#${channel}/ERR]${colors.reset}`;
        if (out instanceof Error) { out = out.stack }
        this.log(channel, construct_string(token, out, colors.fg.getRGB(5, 1, 1)));
    }

    debug(channel, out) {
        let token = `${debug_color}[#${channel}/DEBUG:${trace()}]${colors.reset}`;
        if (typeof out == 'string') {
            this.log(channel, construct_string(token, out));
        }

        else if (typeof out == 'object') {
            let obj = util.inspect(out, {
                depth: Infinity,
                colors: true,
                compact: false
            });

            let arr = obj.split('\n');
            for (let a = 0; a < arr.length; a++) { arr[a] = arr[a].padStart(arr[a].length - 2 + (arr[a].search(/\S/) + 2), ' ') }
            this.log(channel, construct_string(token, arr.join('\n')));
        }
    }

    /**
     * 
     * @param {string} channel 
     * @returns {{info:(message:string) => void, ok:(message:string) => void, warn:(message:string) => void, error:(message:string) => void, debug:(message:string) => void}}
     */
    getReference(channel) {
        let info = this.info.bind(this, channel);
        let ok = this.ok.bind(this, channel);
        let warn = this.warn.bind(this, channel);
        let error = this.error.bind(this, channel);
        let debug = this.debug.bind(this, channel);

        return { info, ok, warn, error, debug }
    }
}

module.exports = LoggingManager;