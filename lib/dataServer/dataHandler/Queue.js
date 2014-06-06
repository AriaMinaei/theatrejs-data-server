var Emitter, Queue, wn,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Emitter = require('utila/scripts/js/lib/Emitter');

wn = require('when');

module.exports = Queue = (function(_super) {
  __extends(Queue, _super);

  function Queue() {
    Queue.__super__.constructor.apply(this, arguments);
    this._oprations = [];
    this._operationsAfterDone = [];
    this._operating = false;
  }

  Queue.prototype.add = function(operationPromise) {
    this._emit('queued');
    this._oprations.push(operationPromise);
    this._check();
    return this;
  };

  Queue.prototype.addWhenDone = function(operation) {
    this._emit('queued');
    this._operationsAfterDone.push(operation);
    this._check();
    return this;
  };

  Queue.prototype._check = function() {
    if (this._operating) {
      return;
    }
    if (this._oprations.length > 0) {
      this._doOperation(this._oprations.shift());
    } else {
      this._scheduleDoneOperations();
    }
  };

  Queue.prototype._scheduleDoneOperations = function() {
    var o, _i, _len, _ref;
    if (this._operationsAfterDone.length > 0) {
      _ref = this._operationsAfterDone;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        this._oprations.push(o);
      }
      this._operationsAfterDone.length = 0;
      this._check();
    } else {
      this._emit('done');
    }
  };

  Queue.prototype._doOperation = function(o) {
    this._operating = true;
    wn(o()).then((function(_this) {
      return function(result) {
        _this._operating = false;
        return _this._check();
      };
    })(this), (function(_this) {
      return function(error) {
        _this._operating = false;
        _this._emit('error', error);
        _this._check();
      };
    })(this));
  };

  return Queue;

})(Emitter);
