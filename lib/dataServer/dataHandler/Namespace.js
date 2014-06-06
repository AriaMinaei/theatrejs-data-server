var CSON, Namespace, fs, nodefn, sysPath, wn;

fs = require('graceful-fs');

wn = require('when');

CSON = require('cson');

nodefn = require('when/node/function');

sysPath = require('path');

module.exports = Namespace = (function() {
  function Namespace(dataHandler, name) {
    this.dataHandler = dataHandler;
    this.name = name;
    this.dataPath = this.dataHandler.dataPath;
    this.queue = this.dataHandler.queue;
    this.mainFilePath = sysPath.join(this.dataPath, this.name + '.cson');
    this.trimmedFilePath = sysPath.join(this.dataPath, this.name + '.json');
    this._headData = this._readHeadData();
    this._savingData = false;
  }

  Namespace.prototype.getHeadData = function() {
    return this._headData;
  };

  Namespace.prototype._readHeadData = function() {
    return nodefn.call(fs.readFile, this.mainFilePath, {
      encoding: 'utf-8'
    }).then((function(_this) {
      return function(cson) {
        var obj;
        if ((cson.replace(/\s+/, '')) === '') {
          return {};
        }
        obj = CSON.parseSync(cson);
        if (obj instanceof Error) {
          console.log("Error reading cson '" + _this.name + "'", obj);
          throw obj;
        }
        return obj;
      };
    })(this));
  };

  Namespace.prototype.replacePartOfHead = function(address, newData) {
    this.getHeadData().then((function(_this) {
      return function(obj) {
        var cur, lastName, subName, _i, _len;
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
        _this._scheduleToSaveData();
      };
    })(this));
  };

  Namespace.prototype._scheduleToSaveData = function() {
    if (this._savingData) {
      return;
    }
    this._savingData = true;
    setTimeout((function(_this) {
      return function() {
        _this._savingData = false;
        return _this._saveData();
      };
    })(this), 5000);
  };

  Namespace.prototype._saveData = function() {
    return this.queue.add((function(_this) {
      return function() {
        return _this.getHeadData().then(function(obj) {
          var cson, first, json, second;
          cson = CSON.stringifySync(obj);
          json = _this._trimData(obj);
          first = nodefn.call(fs.writeFile, _this.mainFilePath, cson, {
            encoding: 'utf-8'
          });
          second = nodefn.call(fs.writeFile, _this.trimmedFilePath, json, {
            encoding: 'utf-8'
          });
          return wn.all([first, second]);
        });
      };
    })(this));
  };

  Namespace.prototype._trimData = function(obj) {
    var timeline;
    timeline = obj != null ? obj.timeline : void 0;
    if (timeline == null) {
      timeline = {};
    }
    return JSON.stringify(timeline);
  };

  return Namespace;

})();
