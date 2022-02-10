let blessed = require('blessed');
let child_process = require('child_process');
let fs = require('fs');
process.stdin.setRawMode(true);

let screen = blessed.screen({
    smartCSR: true,
    dockBorders: true
});

let log = blessed.log({
    top: 0,
    left: 0,
    width: '100%',
    height: '99%',
    border: {
        type: 'line'
    },
    scrollbar: {
        bg: 'white'
    }
});

let input = blessed.textarea({
    left: 0,
    bottom: 0,
    width: '100%',
    height: 3,
    border: {
        type: 'line'
    },

    content: '> '
});

let str = '';
let scroll_mode = 'auto';

setInterval(() => {
    if (scroll_mode == 'auto') { log.scroll(1) }
    screen.render();
}, 10);

screen.append(log);
screen.append(input);
input.focus();

let child = child_process.fork('src/bot.js', { silent: true });

// mongod.exe --dbpath ./data --port 531
// rethinkdb.exe --bind all --driver-port 531
let dbproc = child_process.spawn('./rethink/rethinkdb.exe', [ '--directory', `${__dirname}/rethink/data`, '--driver-port', '531']);

child.stdout.on('data', (chunk) => { log.content = log.content + chunk });
child.stderr.on('data', (chunk) => { log.content = log.content + chunk });

child.on('message', function(msg) { if (msg == 'KILL') { process.exit() } });
dbproc.on('exit', function() { child.send('DEAD_DB') });

screen.key('C-c', () => { child.send('KILL') });

input.key([...'abcdefghijklmnopqrstuvwxyz0123456789'.split(''), 'enter', 'space', 'backspace'], function(ch, key) {
    let char = key.name;
    if (char == 'space') { char = ' ' }
    if (char == 'backspace') { str = str.slice(0, str.length - 1) }
    else if (char == 'enter') {
        child.send(`COMMAND ${str}`);
        str = '';
    }
    else { str += char }
    input.setContent(`> ${str}`);
    screen.render();
});

screen.render();