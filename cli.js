#!/usr/bin/env node

'use strict'

var minimist = require('minimist')
var spawn = require('cross-spawn')
var bulk = require.resolve('./bulk')

var argv = minimist(process.argv.slice(2))

if (!argv._.length) {
  spawn(bulk, process.argv.slice(2), {stdio: 'inherit'})
} else {
  // assume dirs passed as args after -c
  var child = spawn(bulk, process.argv.slice(2))
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)
  child.stdin.end(argv._.join(' '))
}
