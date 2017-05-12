const FtpOutputFileSystem = require('./FtpOutputFileSystem')

function FtpOutputPlugin(options) {
  this.options = options
}

FtpOutputPlugin.prototype.apply = function (compiler) {
  compiler.plugin('environment', () => {
    compiler.outputFileSystem = new FtpOutputFileSystem(this.options, compiler)
  })
  if (!compiler.options.watch) {
    compiler.plugin('done', () => {
      compiler.outputFileSystem.client && compiler.outputFileSystem.client.end()
    })
  }
}

module.exports = FtpOutputPlugin
