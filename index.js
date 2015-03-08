"use strict";
var net = require("net");

module.exports = function (host, port, seq, cb) {
  var socket = new net.Socket(), interacting, saved = "";

  socket.once("connect", socket.setNoDelay).connect(port, host);
  socket.on("error", function (err) {
    if (interacting) process.exit(0);
    socket.removeAllListeners("data").removeAllListeners("error").end();
    cb(err);
  });
  socket.on("data", function next(chunk) {
    if (interacting) return process.stdout.write(chunk);

    var i;
    seq.some(function (entry, index) {
      i = entry.done ? undefined : index;
      return !entry.done;
    });

    if (!seq[i] || seq[i].done) {
      socket.removeAllListeners("data").removeAllListeners("error").end();
      return cb();
    }

    saved += chunk;
    if (saved.indexOf(seq[i].expect) !== -1) {
      seq[i].done = true;

      if (seq[i].out) {
        //remove command and prompt from output
        var lines = [];
        saved.split(/\r\n/g).forEach(function (line) {
          if (line) lines.push(line);
        });
        if (lines.length >= 3) {
          lines = lines.slice(1, lines.length - 1);
        }
        seq[i].out(lines.join("\n"));
      }

      if (seq[i].send) {
        socket.write(seq[i].send);
      }

      if (seq[i].interact) {
        process.stdin.setRawMode(true);
        interacting = true;
        process.stdin.on("data", function(c) {
          if (c.toString("hex") === "7f") c = Buffer("08", "hex"); // Convert DEL to BKSP
          socket.write(c);
        });
        socket.write("\r");
      }

      saved = "";
    }
  });
};
