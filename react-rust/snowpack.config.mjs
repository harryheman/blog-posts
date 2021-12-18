/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
    pkg: { url: '/pkg' }
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-sass',
    [
      '@emily-curry/snowpack-plugin-wasm-pack',
      {
        projectPath: '.'
      }
    ]
  ],
  routes: [],
  optimize: {},
  packageOptions: {},
  devOptions: {},
  buildOptions: {}
}
