let serverID = '561220044147654681';
let roles = {
    BUBBLEGUM: '591305415912980484'
}

module.exports = {
    PATREON: async function(permission, context) {

        let toReturn = { userPerms: true, botPerms: true, master: false }

        if (!(context.config.options.sharding && !((await context.client.guilds.fetch(serverID)).shardID))) {
            let guild = await context.client.guilds.fetch(serverID, true, true);
            if (guild) {
                try {
                    let member = await guild.members.fetch(context.user.id);
                    if (member) {
                        let role = member.roles.cache.get(roles[permission]);
                        if (!role) { toReturn.userPerms = false }
                    }

                    else { toReturn.userPerms = false; }
                }

                catch(e) { toReturn.userPerms = false; }
            }
        }

        else {
            // TODO: implement sharding compliant logic
        }

        return toReturn;

        // if sharded and guild is not on the current shard

        if (looped) {
            let results = await context.client.shard.broadcastEval(`
                (async function() {
                    let guild = await this.guilds.fetch('${serverID}');
                    if (guild && guild.shardID != undefined) { return guild }
                }).bind(this)();
            `);

            console.log('results 1 passed');

            for (let r = 0; r < results.length; r++) { if (results[r] && results[r].shardID != undefined) { guild = results[r]; break; } }
        }

        //else { guild =  }
        console.log(guild.roles.everyone);


        if (guild) {
            if (roles[permission]) {
                let member;

                if (looped) {

                }

                else { member = guild }

                let role;
                if (looped) {
                    let results = await context.client.shard.broadcastEval(`
                        (async function() {
                            let guild = await this.guilds.fetch('${serverID}');
                            if (guild && guild.shardID != undefined) {
                                let role = await guild.roles.fetch('${roles[permission]}');
                                return role;
                            }
                        }).bind(this)();
                    `);

                    console.log('results 2 passed');

                    for (let r = 0; r < results.length; r++) { if (results[r]) { role = results[r]; break; } }
                }

                else { role = guild.roles.resolve(await (await guild.roles.fetch()).fetch(roles[permission], true, true)) }
                console.log(guild.roles.highest);

                if (role) {
                    let member;
                    if (looped) {
                        let results = await context.client.shard.broadcastEval(`
                            (async function() {
                                let guild = await this.guilds.fetch('${serverID}');
                                if (guild && guild.shardID != undefined) {
                                    let role = await guild.roles.fetch('${roles[permission]}');
                                    if (role) { return role.members.get('${context.member.id}') }
                                }
                            }).bind(this)();
                        `);

                        for (let r = 0; r < results.length; r++) { if (results[r]) { member = true; break; } }
                    }

                    else { member = role.members.get(context.member.id) }

                    if (!member) { toReturn.userPerms = false }
                }
            }
        }

        return toReturn;
    }
}