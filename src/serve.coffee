didServe = no

module.exports = serve = (repoPath, port, serializedDirName, passphrase, logsPath) ->

	if didServe

		throw Error "Already serving"

	didServe = yes

	PrettyError = require 'pretty-error'
	DataServer = require './DataServer'
	CSON = require 'cson'
	path = require 'path'
	fs = require 'fs'
	PrettyMonitor = require 'pretty-monitor'
	PromiseMonitor = require 'when/monitor/PromiseMonitor'
	wn = require 'when'

	# Pretty Errors
	do ->

		pe = new PrettyError

		pe.renderer.style

			'pretty-error':

				marginLeft: 3
				marginTop: 1

		if logsPath?

			pe.filterParsedError (e) ->

				`console.log("\007");`

				errorLog = CSON.stringifySync(JSON.parse(JSON.stringify(e)))
				errorLog += '\n\n------------------\n\n'

				fs.writeFileSync path.join(repoPath, logsPath), errorLog, flag: 'a'

				setTimeout (-> process.exit(1)), 0

				return

		process.on 'uncaughtException', (e) ->

			`console.log("\007");`

			pe.render e, yes

			console.log "-----------------------\n"

			process.exit(1)

		promiseMonitor = new PromiseMonitor new PrettyMonitor(pe)
		promiseMonitor.monitor wn.Promise

		pe.skipNodeFiles()
		pe.skipPackage 'socket.io'

		process.nextTick ->

			console.log "\n-----------------------\n"

			s = new DataServer repoPath, serializedDirName, port, passphrase