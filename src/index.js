const JSONB = require("json-buffer");
const EventEmitter = require("events");

const loadStore = (opts) => {
    const adapters = {
        redis: "@keyv/redis",
        mongodb: "@keyv/mongo",
        mongo: "@keyv/mongo",
        sqlite: "@keyv/sqlite",
        postgresql: "@keyv/postgres",
        postgres: "@keyv/postgres",
        mysql: "@keyv/mysql",
    };
    if (opts.adapter || opts.uri) {
        const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
        return new (require(adapters[adapter]))(opts);
    }
    return new Map();
};

class Keyvee extends EventEmitter {
    constructor(uri, opts) {
        super();
        this.emitter = new EventEmitter();
        this.opts = Object.assign(
            {
                namespace: "keyv",
                serialize: JSONB.stringify,
                deserialize: JSONB.parse,
            },
            typeof uri === "string" ? { uri } : uri,
            opts
        );

        if (!this.opts.store) {
            const adapterOpts = Object.assign({}, this.opts);
            this.opts.store = loadStore(adapterOpts);
        }

        if (typeof this.opts.store.on === "function") {
            this.opts.store.on("error", (err) => this.emit("error", err));
        }

        this.opts.store.namespace = this.opts.namespace;
    }

    _getKeyPrefix(key) {
        return `${this.opts.namespace}:${key}`;
    }

    get(key) {
        const keyPrefixed = this._getKeyPrefix(key);
        const { store } = this.opts;
        return Promise.resolve()
            .then((key) => {
                this.emitter.emit("get", key);
                store.get(keyPrefixed);
            })
            .then((data) => {
                return typeof data === "string" ? this.opts.deserialize(data) : data;
            })
            .then((data) => {
                if (data === undefined) return undefined;
                if (typeof data.expires === "number" && Date.now() > data.expires) {
                    this.emitter.emit("TTL", [key, data.value]);
                    this.delete(key);
                    return undefined;
                }
                return opts && opts.raw ? data : data.value;
            });
    }

    set(key, value, ttl) {
        const keyPrefixed = this._getKeyPrefix(key);
        if (typeof ttl === "undefined") ttl = this.opts.ttl;
        if (ttl === 0) ttl = undefined;
        const store = this.opts.store;

        return Promise.resolve()
            .then(() => {
                const expires = typeof ttl === "number" ? Date.now() + ttl : null;
                this.emitter.emit("set", key);
                value = { value, expires };
                return this.opts.serialize(value);
            })
            .then((value) => store.set(keyPrefixed, value, ttl))
            .then(() => true);
    }

    delete(key) {
        this.emitter.emit("delete", key);
        const keyPrefixed = this._getKeyPrefix(key);
        const { store } = this.opts;
        return Promise.resolve().then(() => store.delete(keyPrefixed));
    }

    clear() {
        this.emitter.emit("clear");
        const { store } = this.opts;
        return Promise.resolve().then(() => store.clear());
    }
}

module.exports = Keyvee;
