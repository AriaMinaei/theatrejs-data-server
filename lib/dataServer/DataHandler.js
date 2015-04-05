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

  DataHandler.prototype._setPaths = function(rootPath1, dataDir1) {
    this.rootPath = rootPath1;
    this.dataDir = dataDir1;
    if (!(String(this.dataDir).length > 0)) {
      throw Error("dataDir '" + this.dataDir + "' is not valid");
    }
    this.dataPath = sysPath.join(this.rootPath, this.dataDir);
    if (!fs.existsSync(this.dataPath)) {
      throw Error("Timelines path '" + this.dataPath + "' doesn't exist");
    }
  };

  DataHandler.prototype._setupNamespaces = function() {
    var i, len, namespace, namespaces, nsName;
    namespaces = fs.readdirSync(this.dataPath);
    this.namespaces = [];
    if (!(Array.isArray(namespaces) && namespaces.length > 0)) {
      throw Error("no namespace found");
    }
    for (i = 0, len = namespaces.length; i < len; i++) {
      namespace = namespaces[i];
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
    var i, len, ns, ref;
    ref = this.namespaces;
    for (i = 0, len = ref.length; i < len; i++) {
      ns = ref[i];
      if (ns.name === name) {
        return true;
      }
    }
    return false;
  };

  DataHandler.prototype.getNamespace = function(name) {
    var i, len, ns, ref;
    ref = this.namespaces;
    for (i = 0, len = ref.length; i < len; i++) {
      ns = ref[i];
      if (ns.name === name) {
        return ns;
      }
    }
  };

  return DataHandler;

})();
