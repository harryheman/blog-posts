const fs = require('fs-extra')
const path = require('path')
const babylon = require('babylon')
const traverse = require('babel-traverse').default
const { transformFromAst } = require('babel-core')
const UglifyJS = require('uglify-js')

let ID = 0

function createAsset(filename) {
  const content = fs.readFileSync(filename, 'utf-8')

  const ast = babylon.parse(content, {
    sourceType: 'module'
  })

  const dependencies = []

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value)
    }
  })

  const id = ID++

  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })

  return {
    id,
    filename,
    dependencies,
    code
  }
}

function createGraph(entry) {
  const mainAsset = createAsset(entry)

  const queue = [mainAsset]

  for (const asset of queue) {
    asset.mapping = {}

    const dirname = path.dirname(asset.filename)

    asset.dependencies.forEach((relativePath) => {
      const absolutePath = path.join(dirname, relativePath)

      const child = createAsset(absolutePath)

      asset.mapping[relativePath] = child.id

      queue.push(child)
    })
  }

  return queue
}

function createBundle(graph) {
  let modules = ''

  graph.forEach((m) => {
    modules += `${m.id}: [
      function (require, module, exports) {
        ${m.code}
      },
      ${JSON.stringify(m.mapping)}
    ],`
  })

  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id]

        function localRequire(name) {
          return require(mapping[name])
        }

        const module = { exports: {} }

        fn(localRequire, module, module.exports)

        return module.exports
      }

      require(0)
    })({ ${modules} })
  `

  return result
}

function pack() {
  const PATH_TO_CONFIG = path.join(__dirname, 'bundler.config.json')
  if (!fs.pathExistsSync(PATH_TO_CONFIG)) {
    throw new Error('Config is required.')
  }

  const config = fs.readJSONSync(PATH_TO_CONFIG)
  if (
    !config.entryPoint ||
    !config.entryPoint.trim() ||
    typeof config.entryPoint !== 'string'
  ) {
    throw new Error('Entrypoint is required.')
  }
  if (
    !config.outDir ||
    !config.outDir.trim() ||
    typeof config.outDir !== 'string'
  ) {
    throw new Error('Outdir is required.')
  }

  const graph = createGraph(path.join(__dirname, config.entryPoint))
  const result = createBundle(graph)
  const { code } = UglifyJS.minify(result)

  const PATH_TO_BUILD = path.join(__dirname, config.outDir)
  if (fs.pathExistsSync(PATH_TO_BUILD)) {
    fs.removeSync(PATH_TO_BUILD)
  }
  fs.mkdirpSync(PATH_TO_BUILD)
  fs.writeFileSync(`${PATH_TO_BUILD}/index.js`, code, 'utf-8')

  console.log('Bundle created.')
}
pack()
