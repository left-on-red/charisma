let child_process = require('child_process');
let fs = require('fs');
let http = require('http');

let chokidar = require('chokidar');
let express = require('express');
let { Server } = require('socket.io');
let colors = require('ansi-colors');

let args = process.argv;
args.shift();
args.shift();

process.stdin.setRawMode(true);

if (process.platform == 'win32') {
    let rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('SIGINT', () => { process.emit('SIGINT') })
}

let recur = (path, callback) => {
    if (fs.statSync(path).isDirectory()) {
        let dir = fs.readdirSync(path);
        for (let d = 0; d < dir.length; d++) { recur(`${path}\\${dir[d]}`, callback) }
    }

    else { callback(path) }
}

let child = child_process.fork('src/bot.js', { silent: true });

// mongod.exe --dbpath ./data --port 531
// rethinkdb.exe --bind all --driver-port 531
let dbproc = child_process.spawn('./rethink/rethinkdb.exe', [ '--directory', `${__dirname}/rethink/data`, '--driver-port', '531', '--no-http-admin']);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

let commands = [];
let slashes = [];
let modules = [];
let parameters = [];

recur(`${__dirname}\\src\\commands`, (path) => { commands.push(path) });
recur(`${__dirname}\\src\\parameters`, (path) => { parameters.push(path) });
recur(`${__dirname}\\src\\slashes`, (path) => { slashes.push(path) });
recur(`${__dirname}\\src\\core\\modules`, (path) => { modules.push(path) });

let hotswap_command = (path) => { child.send(`HOTSWAP_COMMAND ${path}`) }
let hotswap_parameter = (path) => { child.send(`HOTSWAP_PARAMETER ${path}`) }
let hotswap_slash = (path) => { child.send(`HOTSWAP_SLASH ${path}`) }
let hotswap_module = (path) => { child.send(`HOTSWAP_MODULE ${path}`) }

let banner = `
       .__                 .__                       
  ____ |  |__ _____ _______|__| ______ _____ _____   
_/ ___\\|  |  \\\\__  \\\\_  __ \\  |/  ___//     \\\\__  \\  
\\  \\___|   Y  \\/ __ \\|  | \\/  |\\___ \\|  Y Y  \\/ __ \\_
 \\___  >___|  (____  /__|  |__/____  >__|_|  (____  /
     \\/     \\/     \\/              \\/      \\/     \\/ 
`

let sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve() }, ms);
    });
}

let socket_log = async (socket, msg, wrapper) => {
    
    let arr = msg.split('\n');
    for (let a = 0; a < arr.length; a++) {
        if (wrapper) { arr[a] = wrapper(arr[a]) }
        socket.emit('LOG', arr[a]);
    }
}

child.on('message', function(msg) {
    let io;
    
    if (msg == 'KILL') { process.exit() }
    else if (msg == 'READY') {
        if (args.includes('--dev')) {
            chokidar.watch(commands).on('change', (path) => hotswap_command(path));
            chokidar.watch(parameters).on('change', (path) => hotswap_parameter(path));
            chokidar.watch(slashes).on('change', (path) => hotswap_slash(path));
            chokidar.watch(modules).on('change', (path) => hotswap_module(path));
        }

        let app = express();
        app.get('/', (request, response) => { response.send(fs.readFileSync('./src/web.html').toString()) });

        let server = http.createServer(app)
        io = new Server(server);

        let sockets = new Map();

        io.on('connection', (socket) => {
            console.log(`socket connected: ${socket.id}`);
            
            sockets.set(socket.id, socket);

            socket.on('disconnect', () => {
                console.log(`socket disconnected: ${socket.id}`);
                sockets.delete(socket.id);
            });

            socket.on('CMD', (cmd) => {

                socket.emit('LOG', `${colors.greenBright('>')} ${cmd}`);

                let name = cmd.includes(' ') ? cmd.split(' ')[0] : cmd;
                let rest = cmd.slice(name.length).trim();
                let strings = rest.match(/("([^"]|"")*")/g);
                rest = rest.replace(/("([^"]|"")*")/g, '[s]').split(' ');
                let args = [];

                for (let r = 0; r < rest.length; r++) {
                    if (rest[r] == '[s]') { args.push(strings.shift().slice(1, -1)) }
                    else { args.push(rest[r]) }
                }

                if (name == 'echo') {
                    socket.emit('LOG', args.join(' '));    
                }
            });

            socket.on('BANNER', () => {
                socket.emit('LOG', `${colors.cyanBright(banner)}\n${colors.yellowBright(`designed, written, and maintained by ${colors.redBright('red;#0531')}`)}`);
            });
        });

        server.listen(80, () => { console.log('started express server') });
    }

    else if (msg.startsWith('NOTIFY')) {
        let text = msg.slice(7);
        console.log(text);
    }

    else if (msg.startsWith('LISTEN_COMMAND')) {
        let str = msg.slice(15);
        chokidar.watch(str).on('change', (path) => hotswap_command(path));
    }

    else if (msg.startsWith('LISTEN_PARAMETER')) {
        let str = msg.slice(17);
        chokidar.watch(str).on('change', (path) => hotswap_parameter(path));
    }

    else if (msg.startsWith('LISTEN_SLASH')) {
        let str = msg.slice(13);
        chokidar.watch(str).on('change', (path) => hotswap_slash(path));
    }

    else if (msg.startsWith('LISTEN_MODULE')) {
        let str = msg.slice(14);
        chokidar.watch(str).on('change', (path) => hotswap_module(path));
    }
});

dbproc.on('exit', function() { child.send('KILL rethink database process terminated unexpectedly...') });
process.on('SIGINT', () => { child.send('KILL') });