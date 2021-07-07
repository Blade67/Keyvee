# Keyvee

Keyvee is an extended version of [KeyV](https://github.com/lukechilds/keyv) which emits events for each function, and is cross compatible with [KeyV](https://github.com/lukechilds/keyv) providers.

## Events

-   `on("set", function (key) {})`
-   `on("get", function (value) {})`
-   `on("TTL", function ([key, value]) {})`
-   `on("delete", function (key) {})`
-   `on("clear", function () {})`
