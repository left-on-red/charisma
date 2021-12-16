let readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

let child_process = require('child_process');
let child = child_process.fork('src/bot.js', { silent: true });

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stdout);

child.on('message', function(msg) { if (msg == 'STOP') { process.exit() } });

process.stdin.on('keypress', function(str, key) {
    if (key.ctrl && key.name == 'c') { child.send('STOP') }
});