var process = require('process');
var spawn = require('child_process').spawn;
var clc = require('./vendor/nodejs/node_modules/cli-color');
var TorControl = require('./vendor/nodejs/node_modules/tor-control');

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding("utf8");

var config = {
  "info": function () {
    console.log("\n\n\n");
    console.log(clc.white(" ----------------- "), clc.white("TOR Menu"), clc.white(" ----------------- "), "\n");
    console.log(clc.green(" 1. Start TOR connection"), "\n");
    console.log(clc.green(" 2. Log connection info"), "\n");
    console.log(clc.green(" 3. Stop TOR connection"), "\n");
    console.log(clc.green(" 4. Debug TOR connection"), "\n");
    console.log(clc.green(" 5. New TOR identity"), "\n");
    console.log(clc.green(" 6. Restart TOR connection"), "\n");
    console.log(clc.white(" ---------------------------------------------- "));
    console.log("\n");
    console.log(clc.white(" To start, please enter a desired number from the above menu:"), "\n");
  },
  "start": function () {
    console.log("\n");
    console.log(clc.blueBright(" ---------------------------------------------- "), "\n");
    console.log(clc.blueBright(" ------------ Start Tor Connection ------------ "), "\n");
    console.log(clc.blueBright(" ---------------------------------------------- "), "\n");
    console.log("\n");
    var tor = spawn('./vendor/tor-bundle/tor.exe', ["-f", "torrc"]);
    tor.on('exit', (code) => {console.log(`Tor exited with code ${code}`)});
    tor.stdout.on('data', (data) => {
      console.log(clc.green(data.toString()));
      if (data.toString().indexOf("100%:") !== -1) {
        console.log(clc.magentaBright("--- Tor is connected successfully! ---"));
        config.info();
      }
    });
    tor.stderr.on('data', (data) => {console.log(clc.redBright(data.toString()))});
  },
  "new": function () {
    console.log("\n");
    console.log(clc.blueBright(" ---------------------------------------------- "), "\n");
    console.log(clc.blueBright(" ---------- Switch to clean circuits ---------- "), "\n");
    console.log(clc.blueBright(" ---------------------------------------------- "), "\n");
    console.log("\n");
    var control = new TorControl();
    control.signalNewnym(function (error, status) {
      if (error) return console.log(clc.redBright("> error: "), clc.redBright(error));
      else console.log(clc.greenBright("> status: "), clc.greenBright(status.messages[0]));
      config.info();
    });
  },
  "close": function () {
    console.log("\n");
    console.log(clc.blueBright(" ----------------------------------------- "), "\n");
    console.log(clc.blueBright(" -------------- Tor Shutdown ------------- "), "\n");
    console.log(clc.blueBright(" ----------------------------------------- "), "\n");
    console.log("\n");
    var control = new TorControl();
    control.signalHalt(function (error, status) {
      if (error) return console.log(clc.redBright("> error: "), clc.redBright(error));
      else console.log(clc.greenBright("> status: "), clc.greenBright(status.messages[0]));
      config.info();
    });
  },
  "log": function () {
    console.log("\n");
    console.log(clc.blueBright(" ------------------------------------- "), "\n");
    console.log(clc.blueBright(" ------------ Log Information -------- "), "\n");
    console.log(clc.blueBright(" ------------------------------------- "), "\n");
    console.log("\n");
    var control = new TorControl();
    control.signalDump(function (error, status) {
      if (error) return console.log(clc.redBright("> error: "), clc.redBright(error));
      else console.log(clc.greenBright("> status: "), clc.greenBright(status.messages[0]));
      config.info();
    });
  },
  "debug": function () {
    console.log("\n");
    console.log(clc.blueBright(" ------------------------------------- "), "\n");
    console.log(clc.blueBright(" --------------- Debug --------------- "), "\n");
    console.log(clc.blueBright(" ------------------------------------- "), "\n");
    console.log("\n");
    var control = new TorControl();
    control.signalDebug(function (error, status) {
      if (error) return console.log(clc.redBright("> error: "), clc.redBright(error));
      else console.log(clc.greenBright("> status: "), clc.greenBright(status.messages[0]));
      config.info();
    });
  },
  "restart": function () {
    console.log("\n");
    console.log(clc.blueBright(" ------------------------------------- "), "\n");
    console.log(clc.blueBright(" -------------- Restart -------------- "), "\n");
    console.log(clc.blueBright(" ------------------------------------- "), "\n");
    console.log("\n");
    var control = new TorControl();
    control.signalHalt(function (error, status) {
      if (error) return console.log(clc.redBright("> error: "), clc.redBright(error));
      else config.start();
    });
  }
};

stdin.on('data', function (e) {
  if (e === '1') config.start();
  if (e === '2') config.log();
  if (e === '3') config.close();
  if (e === '4') config.debug();
  if (e === '5') config.new();
  if (e === '6') config.restart();
  if (e === '\u0003') process.exit();
});

config.info();
