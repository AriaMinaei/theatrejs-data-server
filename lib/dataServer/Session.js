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

  Session.prototype._sendHeadData = function(received, namespace, cb) {
    this.dataHandler.getNamespace(namespace).getHeadData().then(function(data) {
      return cb(data);
    });
  };

  Session.prototype._replacePartOfHead = function(parts, namespace, cb) {
    var address, newData;
    address = parts.address, newData = parts.newData;
    this.dataHandler.getNamespace(namespace).replacePartOfHead(address, newData);
    cb('done');
  };

  return Session;

})();
