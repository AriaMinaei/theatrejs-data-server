fs = require 'graceful-fs'
wn = require 'when'
CSON = require 'cson'
nodefn = require 'when/node/function'
sysPath = require 'path'

module.exports = class Namespace

	constructor: (@dataHandler, @name) ->

		@dataPath = @dataHandler.dataPath

		@queue = @dataHandler.queue

		@mainFilePath = sysPath.join @dataPath, @name + '.cson'
		@trimmedFilePath = sysPath.join @dataPath, @name + '.json'

		@_headData = do @_readHeadData

		@_savingData = no

	getHeadData: ->

		@_headData

	_readHeadData: ->

		nodefn.call(fs.readFile, @mainFilePath, {encoding: 'utf-8'})
		.then (cson) =>

			if (cson.replace /\s+/, '') is ''

				return {}

			obj = CSON.parseSync cson

			if obj instanceof Error

				console.log "Error reading cson '#{@name}'", obj

				throw obj

			obj

	replacePartOfHead: (address, newData) ->

		@getHeadData().then (obj) =>

			cur = obj

			lastName = address.pop()

			for subName in address

				if cur[subName]?

					cur = cur[subName]

				else

					cur[subName] = cur = {}

					console.log "Couldn't find subName '#{subName}' in cson data"

			cur[lastName] = newData

			do @_scheduleToSaveData

			return

		return

	_scheduleToSaveData: ->

		return if @_savingData

		@_savingData = yes

		setTimeout =>

			@_savingData = no

			do @_saveData

		, 5000

		return

	_saveData: ->

		@queue.add => @getHeadData().then (obj) =>

			cson = CSON.stringifySync obj

			json = @_trimData obj

			first = nodefn.call(fs.writeFile, @mainFilePath, cson, {encoding: 'utf-8'})
			second = nodefn.call(fs.writeFile, @trimmedFilePath, json, {encoding: 'utf-8'})

			wn.all([first, second])

	_trimData: (obj) ->

		timeline = obj?.timeline

		timeline ?= {}

		JSON.stringify timeline