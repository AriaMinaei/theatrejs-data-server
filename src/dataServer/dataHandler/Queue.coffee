Emitter = require 'utila/scripts/js/lib/Emitter'
wn = require 'when'

module.exports = class Queue extends Emitter

	constructor: ->

		super

		@_oprations = []

		@_operationsAfterDone = []

		@_operating = no

	add: (operationPromise) ->

		@_emit 'queued'

		@_oprations.push operationPromise

		do @_check

		@

	addWhenDone: (operation) ->

		@_emit 'queued'

		@_operationsAfterDone.push operation

		do @_check

		@

	_check: ->

		return if @_operating

		if @_oprations.length > 0

			@_doOperation @_oprations.shift()

		else

			do @_scheduleDoneOperations

		return

	_scheduleDoneOperations: ->

		if @_operationsAfterDone.length > 0

			@_oprations.push o for o in @_operationsAfterDone

			@_operationsAfterDone.length = 0

			do @_check

		else

			@_emit 'done'

		return

	_doOperation: (o) ->

		@_operating = yes

		wn(o()).then (result) =>

			@_operating = no

			do @_check

		, (error) =>

			@_operating = no

			@_emit 'error', error

			do @_check

			return

		return