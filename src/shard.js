let Discord = require('discord.js');
let ansi = require('ansi-colors');
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
        recur(`${__dirname}/commands`, (path) => { count += manager.registerCommand(path) }, js_file);
        return `loaded ${count} commands`;
    },

    slashes: async function() {
        let count = 0;
        recur(`${__dirname}/slashes`, (path) => { count += manager.registerSlash(path) }, js_file);
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
        // for (let c = 0; c < client.voice.connections.array().length; c++) { client.voice.connections.array()[c].disconnect() }

        context.system.info(await load.commands());
        context.system.info(await load.daemons());
        
        context.system.info(await load.parameters());
        context.system.info(await load.permissions());

        context.system.info(await load.slashes());

        await load.sets();
        await load.gets();

        await load.finish();

        context.system.ok(`logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);

        (await client.guilds.fetch()).forEach((guild) => { context.logging.addStream(`guild.${guild.id}`) });

        process.send('READY');
    });

    process.on('message', async function(msg) {
        let notify_hotswap = (str) => process.send(`NOTIFY hotswapped ${str}`);
        let notify_command = (str) => process.send(`NOTIFY ${str}`);

        if (msg.startsWith('KILL')) {
            let reason = msg.length == 4 ? null : msg.slice(5);
            context.music.instances.forEach(i => i.connection.destroy());
            if (reason) { context.system.error(`FATAL: ${reason}`) }
            else { context.system.info(`process terminated...`) }
            process.send('KILL');
        }

        else if (msg.startsWith('COMMAND')) {
            let cmd = msg.slice(8);
            if (cmd != '') {
                let args = cmd.split(' ');
                if (args[0] == 'channels') {
                    let lines = ['available channels:'];
                    context.logging.streams.forEach(v => lines.push(`${v.subscribed ? ansi.green(`- #${v.name}`) : ansi.red(`- #${v.name}`)}`));
                    context.system.info(lines.join('\n'));
                }

                else if (args[0] == 'subscribe') {
                    if (!args[1]) { return notify_command(`logging channel is required`) }
                    let stream = context.logging.getStream(args[1]);
                    if (!stream) { return notify_command(`logging channel "#${args[1]}" does not exist`) }
                    if (stream.subscribed) { return notify_command(`you are already subscribed to #${args[1]}`) }
                    stream.subscribe();
                    return notify_command(`{green-fg}subscribed to #${args[1]}{/green-fg}`);
                }

                else if (args[0] == 'unsubscribe') {
                    if (!args[1]) { return notify_command(`logging channel is required`) }
                    let stream = context.logging.getStream(args[1]);
                    if (!stream) { return notify_command(`logging channel "#${args[1]}" does exist`) }
                    if (!stream.subscribed) { return notify_command(`you are already unsubscribed from #${args[1]}`) }
                    stream.unsubscribe();
                    return notify_command(`{green-fg}unsubscribed from #${args[1]}{/green-fg}`);
                }

                else if (args[0] == 'register') {
                    let types = ['command', 'parameter', 'slash', 'module'];

                    if (!args[1]) { return notify_command(`register type is required (${types.join(', ')})`) }
                    if (!types.includes(args[1])) { return notify_command(`invalid register type "${args[1]}"; expected (${types.join(', ')})`) }
                    if (!args[2]) { return notify_command(`expected register path`) }
                    let path = `${__dirname}\\${args[2].replace(/\//, '\\')}`;
                    let visual = path.replace(/\\/g, '/').slice(__dirname.length + 5);
                    
                    if (!fs.existsSync(path)) { return notify_command(`path does not exist`) }
                    if (fs.statSync(path).isFile()) { return notify_command(`specified path must be a file`) }

                    if (args[1] == 'command') {
                        let success = manager.registerCommand(path);
                        if (success) {
                            process.send(`LISTEN_COMMAND ${path}`);
                            return notify_command(`{green-fg}registered command ${visual}{/green-fg}`);
                        }

                        else { return notify_command(`failed to register command ${visual}`) }
                    }

                    else if (args[1] == 'parameter') {
                        let success = manager.registerParameter(path);
                        if (success) {
                            process.send(`LISTEN_PARAMETER ${path}`);
                            return notify_command(`{green-fg}registered parameter ${visual}{/green-fg}`);
                        }

                        else { return notify_command(`failed to register parameter ${visual}`) }
                    }

                    else if (args[1] == 'slash') {
                        let success = manager.registerSlash(path);
                        if (success) {
                            process.send(`LISTEN_SLASH ${path}`);
                            return notify_command(`{green-fg}registered slash ${visual}{/green-fg}`);
                        }

                        else { return notify_command(`failed to register slash ${visual}`) }
                    }

                    else if (args[1] == 'module') {

                    }
                }

                else { return notify_command(`invalid command "${args[0]}"`) }
            }
        }

        else if (msg.startsWith('HOTSWAP_COMMAND')) {
            let path = msg.slice(16);
            let notif_path = `src\\${path.slice(__dirname.length+1)}`.replace(/\\/g, '/');
            manager.registerCommand(path);
            notify_hotswap(notif_path);
        }

        else if (msg.startsWith('HOTSWAP_PARAMETER')) {
            let path = msg.slice(18);
            let notif_path = `src\\${path.slice(__dirname.length+1)}`.replace(/\\/g, '/');
            manager.registerParameter(path);
            notify_hotswap(notif_path);
        }

        else if (msg.startsWith('HOTSWAP_SLASH')) {
            let path = msg.slice(14);
            let notif_path = `src\\${path.slice(__dirname.length+1)}`.replace(/\\/g, '/');
            manager.registerSlash(path);
            notify_hotswap(notif_path);
        }

        else if (msg.startsWith('HOTSWAP_MODULE')) {
            // hotswapping entire modules doesn't seem like a very good idea,
            // but I wasn't really sure how else to go about it.
            // hopefully this is sound logic

            let path = msg.slice(15);
            let notif_path = `src\\${path.slice(__dirname.length+1)}`.replace(/\\/g, '/');
            
            delete require.cache[require.resolve(path)];
            let core_module = new (require(path))(context);
            let name = core_module.module_name;
            if (context[name].module_unload) { context[name].module_unload() }
            context[name] = core_module;

            notify_hotswap(notif_path);
        }
    });
}

client.on('error', function(error) { context.system.error(error) });
client.on('disconnect', function(error) { context.system.error(error) });

start();

client.login(token);