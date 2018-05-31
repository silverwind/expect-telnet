"use strict";
const net = require("net");
const url = require("url");
const TIMEOUT = 5000;

function endSocket(socket) {
  socket.removeAllListeners("data").removeAllListeners("error");
  socket.destroy();
}

function formatHostPort(uri) {
  return url.format(uri).replace(/^.+\/\//, "").replace(/\/$/, "");
}

module.exports = function(dest, seq, opts, cb) {
  const socket = new net.Socket();
  let interacting, saved = "";
  if (typeof opts === "function") cb = opts;
  opts = opts || {};

  dest = url.parse("http://" + dest);

  socket.setTimeout(opts.timeout || TIMEOUT);

  socket.once("timeout", () => {
    endSocket(socket);
    cb(new Error("Timeout connecting to " + formatHostPort(dest)));
  });

  socket.once("error", err => {
    if (interacting) interacting = false;
    endSocket(socket);
    cb(err);
  });

  socket.once("connect", socket.setNoDelay.bind(socket));

  socket.connect(dest.port, dest.hostname);

  socket.on("end", () => {
    if (interacting) {
      process.stdin.removeAllListeners("data");
      if (opts.exit) process.exit(0);
    }
  });
  socket.on("data", chunk => {
    if (interacting) return process.stdout.write(chunk);

    let i;
    seq.some((entry, index) => {
      i = entry.done ? undefined : index;
      return !entry.done;
    });

    if (!seq[i] || seq[i].done) {
      endSocket(socket);
      return cb();
    }

    if (!seq[i].timeout) {
      seq[i].timeout = setTimeout(() => {
        endSocket(socket);
        cb(new Error("Expect sequence timeout: " + seq[i].expect));
      }, opts.timeout || TIMEOUT);
    }

    saved += chunk;

    let matched;
    if (seq[i].expect instanceof RegExp) {
      matched = seq[i].expect.test(saved);
    } else if (typeof seq[i].expect === "string") {
      matched = saved.indexOf(seq[i].expect) !== -1;
    } else {
      endSocket(socket);
      cb(new Error("Expected a String or RegExp:" + seq[i].expect));
    }

    if (matched) {
      clearTimeout(seq[i].timeout);
      seq[i].done = true;

      if (seq[i].out) {
        let lines = [];
        saved.split(/\r?\n/).forEach(line => {
          if (line) lines.push(line);
        });
        lines = lines.length >= 3 ? lines.slice(1, lines.length - 1) : lines;
        seq[i].out(lines.join("\n"));
      }

      if (seq[i].send) {
        socket.write(seq[i].send);
      }

      if (seq[i].interact) {
        process.stdin.setRawMode(true);
        interacting = true;
        process.stdin.on("data", char => {
          if (!socket.writable) return;
          if (char.toString("hex") === "7f") char = Buffer("08", "hex"); // Convert DEL to BKSP
          socket.write(char);
        });
        socket.write("\r");
      }
      saved = "";
    }
  });
};
