var ConnectionToClient,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

module.exports = ConnectionToClient = (function() {
  function ConnectionToClient(session, socket) {
    var $emit;
    this.session = session;
    this.socket = socket;
    this._receiveClientRequest = __bind(this._receiveClientRequest, this);
    this._getAuthData = __bind(this._getAuthData, this);
    this._handleDisconnect = __bind(this._handleDisconnect, this);
    this.id = this.session.id;
    this._isAuthenticated = false;
    this._requestListeners = {};
    console.log("connection: " + this.id);
    $emit = this.socket.$emit;
    socket.$emit = (function(_this) {
      return function(msg, data, cb) {
        if (msg.substr(0, 15) === 'client-requests') {
          _this._receiveClientRequest(msg, data, cb);
          return;
        }
        return $emit.apply(socket, arguments);
      };
    })(this);
    this.socket.on('disconnect', this._handleDisconnect);
    this.socket.emit('server-asks:send-auth-data', this.id);
    this.socket.on('client-asks:get-auth-data', this._getAuthData);
  }

  ConnectionToClient.prototype._handleDisconnect = function() {
    console.log("disconnected: " + this.id);
    return this.session._disconnect();
  };

  ConnectionToClient.prototype._getAuthData = function(data, cb) {
    var namespace, password;
    console.log('got requested for auth');
    password = data.password, namespace = data.namespace;
    if (!this.session._validateNamespace(namespace)) {
      console.log('invalid namespace:', namespace);
      return cb('invalid-namespace');
    }
    console.log('setting namespace to', namespace);
    if (!this.session._validatePasswordForNamespace(namespace, password)) {
      console.log('invalid password:', password);
      return cb('invalid-password');
    }
    console.log('authenticated with:', password);
    cb('accepted');
    this.session._setNamespace(namespace);
    return this._isAuthenticated = true;
  };

  ConnectionToClient.prototype._receiveClientRequest = function(msg, data, cb) {
    var listener, what;
    what = msg.substr(16, msg.length);
    console.log('got requested for', what);
    if (!this._isAuthenticated) {
      console.log('not authenticated yet');
      return cb('error:auth-required');
    }
    listener = this._requestListeners[what];
    if (listener == null) {
      throw Error("No ask listener was found for '" + what + "'");
    }
    return listener(data, cb, what);
  };

  ConnectionToClient.prototype.whenRequestedFor = function(what, cb) {
    if (this._requestListeners[what] != null) {
      throw Error("msg '" + what + "' already has a listener attached");
    }
    this._requestListeners[what] = cb;
    return this;
  };

  return ConnectionToClient;

})();
