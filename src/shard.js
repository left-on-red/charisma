let Discord = require('discord.js');
let fs = require('fs');
let util = require('util');

let Command = require('./core/Command.js');
let Slash = require('./core/Slash.js');
let AssetManager = require('./core/AssetManager.js');

let BotContext = require('./core/BotContext.js');
let colors = require('./colors.js');

let js_file = /\.[0-9a-z]+$/i;

let config = require('./../config.json');
let token = config.token;

/**
 * 
 * @param {string} path 
 * @param {(path: string) => void} callback 
 * @param {RegExp} regex
 */
async function recur(path, callback, regex) {
    path = path.replace(/\\/g, '/');
    let dir = fs.readdirSync(path);
    for (let d = 0; d < dir.length; d++) {
        if (fs.statSync(`${path}/${dir[d]}`).isDirectory()) { recur(`${path}/${dir[d]}`, callback, regex) }
        else {
            if (regex && dir[d].match(regex).length == 0) { continue }

            if (callback.constructor.name === 'AsyncFunction') { await callback(`${path}/${dir[d]}`) }
            else { callback(`${path}/${dir[d]}`) }
        }
    }
}

function trace() {
    let error = new Error();
    //console.info(error.stack.split('\n')[3]);
    let location = error.stack.split('\n')[3].split('\\')[error.stack.split('\n')[3].split('\\').length - 1];
    if (location.endsWith(')')) { location = location.slice(0, -1) }
    return location;
}

// overwrites console object with new methods
// (not really sure if this is good practice but I did it anyway)
// TODO: possibly store any errors logged with error methods in some sort of error log file

//process.stdout.on('data', function(data) { process.send({ type: 'log', content: data }) });


global.console.log = function(out) {
    //let marker = colors.fg.wrap('[?]', colors.colors.log);
    //if (options.logs.showOriginFile) { marker = colors.fg.wrap(`[${trace()}]`, colors.colors.log) }

    let marker = colors.fg.wrap(`[${trace()}]`, colors.colors.log);
    let str;

    if (typeof out == 'string') { str = out }
    else { str = util.inspect(out, false, 10, true) }

    let split = str.split('\n');
    for (let s = 0; s < split.length; s++) { split[s] = `${marker} ${split[s]}` }
    process.stdout.write(`${split.join('\n')}\n`);
}

global.console.info = function(out) { process.stdout.write(`${colors.fg.wrap('[~]', colors.colors.info)} ${out}\n`) }
global.console.ready = function(out) { process.stdout.write(`${colors.fg.wrap('[+]', colors.colors.ready)} ${out}\n`) }
global.console.warn = function(out) { process.stdout.write(`${colors.fg.wrap('[-]', colors.colors.warning)} ${out}\n`) }

global.console.error = function(out) {
    let marker = colors.fg.wrap('[!]', colors.colors.error);
    if (out instanceof Error) {
        let lines = out.stack.split('\n');
        for (let l = 0; l < lines.length; l++) { lines[l] = `${marker} ${lines[l]}` }
        process.stdout.write(`${lines.join('\n')}\n`);
    }

    else { process.stdout.write(`${marker} ${out}\n`) }
}

let flags = [];
for (let f in Discord.Intents.FLAGS) { flags.push(Discord.Intents.FLAGS[f]) }

let client = new Discord.Client({
    intents: flags
});

let context = new BotContext(client);

let manager = new AssetManager(context);

let load = {
    gets: function() {
        let dir = fs.readdirSync(`./src/gets`);
        for (let d = 0; d < dir.length; d++) {
            if (dir[d].endsWith('.js')) {
                let gets = require(`./gets/${dir[d]}`);
                if (gets.init) { context.gets.inits.push(gets.init) }
                if (gets.gets) { for (let g in gets.gets) { context.gets.data[g] = gets.gets[g] } }
            }
        }
    },

    sets: function() {
        let dir = fs.readdirSync(`./src/sets`);
        for (let d = 0; d < dir.length; d++) {
            if (dir[d].endsWith('.js')) {
                let sets = require(`./sets/${dir[d]}`);
                if (sets.init) { context.sets.inits.push(sets.init) }
                if (sets.sets) { for (let s in sets.sets) { context.sets.data[s] = sets.sets[s] } }
            }
        }
    },

    permissions: function() {
        let count = 0;

        let dir = fs.readdirSync(`./src/permissions`);
        for (let d = 0; d < dir.length; d++) {
            let perms = require(`./permissions/${dir[d]}`);
            function recur(src, dest) {
                for (let s in src) {
                    if (typeof src[s] == 'object') { dest[s] = {}; recur(src[s], dest[s]) }
                    else { dest[s] = src[s]; count++; }
                }
            }

            recur(perms, context.commands.permissions);
        }

        return `loaded ${count} permissions`;
    },

    parameters: async function() {
        let count = 0;
        recur(`${__dirname}/parameters`, (path) => { count += manager.registerParameter(path) }, js_file)
        return `loaded ${count} parameter types`;
    },

    commands: async function() {
        let count = 0;
        await recur(`${__dirname}/commands`, (path) => { count += manager.registerCommand(path) }, js_file);
        return `loaded ${count} commands`;
    },

    slashes: async function() {
        let count = 0;
        await recur(`${__dirname}/slashes`, (path) => { count += manager.registerSlash(path) }, js_file);

        // adding slash commands to guilds has been delegated to seperate text commands

        //let generated = [];
        //context.slashes.forEach(v => generated.push(v.raw()));

        /*let guild = await context.client.guilds.fetch('780276463311257611');
        let commands = JSON.parse(JSON.stringify(await guild.commands.fetch()));

        for (let c = 0; c < commands.length; c++) {
            let id = commands[c].id;
            let command = {
                name: commands[c].name,
                description: commands[c].description,
                options: commands[c].options
            }

            let current = generated.find(v => v.name == command.name);
            if (!current) { await guild.commands.delete(id) }
        }

        context.client.application.commands.set(generated, '780276463311257611');*/

        return `loaded ${count} slashes`;
    },

    daemons: async function() {
        let count = 0;
        await recur(`${__dirname}/daemons`, async (path) => { count += await manager.registerDaemon(path) }, js_file);
        return `loaded ${count} daemons`;
    },

    finish: async function() {
        for (let i = 0; i < context.gets.inits.length; i++) {
            if (context.gets.inits[i].constructor.name === 'AsyncFunction') { await context.gets.inits[i](context) }
            else { context.gets.inits[i](context) }
        }

        for (let i = 0; i < context.sets.inits.length; i++) {
            if (context.sets.inits[i].constructor.name === 'AsyncFunction') { await context.sets.inits[i](context) }
            else { context.sets.inits[i](context) }
        }

        if (context.data) { await context.data.start() }
        if (context.messageListener) { context.messageListener() }
    }
}

async function start() {
    console.log('start');
    client.on('ready', async function() {
        context.logging.debug('system', 'READY SYSTEM LOGS');
        //context.logging.debug('system', { a: { b: [1, 0, 2], c: 100 } });
        //context.system.error(new Error('testing 123!'));
        // disconnects from any voice channels (if she's in any)
        //for (let c = 0; c < client.voice.connections.array().length; c++) { client.voice.connections.array()[c].disconnect() }

        context.system.info(await load.commands());
        context.system.info(await load.daemons());
        
        context.system.info(await load.parameters());
        context.system.info(await load.permissions());

        context.system.info(await load.slashes());

        await load.sets();
        await load.gets();

        await load.finish();

        context.system.ok(`logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
    });

    process.on('message', async function(msg) {
        if (msg == 'STOP') {
            context.music.instances.forEach(i => i.connection.destroy());
            //client.voice.adapters.forEach(v => console.log(Object.keys(v)));
            //client.voice.adapters.forEach(v => v.destroy());
            process.send('STOP');
        }
    });
}

client.on('error', function(error) { context.system.error(error) });
client.on('disconnect', function(error) { context.system.error(error) });

start();

client.login(token);