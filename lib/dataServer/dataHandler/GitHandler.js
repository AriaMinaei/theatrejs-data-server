var GitHandler, delay, fs, git, nodefn;

nodefn = require('when/node/function');

fs = require('graceful-fs');

git = require('gift');

delay = require('when/delay');

module.exports = GitHandler = (function() {
  function GitHandler(dataHandler) {
    this.dataHandler = dataHandler;
    this.queue = this.dataHandler.queue;
    if (!fs.existsSync(this.dataHandler.rootPath + '/.git')) {
      throw Error("Git repo is not initialized yet");
    }
    this.repo = git(this.dataHandler.rootPath);
    if (this.repo == null) {
      throw Error("Could not get a repo from gift");
    }
    this._scheduleToCommit();
  }

  GitHandler.prototype._scheduleToCommit = function() {
    delay(5 * 60 * 1000).then((function(_this) {
      return function() {
        return _this.queue.addWhenDone(function() {
          _this._scheduleToCommit();
          return nodefn.call(_this.repo.status.bind(_this.repo)).then(function(status) {
            if (status.clean === true) {
              console.log('no need to commit');
              return;
            }
            return nodefn.call(_this.repo.add.bind(_this.repo), '.').then(function() {
              return nodefn.call(_this.repo.commit.bind(_this.repo), '[autosave]', {
                all: true
              });
            }).then(function() {
              return console.log('commited');
            });
          });
        });
      };
    })(this));
  };

  return GitHandler;

})();
