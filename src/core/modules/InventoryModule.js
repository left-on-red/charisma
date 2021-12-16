let CommandContext = require('./../CommandContext.js');
let BotContext = require('./../BotContext.js');

function clone(obj) {
    var copy;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) { copy[i] = clone(obj[i]) }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]) }
        return copy;
    }
}

class InventoryModule {
    /**
     * 
     * @param {string} id 
     * @param {BotContext} context 
     */
    constructor(id, context) {
        this.id = id;
        this.data = {};
        this.before = {};
        this.context = context;
    }

    init = async () => {
        this.data = await this.context.data._get('inventory', this.id);
        for (let i in this.data.items) { if (this.data.items[i] <= 0) { delete this.data.items[i] } }
        this.before = clone(this.data);
    }

    append = async () => { await this.context.data._update('inventory', this.id, this.data) }

    refresh = async () => { await this.init() };

    items = {
        get: (item) => this.data.items[item] != undefined ? this.data.items[item] : null,
        getAll: () => this.data.items,
        has: (item) => this.items.get(item) != null && this.items.get(item) != 0,
        add: (item, qty) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (this.context.economy.items[item].tags.includes('key')) { throw new Error(`item "${item}" is a key item`) }

            if (!this.data.items[item]) { this.data.items[item] = qty }
            else { this.data.items[item] += qty }

            if (!this.data.obtained[item]) { this.data.obtained[item] = qty }
            else { this.data.obtained[item] += qty }
        },

        remove: (item, qty) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (this.context.economy.items[item].tags.includes('key')) { throw new Error(`item "${item}" is a key item`) }
            if (!this.data.items[item]) { throw new Error(`that user doesn't have item "${item}"`) }
            if (qty > this.data.items[item]) { throw new Error(`that user doesn't have that many of "${item}"`) }

            if (qty == undefined) { qty = 1 }
            this.data.items[item] -= qty;

            if (this.data.items[item] <= 0) { delete this.data.items[item] }
        },

        removeAll: (item) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (this.context.economy.items[item].tags.includes('key') || this.context.economy.items[item].tags.includes('container')) { throw new Error(`item "${item}" is not a normal item`) }
            if (this.data.items[item] == undefined) { throw new Error(`that user does not have item "${item}"`) }
            delete this.data.items[item];
        },

        obtained: (item) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (this.context.economy.items[item].tags.includes('key')) { throw new Error(`item "${item}" is a key item`) }
            return this.data.obtained[item] != undefined ? this.data.obtained[item] : 0;
        }
    }

    obtainedText(str, force) {
        let parse = (s, i) => {
            let chars = s.split('');
            for (let c = 0; c < chars.length; c++) {
                if (chars[c] == ':') {
                    let emojiText = '';
                    let p = c+1;
                    while (chars[p] != ':' && p < chars.length) {
                        emojiText += chars[p];
                        p++;
                    }
            
                    emojiText = `:${emojiText}:`;
                    
                    let skip = false;
    
                    if (emojiText != this.context.economy.items[i].emoji) { skip = true }
    
                    if (chars[p+1] == 'x' && !isNaN(chars[p+2])) {
                        p += 2;
                        let qty = '';
                        while (!isNaN(chars[p]) && chars[p] != ' ' && p < chars.length) {
                            qty += chars[p];
                            p++;
                        }
            
                        emojiText += `x${qty}`;
                    }
            
                    c = p;
            
                    if (skip) { c += emojiText.length }
                    else { s = s.replace(emojiText, `${emojiText} (${i})`) }
                }
            }
    
            return s;
        }
    
        // if first item obtained or item is a key item
        for (let i in this.context.economy.items) {
            if (str.includes(this.context.economy.items[i].emoji)
            && (
                (this.context.economy.items[i].tags.includes('key')
                || this.context.economy.items[i].tags.includes('container')
                )
                || this.items.obtained(i) == 1
                || force
                )
            ) { str = parse(str, i) } }
    
        return str;
    }

    keys = {
        get: (item) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (!this.context.economy.items[item].tags.includes('key')) { throw new Error(`item "${item}" is not a key item`) }
            return this.data.key[item] != undefined ? this.data.key[item] : null;
        },

        getAll: () => this.data.key,
        has: (item) => this.keys.get(item) != null,

        add: (item) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (!this.context.economy.items[item].tags.includes('key')) { throw new Error(`item "${item}" is not a key item`) }
            if (this.data.key[item] != undefined) { throw new Error(`that user already has key item "${item}"`) }
            this.data.key[item] = {};
        },

        set: (item, obj) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (!this.context.economy.items[item].tags.includes('key')) { throw new Error(`item "${item}" is not a key item`) }
            if (this.data.key[item] == undefined) { throw new Error(`that user does not have key item "${item}"`) }

            this.data.key[item] = obj;
        }
    }

    containers = {
        get: (item) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (!this.context.economy.items[item].tags.includes('container')) { throw new Error(`item "${item}" is not a container`) }

            return this.data.containers[item] != undefined ? this.data.containers[item] : [];
        },

        getAll: () => this.data.containers,
        has: (item) => this.containers.get(item).length > 0,

        add: (item, obj) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (!this.context.economy.items[item].tags.includes('container')) { throw new Error(`item "${item}" is not a container`) }
            if (this.data.containers[item] == undefined) { this.data.containers[item] = [obj] }
            else { this.data.containers[item].push(obj) }
        },

        remove: (item, index) => {
            if (!this.context.economy.items[item]) { throw new Error(`item "${item}" does not exist`) }
            if (!this.context.economy.items[item].tags.includes('container')) { throw new Error(`item "${item}" is not a container`) }
            if (this.data.containers[item] == undefined) { throw new Error(`that user does not have any "${item}" containers`) }
            if (this.data.containers[item][index] == undefined) { throw new Error(`that user does not have a "${item}" container at index ${index}`) }

            this.data.containers[item].splice(index, 1);
            if (this.data.containers[item].length == 0) { delete this.data.containers[item] }
        }
    }

    static addMoney = async (context, id, money) => {
        let user = await context.data._get('inventory', id);
        let cloned = clone(user);
        user.balance += money;
        await context.data._update('inventory', id, user, cloned);
    }

    static removeMoney = async (context, id, money) => {
        let user = await context.data._get('inventory', id);
        let cloned = clone(user);
        if ((user.balance - money) < 0) { throw new Error(`the user can't have a negative balance`) }
        user.balance -= money;
        await context.data._update('inventory', id, user, cloned);
    }

    static getMoney = async (context, id) => (await context.data._get('inventory', id)).balance;
}

module.exports = InventoryModule;