let LoggingStream = require('./LoggingStream.js');
let util = require('util');

let colors = require('ansi-colors');

function trace() {
    let error = new Error();
    let location = error.stack.split('\n')[3].split('\\')[error.stack.split('\n')[3].split('\\').length - 1];
    if (location.endsWith(')')) { location = location.slice(0, -1) }
    return location;
}

let construct_string = (token, string, prepend = '') => {
    if (typeof string != 'string') { string = string != undefined ? string.toString ? string.toString() : `${string}` : 'undefined' }
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
    constructor(output) {
        /**
         * @type {Map<string, LoggingStream>}
         */
        this.streams = new Map();
        this.output = output;
        this.addStream('system').subscribe();
    }

    /**
     * 
     * @param {string} channel 
     * @returns {LoggingStream}
     */
    addStream(channel) {
        let stream = new LoggingStream(channel);
        this.streams.set(channel, stream);
        return stream;
    }


    log(channel, string) {
        let stream = this.streams.get(channel);
        stream.write(`${string}\n`);

        if (stream.subscribed) {
            if (this.output) { this.output.write(`${string}\n`) }
            else { process.stdout.write(`${string}\n`) }
        }
    }

    info(channel, out) {
        let token = colors.cyan(`[#${channel}/INFO]`);
        this.log(channel, construct_string(token, out));
    }

    ok(channel, out) {
        let token = colors.green(`[#${channel}/OK]`);
        this.log(channel, construct_string(token, out));
    }

    warn(channel, out) {
        let token = colors.yellow(`[#${channel}/WARN]`);
        this.log(channel, construct_string(token, out));
    }

    error(channel, out) {
        let token = colors.bgRed.black(`[#${channel}/ERR]`);
        if (out instanceof Error) { out = out.stack }
        this.log(channel, construct_string(token, out));
    }

    debug(channel, out) {
        let token = colors.blue(`[#${channel}/DEBUG:${trace()}]`);
        if (typeof out == 'object') {
            let obj = util.inspect(out, {
                depth: Infinity,
                colors: true,
                compact: false
            });

            let arr = obj.split('\n');
            for (let a = 0; a < arr.length; a++) { arr[a] = arr[a].padStart(arr[a].length - 2 + (arr[a].search(/\S/) + 2), ' ') }
            this.log(channel, construct_string(token, arr.join('\n')));
        }

        else { this.log(channel, construct_string(token, out)) }
    }

    /**
     * 
     * @param {string} channel 
     * @returns {LoggingStream}
     */
    getStream(channel) {
        if (this.streams.has(channel)) { return this.streams.get(channel) }
        else { return null }
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