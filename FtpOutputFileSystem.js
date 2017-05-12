const path = require('path')
const FtpClient = require('ftp')
const pathJoin = require('path.join')
const url = require('url')

const wrap = (oldMethod, oldContext) => (newMethod, newContext) => function(...args) {
  let called = false
  const callback = args[args.length - 1]
  const onceCallback = function() {
    if (!called) {
      called = true
      callback.apply(this, arguments)
    }
  }
  args.splice(args.length - 1, 1, onceCallback)
  if (!this.replace) oldMethod.apply(oldContext, args)
  if (this.client.connected) {
    newMethod.apply(newContext || this, args)
  }

  if (this.replace && !this.client.connected) {
    onceCallback()
  }
}

function FtpOutputFileSystem(options, compiler) {
  this.options = options
  this.replace = this.options.replace === true
  this.localOutputPath = compiler.options.output.path
  this.oldOutputFileSystem = compiler.outputFileSystem
  this.client = new FtpClient()
  this.client.connect(this.options)
  this.client.on('error', err => {
    process.stderr.write(`\n\u001b[1m\u001b[31mWarning: connected to ${url.format(this.options)} failed: [${err.code}]\u001b[39m\u001b[22m\n`)
  })

  this.relative = function(p) {
    return path.relative(this.localOutputPath, p).replace(/\\/g, '/') || '.'
  }

  this.getFtpOutputPath = function(p) {
    return pathJoin(this.options.path || '/', this.relative(p))
  }

  this.mkdirp = wrap(
    this.oldOutputFileSystem.mkdirp,
    this.oldOutputFileSystem
  )(function(path, callback) {
    this.client.mkdir(this.getFtpOutputPath(path), true, () => callback())
  })

  this.mkdir = wrap(
    this.oldOutputFileSystem.mkdir,
    this.oldOutputFileSystem
  )(function(path, callback) {
    this.client.mkdir(this.getFtpOutputPath(path), false, () => callback())
  })

  this.rmdir = wrap(
    this.oldOutputFileSystem.rmdir,
    this.oldOutputFileSystem
  )(function(path, callback) {
    this.client.rmdir(this.getFtpOutputPath(path), false, callback)
  })

  this.unlink = wrap(
    this.oldOutputFileSystem.unlink,
    this.oldOutputFileSystem
  )(function (path, callback) {
    this.client.delete(this.getFtpOutputPath(path), callback)
  })

  this.writeFile = wrap(
    this.oldOutputFileSystem.writeFile,
    this.oldOutputFileSystem
  )(function (file, data, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    if (!Buffer.isBuffer(data)) {
      data = new Buffer(data, 'utf8')
    }
    this.client.put(data, this.getFtpOutputPath(file), callback)
  })

  this.join = function() {
    return this.oldOutputFileSystem.join.apply(this.oldOutputFileSystem, arguments)
  }
}

module.exports = FtpOutputFileSystem
