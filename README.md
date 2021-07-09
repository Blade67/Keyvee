# KeyVee

KeyVee is an extension of [KeyV](https://github.com/lukechilds/keyv) which emits events for each function, and is cross compatible with [KeyV](https://github.com/lukechilds/keyv) providers. All functionality is thus the same as [KeyV](https://github.com/lukechilds/keyv)'s.

## Usage

Install KeyVee

```
npm install --save keyvee
```

Create a new KeyVee instance

```js
// CommonJS
const KeyVee = require("keyvee");

// ES6 / TypeScript
import KeyVee from "keyvee";

const keyvee = new KeyVee();
```

## Events

```js
keyvee.emitter.on("set", (key, value) => {});
keyvee.emitter.on("get", (key) => {});
keyvee.emitter.on("TTL", (key, value) => {});
keyvee.emitter.on("delete", (key, value) => {});
keyvee.emitter.on("clear", () => {});
```
