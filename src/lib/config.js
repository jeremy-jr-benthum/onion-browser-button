var config = {};
var notificationId = '';
chrome.notifications.onClosed.addListener(function () {notificationId = ''});

config.welcome = {
  "timeout": 3000,
  "url": "http://mybrowseraddon.com/tor-button.html",
  get version () {return app.storage.read("version")},
  set version (val) {app.storage.write("version", val)}
};

config.addon = {
  set state (val) {app.storage.write("state", val)},
  get state () {
    return app.storage.read("state") !== undefined ? app.storage.read("state") : "OFF";
  }
};

config.request = function (url, callback) {
  var xhr = new XMLHttpRequest();
  try {
    xhr.onload = function (e) {xhr.status >= 200 && xhr.status < 304 ? callback("ok") : callback("error")};
    xhr.open('HEAD', url, true);
    xhr.onerror = function () {callback("error")};
    xhr.ontimeout = function () {callback("error")};
    xhr.send('');
  } catch (e) {callback("error")}
};

config.notifications = function (e) {
  var options = {"message": e, "type": "basic", "title": "Tor Browser Button", "iconUrl": chrome.runtime.getURL('data/icons/ON/64.png')};
  if (notificationId) {
    if (chrome.notifications.update) {
      return chrome.notifications.update(notificationId, options, function () {});
    }
  }
  return chrome.notifications.create(options, function (id) {notificationId = id});
};
