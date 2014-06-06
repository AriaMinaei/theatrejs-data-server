fs = require 'graceful-fs'
Queue = require './dataHandler/Queue'
sysPath = require 'path'
Namespace = require './dataHandler/Namespace'
GitHandler = require './dataHandler/GitHandler'

module.exports = class DataHandler

	constructor: (@server, rootPath, dataDir) ->

		@queue = new Queue

		@_setPaths rootPath, dataDir

		do @_setupNamespaces

		@gitHandler = new GitHandler @

	_setPaths: (@rootPath, @dataDir) ->

		unless String(@dataDir).length > 0

			throw Error "dataDir '#{@dataDir}' is not valid"

		@dataPath = sysPath.join @rootPath, @dataDir

		unless fs.existsSync @dataPath

			throw Error "Timelines path '#{@dataPath}' doesn't exist"

	_setupNamespaces: ->

		namespaces = fs.readdirSync @dataPath

		@namespaces = []

		unless Array.isArray(namespaces) and namespaces.length > 0

			throw Error "no namespace found"

		for namespace in namespaces

			continue unless namespace.match /^[a-zA-Z0-9\-\_]+\.cson$/

			nsName = namespace.substr(0, namespace.length - 5)

			@_recognizeNamespace nsName

		if @namespaces.length is 0

			throw Error "No namespace cson file was found"

		return

	_recognizeNamespace: (name) ->

		console.log "recognized namespace", name

		@namespaces.push new Namespace @, name

		return

	hasNamespace: (name) ->

		for ns in @namespaces

			return yes if ns.name is name

		no

	getNamespace: (name) ->

		for ns in @namespaces

			return ns if ns.name is name

		return