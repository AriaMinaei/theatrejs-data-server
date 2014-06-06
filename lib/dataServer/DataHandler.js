var DataHandler, GitHandler, Namespace, Queue, fs, sysPath;

fs = require('graceful-fs');

Queue = require('./dataHandler/Queue');

sysPath = require('path');

Namespace = require('./dataHandler/Namespace');

GitHandler = require('./dataHandler/GitHandler');

module.exports = DataHandler = (function() {
  function DataHandler(server, rootPath, dataDir) {
    this.server = server;
    this.queue = new Queue;
    this._setPaths(rootPath, dataDir);
    this._setupNamespaces();
    this.gitHandler = new GitHandler(this);
  }

  DataHandler.prototype._setPaths = function(rootPath, dataDir) {
    this.rootPath = rootPath;
    this.dataDir = dataDir;
    if (!(String(this.dataDir).length > 0)) {
      throw Error("dataDir '" + this.dataDir + "' is not valid");
    }
    this.dataPath = sysPath.join(this.rootPath, this.dataDir);
    if (!fs.existsSync(this.dataPath)) {
      throw Error("Timelines path '" + this.dataPath + "' doesn't exist");
    }
  };

  DataHandler.prototype._setupNamespaces = function() {
    var namespace, namespaces, nsName, _i, _len;
    namespaces = fs.readdirSync(this.dataPath);
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
      this._recognizeNamespace(nsName);
    }
    if (this.namespaces.length === 0) {
      throw Error("No namespace cson file was found");
    }
  };

  DataHandler.prototype._recognizeNamespace = function(name) {
    console.log("recognized namespace", name);
    this.namespaces.push(new Namespace(this, name));
  };

  DataHandler.prototype.hasNamespace = function(name) {
    var ns, _i, _len, _ref;
    _ref = this.namespaces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ns = _ref[_i];
      if (ns.name === name) {
        return true;
      }
    }
    return false;
  };

  DataHandler.prototype.getNamespace = function(name) {
    var ns, _i, _len, _ref;
    _ref = this.namespaces;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ns = _ref[_i];
      if (ns.name === name) {
        return ns;
      }
    }
  };

  return DataHandler;

})();
