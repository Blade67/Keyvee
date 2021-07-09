const KeyV = require("keyv");
const EventEmitter = require("events");

class KeyVee extends KeyV {
    constructor(opts) {
        super(opts);
        this.emitter = new EventEmitter();
    }

    async delete(key) {
        const keyPrefixed = this._getKeyPrefix(key);
        const { store } = this.opts;
        let toDelete = await store.get(keyPrefixed);
        toDelete = typeof toDelete === "string" ? this.opts.deserialize(toDelete) : toDelete;
        if (typeof toDelete.expires === "number" && Date.now() > toDelete.expires)
            this.emitter.emit("TTL", key, toDelete.value);
        return Promise.resolve().then(() => store.delete(keyPrefixed));
    }

    async eget(key, opts) {
        this.emitter.emit("get", key);
        return await this.get(key, opts);
    }

    async eset(key, value, ttl) {
        this.emitter.emit("set", key, value);
        return await this.set(key, value, ttl);
    }

    async edelete(key) {
        this.emitter.emit("delete", key, await this.get(key));
        return await this.delete(key);
    }

    async eclear() {
        this.emitter.emit("clear");
        return await this.clear();
    }
}

module.exports = KeyVee;
