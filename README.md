# Install

```
npm install ftp-output-webpack-plugin --save-dev
```

# Usage

the output path is relative to the root path on which your ftp server serves  

the plugin is based on [node-ftp](https://github.com/mscdex/node-ftp) and receives the same ftp options and some additional plugin options. please see `connect` method in [Methods](https://github.com/mscdex/node-ftp#methods) section in its READEME file

then you can do like this in `webpack.config.js`

```javascript
const FtpOutputPlugin = require('ftp-output-webpack-plugin')
const ftpOptions = {
  // plugin options
  path: '/'       // default: /,  output path on ftp server,
  replace: false  // default: false, whether replace old output filesystem
  // ftp options
  // see node-ftp
}

module.exports = {
  plugins: [
    new FtpOutputPlugin(ftpOptions) // ftpOptions see as above description
  ]
}
```