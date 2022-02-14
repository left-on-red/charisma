let child_process = require('child_process');
let fs = require('fs');
let blessed = require('blessed');
let chokidar = require('chokidar');

process.stdin.setRawMode(true);

let recur = (path, callback) => {
    if (fs.statSync(path).isDirectory()) {
        let dir = fs.readdirSync(path);
        for (let d = 0; d < dir.length; d++) { recur(`${path}\\${dir[d]}`, callback) }
    }

    else { callback(path) }
}

let screen = blessed.screen({
    smartCSR: true,
    dockBorders: true
});

let toolbar = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: 1
});

let speed_tool = blessed.box({
    height: 1,
    width: '20%'
});

let hotswaps = blessed.box({
    height: 1,
    right: 0,
    width: '50%',
    tags: true
});

toolbar.append(speed_tool);
toolbar.append(hotswaps);

let log = blessed.box({
    top: 1,
    left: 0,
    width: '100%',
    height: '100%-2',
    scrollable: true,
    mouse: true,

    border: {
        type: 'line',
        fg: 'lightgray'
    },
    
    scrollbar: {
        ch: ' ',
        style: {
            bg: 'white'
        }
    }
});

let caret = blessed.box({
    left: 1,
    bottom: 0,
    width: 1,
    height: 1,
    fg: 'green'
});

let input = blessed.textbox({
    left: 3,
    bottom: 0,
    width: '100%-3',
    height: 1
});

caret.content = '>';

let scroll_mode = 'auto';
let scroll_speed = 1;

setInterval(() => {
    if (scroll_mode == 'auto') { log.scroll(100) }
    speed_tool.content = `scroll: ${scroll_mode}`;
    screen.render();
}, 10);

screen.append(toolbar);
screen.append(log);
screen.append(caret);
screen.append(input);

input.focus();

let child = child_process.fork('src/bot.js', { silent: true });

// mongod.exe --dbpath ./data --port 531
// rethinkdb.exe --bind all --driver-port 531
let dbproc = child_process.spawn('./rethink/rethinkdb.exe', [ '--directory', `${__dirname}/rethink/data`, '--driver-port', '531']);

child.stdout.on('data', (chunk) => { log.content = log.content + chunk });
child.stderr.on('data', (chunk) => { log.content = log.content + chunk });

child.on('message', function(msg) {
    if (msg == 'KILL') { process.exit() }
    else if (msg == 'READY') {

        let commands = [];
        recur(`${__dirname}\\src\\commands`, (path) => { commands.push(path) });
        chokidar.watch(commands).on('change', (path) => { child.send(`HOTSWAP_COMMAND ${path}`) });

        let slashes = [];
        recur(`${__dirname}\\src\\slashes`, (path) => { slashes.push(path) });
        chokidar.watch(slashes).on('change', (path) => { child.send(`HOTSWAP_SLASH ${path}`) });

        let modules = [];
        recur(`${__dirname}\\src\\core\\modules`, (path) => { modules.push(path) });
        chokidar.watch(modules).on('change', (path) => { child.send(`HOTSWAP_MODULE ${path}`) });
    }

    else if (msg.startsWith('HOTSWAP_NOTIF')) {
        let path = msg.slice(14);
        hotswaps.content = `{right}hotswapped ${path}{/right}`;
        setTimeout(() => { hotswaps.content = '' }, 2000);
    }
});
dbproc.on('exit', function() { child.send('KILL rethink database process terminated unexpectedly...') });

let read = (error, value) => {
    child.send(`COMMAND ${value}`);
    input.value = '';
    input.readInput((e, v) => { read(e, v) });
}

input.readInput((error, value) => { read(error, value) });
input.key('C-c', () => { child.send('KILL') });
input.key('C-up', () => {
    scroll_mode = 'manual';
    log.scroll(0 - scroll_speed);
});

input.key('C-down', () => {
    scroll_mode = 'manual';
    log.scroll(0 + scroll_speed);
    if (log.getScrollHeight() - log.getScroll() == 1) { scroll_mode = 'auto' }
});

screen.render();