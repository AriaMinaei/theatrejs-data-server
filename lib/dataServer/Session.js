var ConnectionToClient, Session,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ConnectionToClient = require('./session/ConnectionToClient');

module.exports = Session = (function() {
  function Session(server, id, socket) {
    this.server = server;
    this.id = id;
    this._replacePartOfHead = __bind(this._replacePartOfHead, this);
    this._sendHeadData = __bind(this._sendHeadData, this);
    this.dataHandler = this.server.dataHandler;
    this.namespaceName = null;
    this.connection = new ConnectionToClient(this, socket);
    this.connection.whenRequestedFor('head-data', this._sendHeadData);
    this.connection.whenRequestedFor('replace-part-of-head', this._replacePartOfHead);
  }

  Session.prototype._disconnect = function() {
    return this.server._removeSession(this);
  };

  Session.prototype._validateNamespace = function(namespace) {
    return this.dataHandler.hasNamespace(namespace);
  };

  Session.prototype._validatePassphrase = function(passphrase) {
    return passphrase === this.server.acceptablePassphrase;
  };

  Session.prototype._setNamespace = function(namespaceName) {
    this.namespaceName = namespaceName;
  };

  Session.prototype._sendHeadData = function(received, cb) {
    this.dataHandler.queue((function(_this) {
      return function() {
        return _this.dataHandler.getHeadDataForNamespace(_this.namespaceName).then(function(data) {
          return cb(data);
        });
      };
    })(this));
  };

  Session.prototype._replacePartOfHead = function(parts, cb) {
    var address, newData;
    address = parts.address, newData = parts.newData;
    return this.dataHandler.queue((function(_this) {
      return function() {
        return _this.dataHandler.getHeadDataForNamespace(_this.namespaceName).then(function(obj) {
          var cur, lastName, promise, subName, _i, _len;
          cur = obj;
          lastName = address.pop();
          for (_i = 0, _len = address.length; _i < _len; _i++) {
            subName = address[_i];
            if (cur[subName] != null) {
              cur = cur[subName];
            } else {
              cur[subName] = cur = {};
              console.log("Couldn't find subName '" + subName + "' in cson data");
            }
          }
          cur[lastName] = newData;
          promise = _this.dataHandler.replaceHeadDataForNamespace(_this.namespaceName, obj);
          cb('done');
          return promise;
        });
      };
    })(this));
  };

  return Session;

})();
