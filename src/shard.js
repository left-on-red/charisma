let Discord = require('discord.js');
let fs = require('fs');

let AssetManager = require('./core/AssetManager.js');

let BotContext = require('./core/BotContext.js');

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

// overwrites console object with new methods
// (not really sure if this is good practice but I did it anyway)

let flags = [];
for (let f in Discord.Intents.FLAGS) { flags.push(Discord.Intents.FLAGS[f]) }

let client = new Discord.Client({
    intents: flags
});

let context = new BotContext(client);
let manager = new AssetManager(context);

global.console.log = (out) => context.system.debug(out);
global.console.info = (out) => context.system.info(out);
global.console.warn = (out) => context.system.warn(out);
global.console.error = (out) => context.system.error(out);

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
    client.on('ready', async function() {
        // disconnects from any voice channels (if she's in any)
        for (let c = 0; c < client.voice.connections.array().length; c++) { client.voice.connections.array()[c].disconnect() }

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
        if (msg == 'KILL') {
            context.music.instances.forEach(i => i.connection.destroy());
            process.send('KILL');
        }

        else if (msg == 'DEAD_DB') {
            context.music.instances.forEach(i => i.connection.destroy());
            context.system.error('FATAL: rethink db exited...');
            process.send('KILL');
        }

        else if (msg.startsWith('COMMAND')) {
            context.system.info(`received: ${msg}`);
        }
    });
}

client.on('error', function(error) { context.system.error(error) });
client.on('disconnect', function(error) { context.system.error(error) });

start();

client.login(token);