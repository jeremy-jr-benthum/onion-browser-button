window.setTimeout(function () {
  var version = config.welcome.version;
  if (!version) app.tab.open(config.welcome.url + "?v=" + app.version() + "&type=install");
  config.welcome.version = app.version();
}, config.welcome.timeout);

var tor = {
  "id": "OFF",
  "log": "Tor Browser Button",
  "value": {"mode": "system"},
  "update": function () {
    if (config.addon.state === "ON") {
      tor.once(function () {
        var url = "https://www.example.com/" + "?t=" + new Date().getTime() + "&r=" + Math.round(Math.random() * 10000);
        config.request(url, function (e) {
          if (e === "ok") config.addon.state === "ON" ? tor.start() : tor.stop();
          else {
            tor.stop();
            config.notifications("TOR is NOT running. Please connect your computer to TOR network and try again.");
          }
        });
      });
    } else tor.stop();
  },
  "stop": function () {
    tor.id = "OFF";
    tor.icon(tor.id);
    tor.log = "TOR proxy is disabled";
    app.popup.send("status", {"id": tor.id, "log": tor.log});
    chrome.proxy.settings.set({"value": tor.value});
	},
	"start": function () {
    tor.id = "ON";
    tor.icon(tor.id);
    tor.log = "Connected to 127.0.0.1:9050";
    app.popup.send("status", {"id": tor.id, "log": tor.log});
    var o = {"mode": "fixed_servers", "rules": {"singleProxy": {"scheme": "socks5", "host": "127.0.0.1", "port": 9050}}};
    chrome.proxy.settings.set({"value": o});
	},
  "once": function (callback) {
    tor.id = "CHECK";
    tor.icon(tor.id);
    tor.log = "Checking tor proxy connection...";
    app.popup.send("status", {"id": tor.id, "log": tor.log});
    chrome.proxy.settings.get({}, function (e) {
      if (e.value.mode !== "fixed_servers") tor.value = e.value;
      var o = {"mode": "fixed_servers", "rules": {"singleProxy": {"scheme": "socks5", "host": "127.0.0.1", "port": 9050}}};
      chrome.proxy.settings.set({"value": o});
      window.setTimeout(function () {callback(true)}, 300);
    });
  },
  "icon": function (state) {
    app.button.icon = {
      "path": {
        "16": '../../data/icons/' + state + '/16.png',
        "32": '../../data/icons/' + state + '/32.png',
        "48": '../../data/icons/' + state + '/48.png',
        "64": '../../data/icons/' + state + '/64.png'
      }
    };
  }
};

app.popup.receive("id", function (id) {
  if (id === "install") app.tab.open("https://github.com/jeremy-jr-benthum/tor-button/releases");
  if (id === "support") app.tab.open(config.welcome.url);
  if (id === "ON" || id === "OFF") {
    config.addon.state = id;
    tor.update();
  }
});

window.setTimeout(tor.update, 300);
app.popup.receive("load", function () {app.popup.send("status", {"id": tor.id, "log": tor.log})});
