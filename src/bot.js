let fs = require('fs');
let Discord = require('discord.js');

let config = require('./../config.json');

let sharding = config.sharding;
let token = config.token;

let child_process = require('child_process');

//mongod.exe --dbpath ./data --port 531
//rethinkdb.exe --bind all --driver-port 531
let dbproc = child_process.spawn('./rethink/rethinkdb.exe', [ '--directory', `${__dirname}/../rethink/data`, '--driver-port', '531']);
dbproc.stderr.pipe(process.stderr);
dbproc.on('exit', function() { console.log('database exited...') });

if (sharding) {
    let manager = new Discord.ShardingManager('./src/shard.js', {
        totalShards: 2,
        token: token
    });

    manager.spawn(manager.totalShards, 2000);
    manager.on('launch', function(shard) { console.log(`shard ${shard.id+1}/${manager.totalShards} launched`) });
}

else {
    let child_process = require('child_process');
    let child = child_process.fork('src/shard.js', { silent: true });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    process.on('message', function(msg) { child.send(msg) });
    child.on('message', function(msg) { process.send(msg) })

}