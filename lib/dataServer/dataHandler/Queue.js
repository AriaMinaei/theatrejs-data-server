var Emitter, Queue, wn,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Emitter = require('utila/lib/Emitter');

wn = require('when');

module.exports = Queue = (function(superClass) {
  extend(Queue, superClass);

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
    var i, len, o, ref;
    if (this._operationsAfterDone.length > 0) {
      ref = this._operationsAfterDone;
      for (i = 0, len = ref.length; i < len; i++) {
        o = ref[i];
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
