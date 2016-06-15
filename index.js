'use strict'

var cp = require('child_process')
var spawn = require('cross-spawn')
var exec = cp.exec

module.exports = function () {
  if (arguments.length >= 3) return bulkExec.apply(this, arguments)
  return bulkSpawn.apply(this, arguments)
}

module.exports.exec = bulkExec
module.exports.spawn = bulkSpawn
module.exports.cmd = require.resolve('./cli')

function bulkExec (dirs, cmd, opts, fn) {
  // opts is optional
  if (arguments.length === 3) {
    fn = opts
    opts = {}
    return bulkExec(dirs, cmd, opts, fn)
  }
  if (!cmd) throw new Error('command required: ' + cmd)
  opts = opts || {}
  var execCmd = 'echo ' + dirs.join(' ') + ' | ' + require.resolve('./bulk')
  if ('onlyDirs' in opts && !opts.onlyDirs) execCmd += ' --no-only-dirs'
  return exec(execCmd + ' -c ' + cmd, opts, fn)
}

function bulkSpawn (cmd, opts) {
  if (!cmd) throw new Error('command required: ' + cmd)
  // opts is optional
  opts = opts || {}
  opts.stdio = 'pipe'
  return spawn(require.resolve('./bulk'), ['-c', cmd], opts)
}
