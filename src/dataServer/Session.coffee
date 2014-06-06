ConnectionToClient = require './session/ConnectionToClient'

module.exports = class Session

	constructor: (@server, @id, socket) ->

		@dataHandler = @server.dataHandler

		@connection = new ConnectionToClient @, socket

		@connection.whenRequestedFor 'head-data', @_sendHeadData

		@connection.whenRequestedFor 'replace-part-of-head', @_replacePartOfHead

	_disconnect: ->

		@server._removeSession @

	_validateNamespace: (namespace) ->

		@dataHandler.hasNamespace namespace

	_validatePassphrase: (passphrase) ->

		passphrase is @server.acceptablePassphrase

	_sendHeadData: (received, namespace, cb) =>

		@dataHandler
		.getNamespace(namespace)
		.getHeadData()
		.then (data) ->

			cb data

		return

	_replacePartOfHead: (parts, namespace, cb) =>

		{address, newData} = parts

		@dataHandler
		.getNamespace(namespace)
		.replacePartOfHead address, newData

		cb 'done'

		return