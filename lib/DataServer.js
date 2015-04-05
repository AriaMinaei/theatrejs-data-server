var DataHandler, DataServer, Session, array, io,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

DataHandler = require('./dataServer/DataHandler');

Session = require('./dataServer/Session');

array = require('utila/lib/array');

io = require('socket.io');

module.exports = DataServer = (function() {
  function DataServer(rootPath, dataDir, port, acceptablePassphrase) {
    this._serveConnection = bind(this._serveConnection, this);
    this.dataHandler = new DataHandler(this, rootPath, dataDir);
    this._setPort(port);
    this._setAcceptablePassphrase(acceptablePassphrase);
    this._setupSocket();
  }

  DataServer.prototype._setPort = function(port1) {
    this.port = port1;
    if (!(Number.isFinite(this.port) && parseInt(this.port) === parseFloat(this.port))) {
      throw Error("We need a valid port");
    }
    if (!(this.port > 3000)) {
      throw Error("Port must be an integer over 3000");
    }
  };

  DataServer.prototype._setAcceptablePassphrase = function(acceptablePassphrase1) {
    this.acceptablePassphrase = acceptablePassphrase1;
    if (!(typeof this.acceptablePassphrase === 'string' && this.acceptablePassphrase.length > 0)) {
      throw Error("Invalid passphrase: '" + this.acceptablePassphrase + "'");
    }
  };

  DataServer.prototype._setupSocket = function() {
    this._sessions = [];
    this._connectionCounter = 0;
    this.io = io.listen(this.port);
    this.io.set('log level', 2);
    this.io.on('connection', this._serveConnection);
    console.log("listening to port " + this.port);
  };

  DataServer.prototype._serveConnection = function(socket) {
    return this._sessions.push(new Session(this, this._connectionCounter++, socket));
  };

  DataServer.prototype._removeSession = function(s) {
    return array.pluckOneItem(this._sessions, s);
  };

  return DataServer;

})();
