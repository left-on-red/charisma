let config = require('./../../config.json');

class DataConfig {
    constructor() {
        this.host = 'localhost';
        this.port = 531;
    }
}

class GuildConfig {
    constructor() {
        this.whitelist = {};
        this.blacklist = {};

        this.prefix = config.prefix;

        this.locale = 'America/Wisconsin';
        this.dateFormat = 'llll';

        this.welcomeMessage = 'Welsome to **[SERVER]**, **[USERNAME]#[USERTAG]**!';

        this.enabled = [];

        this.colors = {
            accent: config.accent,
            logs: {
                userJoined: '#42F49B',
                userLeft: '#f25e44',
                userBanned: '#F44141',
                userUnbanned: '#bef244',
                userNameChanged: '#418EF4',
                userNickChanged: '#41EEF4'
            }
        }

        this.options = {
            deleteCooldownedAttempts: true,
            preventNonAlphanumErrors: true,
            leveling: false,
            welcomeMessage: false,

            errors: {
                unknownCommand: true,
                notWhitelisted: true,
                isBlacklisted: true,
                invalidSyntax: true,
                noUserPerms: true,
                noBotPerms: true
            },

            logs: {
                userJoined: false,
                userLeft: false,
                userBanned: false,
                userUnbanned: false,
                userNameChanged: false,
                userNickChanged: false
            }
        }

        this.flavor = 'upbeat';
        this.autorole = null;

        this.channels = {
            logs: null
        }

        this.roles = {
            auto: null,
            bot: null,
            verified: null,
            self: {},
            chains: {}
        }

        this.members = {};

        this.leveling = {
            localNotificationMode: 'full',
            globalNotificationMode: 'discrete',
            localCurve: 1.9,
            roles: {}
        }
    }

    /**
     * 
     * @param {object} data
     * @returns {GuildConfig} 
     */
    static cast(data) { return data }
}

class MemberConfig {
    constructor() {}
}

class UserConfig {
    constructor() {
        this.cooldowns = {};
        this.achievements = [];
        this.badges = [];
        this.color = '#ADCAFF';
        this.daily = -1;
        this.dailyStreak = 0;
    }
}

class InventoryConfig {
    constructor() {
        this.balance = 0;
        this.items = {};
        this.key = {};
        this.containers = {};
        this.obtained = {};
    }
}

class KarmaConfig {
    constructor() {
        this.given = 0;
        this.received = 0;
    }
}

class ExperienceConfig {
    constructor() {
        this.user = 0;
        this.member = [];
    }
}

class BotOptionsConfig {
    constructor() {
        this.sharding = config.sharding;
        this.variation = config.variation;
        this.accent = config.accent;
    }
}

class LocalConfig {
    constructor() {
        this.guild = new GuildConfig();
        this.user = new UserConfig();
    }
}

module.exports = { DataConfig, GuildConfig, MemberConfig, UserConfig, InventoryConfig, KarmaConfig, ExperienceConfig, BotOptionsConfig, LocalConfig }