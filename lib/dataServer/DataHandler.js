var CSON, DataHandler, delay, fs, git, nodefn, sysPath, wn,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

fs = require('graceful-fs');

wn = require('when');

git = require('gift');

CSON = require('cson');

delay = require('when/delay');

nodefn = require('when/node/function');

sysPath = require('path');

module.exports = DataHandler = (function() {
  function DataHandler(server, rootPath, timelinesDir) {
    this.server = server;
    this._setPaths(rootPath, timelinesDir);
    this._lastPromiseToWorkWithHeadData = wn();
  }

  DataHandler.prototype._setPaths = function(rootPath, timelinesDir) {
    var namespace, namespaces, nsName, _i, _len;
    this.rootPath = rootPath;
    this.timelinesDir = timelinesDir;
    if (!(String(this.timelinesDir).length > 0)) {
      throw Error("@timelinesDir '" + this.timelinesDir + "' is not valid");
    }
    this.timelinesPath = sysPath.join(this.rootPath, this.timelinesDir);
    if (!fs.existsSync(this.timelinesPath)) {
      throw Error("Timelines path '" + this.timelinesPath + "' doesn't exist");
    }
    namespaces = fs.readdirSync(this.timelinesPath);
    this.namespaces = [];
    if (!(Array.isArray(namespaces) && namespaces.length > 0)) {
      throw Error("no namespace found");
    }
    for (_i = 0, _len = namespaces.length; _i < _len; _i++) {
      namespace = namespaces[_i];
      if (!namespace.match(/^[a-zA-Z0-9\-\_]+\.cson$/)) {
        continue;
      }
      nsName = namespace.substr(0, namespace.length - 5);
      console.log("recognized namespace", nsName);
      this.namespaces.push(nsName);
    }
    if (this.namespaces.length === 0) {
      throw Error("No namespace cson file was found");
    }
    this._initGit();
  };

  DataHandler.prototype._initGit = function() {
    if (!fs.existsSync(this.rootPath + '/.git')) {
      throw Error("Git repo is not initialized yet");
    }
    this.repo = git(this.rootPath);
    if (this.repo == null) {
      throw Error("Could not get a repo from gift");
    }
    return this._scheduleToCommit();
  };

  DataHandler.prototype._scheduleToCommit = function() {
    delay(5 * 60 * 1000).then((function(_this) {
      return function() {
        return _this.queue(function() {
          _this._scheduleToCommit();
          return nodefn.call(_this.repo.status.bind(_this.repo)).then(function(status) {
            if (status.clean === true) {
              console.log('no need to commit');
              return;
            }
            return nodefn.call(_this.repo.add.bind(_this.repo), '.').then(function() {
              return nodefn.call(_this.repo.commit.bind(_this.repo), '[autosave]', {
                all: true
              });
            }).then(function() {
              return console.log('commited');
            });
          });
        });
      };
    })(this));
  };

  DataHandler.prototype.hasNamespace = function(ns) {
    return __indexOf.call(this.namespaces, ns) >= 0;
  };

  DataHandler.prototype.getHeadDataForNamespace = function(ns) {
    if (!this.hasNamespace(ns)) {
      throw Error("Invalid namespace '" + ns + "'");
    }
    return nodefn.call(fs.readFile, this.getDataFilePathFor(ns), {
      encoding: 'utf-8'
    }).then((function(_this) {
      return function(cson) {
        var obj;
        if ((cson.replace(/\s+/, '')) === '') {
          return {};
        }
        obj = CSON.parseSync(cson);
        if (obj instanceof Error) {
          console.log(obj);
          throw obj;
        }
        return obj;
      };
    })(this));
  };

  DataHandler.prototype.queue = function(cb) {
    return this._lastPromiseToWorkWithHeadData = this._lastPromiseToWorkWithHeadData.then(cb);
  };

  DataHandler.prototype.replaceHeadDataForNamespace = function(ns, obj) {
    var cson, first, json, second;
    cson = CSON.stringifySync(obj);
    json = this.trimData(obj);
    first = nodefn.call(fs.writeFile, this.getDataFilePathFor(ns), cson, {
      encoding: 'utf-8'
    });
    second = nodefn.call(fs.writeFile, this.getTrimmedDataFilePathFor(ns), json, {
      encoding: 'utf-8'
    });
    return wn.all([first, second]);
  };

  DataHandler.prototype.trimData = function(obj) {
    var timeline;
    timeline = obj != null ? obj.timeline : void 0;
    if (timeline == null) {
      timeline = {};
    }
    return JSON.stringify(timeline);
  };

  DataHandler.prototype.getDataFilePathFor = function(ns) {
    return sysPath.join(this.timelinesPath, ns + '.cson');
  };

  DataHandler.prototype.getTrimmedDataFilePathFor = function(ns) {
    return sysPath.join(this.timelinesPath, ns + '.json');
  };

  return DataHandler;

})();
