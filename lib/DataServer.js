var DataHandler, DataServer, Session, array, io,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

DataHandler = require('./dataServer/DataHandler');

Session = require('./dataServer/Session');

array = require('utila/scripts/js/lib/array');

io = require('socket.io');

module.exports = DataServer = (function() {
  function DataServer(rootPath, timelinesDir, port, acceptablePasswords) {
    this._serveConnection = __bind(this._serveConnection, this);
    this.dataHandler = new DataHandler(this, rootPath, timelinesDir);
    this._setPort(port);
    this._setAcceptablePasswords(acceptablePasswords);
    this._setupSocket();
  }

  DataServer.prototype._setPort = function(port) {
    this.port = port;
    if (!(Number.isFinite(this.port) && parseInt(this.port) === parseFloat(this.port))) {
      throw Error("We need a valid port");
    }
    if (!(this.port > 3000)) {
      throw Error("Port must be an integer over 3000");
    }
  };

  DataServer.prototype._setAcceptablePasswords = function(acceptablePasswords) {
    var pass, _i, _len, _ref;
    this.acceptablePasswords = acceptablePasswords;
    if (!(Array.isArray(this.acceptablePasswords) && this.acceptablePasswords.length > 0)) {
      throw Error("acceptablePasswords must be an array of strings");
    }
    _ref = this.acceptablePasswords;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pass = _ref[_i];
      if (!(typeof pass === 'string' && pass.length > 0)) {
        throw Error("Invalid password in acceptablePasswords: '" + pass + "'");
      }
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
