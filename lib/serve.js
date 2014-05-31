var didServe, serve;

didServe = false;

module.exports = serve = function(repoPath, port, serializedDirName, passwords, logsPath) {
  var CSON, DataServer, PrettyError, PrettyMonitor, PromiseMonitor, fs, path, wn;
  if (didServe) {
    throw Error("Already serving");
  }
  didServe = true;
  PrettyError = require('pretty-error');
  DataServer = require('./DataServer');
  CSON = require('cson');
  path = require('path');
  fs = require('fs');
  PrettyMonitor = require('pretty-monitor');
  PromiseMonitor = require('when/monitor/PromiseMonitor');
  wn = require('when');
  return (function() {
    var pe, promiseMonitor;
    pe = new PrettyError;
    pe.renderer.style({
      'pretty-error': {
        marginLeft: 3,
        marginTop: 1
      }
    });
    if (logsPath != null) {
      pe.filterParsedError(function(e) {
        console.log("\007");;
        var errorLog;
        errorLog = CSON.stringifySync(JSON.parse(JSON.stringify(e)));
        errorLog += '\n\n------------------\n\n';
        fs.writeFileSync(path.join(repoPath, logsPath), errorLog, {
          flag: 'a'
        });
        setTimeout((function() {
          return process.exit(1);
        }), 0);
      });
    }
    process.on('uncaughtException', function(e) {
      console.log("\007");;
      pe.render(e, true);
      console.log("-----------------------\n");
      return process.exit(1);
    });
    promiseMonitor = new PromiseMonitor(new PrettyMonitor(pe));
    promiseMonitor.monitor(wn.Promise);
    pe.skipNodeFiles();
    pe.skipPackage('socket.io');
    return process.nextTick(function() {
      var s;
      console.log("\n-----------------------\n");
      return s = new DataServer(repoPath, serializedDirName, port, passwords);
    });
  })();
};
