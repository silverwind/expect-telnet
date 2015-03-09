# expect-telnet [![NPM version](https://img.shields.io/npm/v/expect-telnet.svg?style=flat)](https://www.npmjs.org/package/expect-telnet) [![Dependency Status](http://img.shields.io/david/silverwind/expect-telnet.svg?style=flat)](https://david-dm.org/silverwind/expect-telnet)
> telnet automation through expect-send sequences, like in Tcl.

## Installation
```
$ npm install --save expect-telnet
```
## Examples
```js
var et = require("expect-telnet");

// connect, log in, run a command and exit after logging its output.
et("1.2.3.4", 23, [
  {expect: "Username", send: "username\r"},
  {expect: "Password", send: "password\r"},
  {expect: "#"       , send: "command\r" },
  {expect: "#"       , out: console.log, send: "exit\r"}
], function (err) {
  if (err) console.log(err);
  // sequence done
});

// connect, log in and start an interactive session.
et("1.2.3.4", 23, [
  {expect: "Username", send: "username\r"},
  {expect: "Password", send: "password\r"},
  {expect: "#"       , interact: true    }
], function (err) {
  if (err) console.log(err);
  // sequence done
});
```

## API
### expect-telnet(host, port, seq, cb)
- `host` *string*: Target host.
- `port` *number*: Target port.
- `seq`  *array* : Array of expect steps (objects).

#### Expect step object
- `expect` *string*   : String to expect.
- `send`   *string*   : String to send when `expect` is found.
- `out`  *function*   : Output function, receives the output since the previous step.
- `interact` *boolean*: Enter interacive mode with stdin/stdout. There's currently no way out of this mode, so this should be last.

© 2015 [silverwind](https://github.com/silverwind), distributed under BSD licence
