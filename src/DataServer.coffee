DataHandler = require './dataServer/DataHandler'
Session = require './dataServer/Session'
array = require 'utila/scripts/js/lib/array'
io = require 'socket.io'

module.exports = class DataServer

	constructor: (rootPath, timelinesDir, port, acceptablePassphrase) ->

		@dataHandler = new DataHandler @, rootPath, timelinesDir

		@_setPort port

		@_setAcceptablePassphrase acceptablePassphrase

		do @_setupSocket

	_setPort: (@port) ->

		unless Number.isFinite(@port) and parseInt(@port) is parseFloat(@port)

			throw Error "We need a valid port"

		unless @port > 3000

			throw Error "Port must be an integer over 3000"

	_setAcceptablePassphrase: (@acceptablePassphrase) ->

		unless typeof @acceptablePassphrase is 'string' and @acceptablePassphrase.length > 0

			throw Error "Invalid passphrase: '#{@acceptablePassphrase}'"

		return

	_setupSocket: ->

		@_sessions = []

		@_connectionCounter = 0

		@io = io.listen @port

		@io.set 'log level', 2

		@io.on 'connection', @_serveConnection

		console.log "listening to port #{@port}"

		return

	_serveConnection: (socket) =>

		@_sessions.push new Session @, @_connectionCounter++, socket

	_removeSession: (s) ->

		array.pluckOneItem @_sessions, s