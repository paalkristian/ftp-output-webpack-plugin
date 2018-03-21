const url = require('url')
const FtpOutputFileSystem = require('./FtpOutputFileSystem')

function FtpOutputPlugin(ftp, options) {
  if (typeof ftp === 'string') {
    const urlObj = url.parse(ftp)
    if (urlObj.protocol === 'ftp:') {
      const userinfo = urlObj.auth.split(':')
      this.options = Object.assign({
        path: urlObj.path,
        host: urlObj.host,
        user: userinfo[0],
        password: userinfo[1],
        port: urlObj.port || 21
      }, options)
    }
  } else {
    this.options = ftp
  }
}

FtpOutputPlugin.prototype.apply = function (compiler) {
  if (!this.options) return
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
