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
et("1.2.3.4:23", [
  {expect: "Username", send: "username\r"},
  {expect: "Password", send: "password\r"},
  {expect: "#"       , send: "command\r" },
  {expect: "#"       , out: console.log, send: "exit\r"}
], function(err) {
  if (err) console.error(err);
});

// connect, log in and start an interactive session.
et("1.2.3.4:23", [
  {expect: "Username", send: "username\r"},
  {expect: "Password", send: "password\r"},
  {expect: "#"       , interact: true    }
], {exit: true}, function(err) {
  if (err) console.error(err);
}
```

## API
### expect-telnet(host, dest, seq, [opts], cb)
- `dest` *string*  : Target host and port separated by a colon.
- `seq`  *array*   : Array of expect steps (objects).
- `opts` *object*  : Options object.
- `cb`   *function*: Called when an error happens.

#### Expect step object
- `expect`   *string*  : String to expect.
- `send`     *string*  : String to send when `expect` is found.
- `out`      *function*: Output function, receives the output since the previous step.
- `interact` *boolean* : Enter interacive mode with stdin/stdout. There's currently no way out of this mode, so this should be last.

#### Options
- `timeout` *number: Connection timeout in milliseconds.
- `exit` *boolean*: Whether to exit the process when interacting ends.
© 2015 [silverwind](https://github.com/silverwind), distributed under BSD licence
