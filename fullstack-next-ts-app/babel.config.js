module.exports = function (api) {
  const isServer = api.caller((caller) => caller?.isServer)
  const isCallerDevelopment = api.caller((caller) => caller?.isDev)

  const presets = [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource:
            !isServer && isCallerDevelopment
              ? '@welldone-software/why-did-you-render'
              : 'react'
        }
      }
    ]
  ]

  const plugins = [
    [
      'babel-plugin-import',
      {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false
      },
      'core'
    ]
  ]

  return { presets, plugins }
}
