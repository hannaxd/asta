# asta

A simple, mitt-inspired EventEmitter with once support

## Usage

Simple:

```ts
import { asta } from "@rawrxd/asta";

const emitter = asta();

emitter.on("event", (data) => {
  console.log("Received event with data:" + data);
});
```

Event Map:

```ts
import { asta } from "@rawrxd/asta";

interface AppEvents {
  login: { username: string };
  logout: null;
}

const emitter = asta<AppEvents>();

emitter.on("login", ({ username }) => {
  console.log(`${username} logged in`);
});
```
