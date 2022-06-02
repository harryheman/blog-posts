const path = require('path')

module.exports = {
  process: (sourceText, sourcePath, options) => ({
    code: `module.exports = ${JSON.stringify(path.basename(sourcePath))}`
  })
}
