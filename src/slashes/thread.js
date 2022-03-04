let Slash = require('./../core/Slash.js');
let Discord = require('discord.js');

module.exports = class extends Slash {
    constructor() {
        super('thread', 'manage the threads on the server');

        // /thread create <name>
        this.append(
            Slash.Subcommand('create', 'creates a thread under the current channel')
            .append(
                Slash.String('name', 'the name of the thread that you want to create', true)
            )
        );

        // /thread destroy
        this.append(Slash.Subcommand('destroy', `destroys the thread that you're currently in`));

        // /thread archive
        this.append(Slash.Subcommand('archive', `archives the thread that you're currently in`));

        // /thread rename <name>
        this.append(
            Slash.Subcommand('rename', `renames the thread that you're currently in`)
            .append(
                Slash.String('name', 'the name that you want to rename the thread to', true)
            )
        );

        this.interact(async (context, options) => {
            let sub = options.getSubcommand(true);

            if (sub == 'create') {
                if (!context.member.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.USE_PUBLIC_THREADS)) { return context.interaction.reply({ content: 'you don\'t have permission to use threads under this channel!', ephemeral: true }) }
                if (!context.guild.me.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.USE_PUBLIC_THREADS)) { return context.interaction.reply({ content: 'I don\'t have permission to use threads under this channel!', ephemeral: true }) }
                if (context.channel.isThread()) { return context.interaction.reply({ content: 'you can\'t create a thread while already in a thread!', ephemeral: true }) }
                
                let thread = await context.channel.threads.create({
                    name: options.getString('name', true),
                    reason: `created by ${context.member.user.tag} (${context.member.user.id}) @ [${Date.now()}] via \`/thread\``
                });

                await thread.members.add(context.member);

                context.interaction.reply(`thread \`${options.getString('name', true)}\` has been created under \`#${context.channel.name}\``);
            }

            else if (sub == 'destroy') {
                if (!context.member.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.MANAGE_THREADS)) { return context.interaction.reply({ content: 'you don\'t have permission to manage this thread!', ephemeral: true }) }
                if (!context.guild.me.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.MANAGE_THREADS)) { return context.interaction.reply({ content: 'I don\'t have permission to manage this thread!', ephemeral: true }) }
                if (!context.channel.isThread()) { return context.interaction.reply({ content: 'you can only use this command inside a thread!', ephemeral: true }) }

                await context.channel.delete();
                context.interaction.reply('`DELETED`');
            }

            else if (sub == 'archive') {
                if (!context.member.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.MANAGE_THREADS)) { return context.interaction.reply({ content: 'you don\'t have permission to manage this thread!', ephemeral: true }) }
                if (!context.guild.me.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.MANAGE_THREADS)) { return context.interaction.reply({ content: 'I don\'t have permission to manage this thread!', ephemeral: true }) }
                if (!context.channel.isThread()) { return context.interaction.reply({ content: 'you can only use this command inside a thread!', ephemeral: true }) }

                await context.interaction.reply(`thread \`${context.channel.name}\` has been archived!`);
                context.channel.setArchived(true);
            }

            else if (sub == 'rename') {
                if (!context.member.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.MANAGE_THREADS)) { return context.interaction.reply({ content: 'you don\'t have permission to manage this thread!', ephemeral: true }) }
                if (!context.guild.me.permissionsIn(context.channel).has(Discord.Permissions.FLAGS.MANAGE_THREADS)) { return context.interaction.reply({ content: 'I don\'t have permission to manage this thread!', ephemeral: true }) }
                if (!context.channel.isThread()) { return context.interaction.reply({ content: 'you can only use this command inside a thread!', ephemeral: true }) }

                let name = options.getString('name', true);

                await context.channel.setName(name);
                context.interaction.reply(`thread has been renamed to \`${name}\``);
            }

            //context.ephemeral('testing slash command!');
        });
    }
}

