# nodefn = require 'when/node/function'
# fs = require 'graceful-fs'
# git = require 'gift'
# delay = require 'when/delay'

module.exports = class GitHandler

	constructor: (@dataHandler) ->

		@queue = @dataHandler.queue

		# unless fs.existsSync @dataHandler.rootPath + '/.git'

		# 	throw Error "Git repo is not initialized yet"

		# @repo = git @dataHandler.rootPath

		# unless @repo?

		# 	throw Error "Could not get a repo from gift"

		# do @_scheduleToCommit

	_scheduleToCommit: ->

		delay(5 * 60 * 1000)
		.then =>

			@queue.addWhenDone =>

				do @_scheduleToCommit

				nodefn.call(@repo.status.bind(@repo))
				.then (status) =>

					if status.clean is yes

						console.log 'no need to commit'

						return

					nodefn.call(@repo.add.bind(@repo), '.')
					.then =>

						nodefn.call(@repo.commit.bind(@repo), '[autosave]', all: yes)

					.then =>

						console.log 'commited'

		return