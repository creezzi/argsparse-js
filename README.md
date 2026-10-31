# argsparse

A small command-line argument parser with flags, aliases, defaults, --no- negation and repeated options.

## Usage

```js
import { parseArgs } from "argsparse";

parseArgs(["-vp", "8080", "--name=app", "--no-color", "file.txt"], {
  boolean: ["verbose", "color"],
  alias: { v: "verbose", p: "port" },
});
// { _: ["file.txt"], verbose: true, port: 8080, name: "app", color: false }
```

## Test

```bash
npm test
```

## License

MIT
