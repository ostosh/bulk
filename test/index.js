'use strict'

var Bulk = require('../')
var test = require('tape')

var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec
var bl = require('bl')
var isWindows = (process.platform === 'win32')

var dir = path.join(__dirname, 'node_modules/@scoped')

var dirs = fs.readdirSync(dir).map(function (item) {
  return path.join(dir, item)
})

test('exec pipe into bulk', function (t) {
  var command = 'echo ./* | node ' + Bulk.cmd + ' -c "pwd"'
  if (isWindows) {
    // pwd gives a path in msys-enabled cmd, but it's unix style: '/c/Users/...'
    // cd gives the current directory, which is equivalent to unix's pwd
    command = 'dir .\\* /b | node ' + Bulk.cmd + ' -c "cd"'
  }

  exec(command, {cwd: dir}, function (err, stdout, stderr) {
    var dirs = fs.readdirSync(dir).map(function (item) {
      return path.join(dir, item)
    })
    t.ifError(err)
    t.deepEqual(stdout.trim().split(/\s+/g), dirs)
    t.end()
  })
})

test('api pipe into bulk spawn', function (t) {
  var command = (!isWindows ? 'pwd' : 'cd')
  var bulk = Bulk(command)

  bulk
  .stdout
  .pipe(bl(function (err, chunk) {
    var stdout = chunk.toString()
    t.ifError(err)
    var expected = fs.readdirSync(dir).map(function (item) {
      return path.join(dir, item)
    })
    t.deepEqual(stdout.trim().split(/\s+/), expected)
    t.end()
  }))

  bulk.stdin.end(dirs.join(' '))
})

test('callback/buffering/exec mode', function (t) {
  var command = (!isWindows ? 'pwd' : 'cd')
  Bulk(dirs, command, function (err, stdout, stderr) {
    t.ifError(err, 'completed without error')
    t.deepEqual(stdout.trim().split(/\s+/), dirs)
    t.end()
  })
})

test('exec args into bulk', function (t) {
  var command = Bulk.cmd + ' -c "pwd" ./*'
  if (isWindows) {
    command = 'node ' + Bulk.cmd + ' -c "cd" "dir .\\*" /b'
  }
  exec(command, {cwd: dir}, function (err, stdout, stderr) {
    t.ifError(err)
    t.deepEqual(stdout.trim().split(/\s+/g), dirs)
    t.end()
  })
})

test('exec args into bulk --no-chdir', function (t) {
  exec('ls | node ' + Bulk.cmd + ' -c "echo" --no-chdir', {cwd: __dirname}, function (err, stdout, stderr) {
    t.ifError(err)
    var items = fs.readdirSync(__dirname)
    t.deepEqual(stdout.trim().split(/\s+/g), items)
    t.end()
  })
})
