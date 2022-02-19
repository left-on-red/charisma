class CommandConfig {
    /**
     * 
     * @param {string} name 
     * @param {string} description 
     * @param {string[]} aliases 
     * @param {string[]} permissions 
     * @param {string[]} tags 
     * @param {boolean} nsfw 
     * @param {boolean} hidden 
     * @param {number} cooldown 
     */
    constructor(name, description, aliases, permissions, tags, nsfw, hidden, cooldown) {
        this.name = name;
        this.description = description;
        this.aliases = aliases;
        this.permissions = permissions;
        this.tags = tags;
        this.nsfw = nsfw;
        this.hidden = hidden;
        this.cooldown = cooldown;
    }
}

module.exports = CommandConfig;