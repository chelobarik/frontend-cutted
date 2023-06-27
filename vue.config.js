/* eslint-disable no-console, @typescript-eslint/camelcase, @typescript-eslint/no-var-requires */
const TerserPlugin = require('terser-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production';

process.env.VUE_APP_VERSION = isProd ? 'prod' : 'dev'
process.env.VUE_APP_URL = isProd ? '' : 'http://localhost:8080'

module.exports = {
  lintOnSave: true,
  filenameHashing: false, // убрать хеш строку у чанков

  devServer: {
    host: 'localhost',
    port: 8080,
    hotOnly: true,
    disableHostCheck: true,
    watchOptions: {
      ignored: ['**/*copy.vue']
    },
    proxy: 'http://localhost:8081'
  },

  configureWebpack: {
    optimization: isProd ? {
      minimize: true,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          },
          output: {
            comments: false
          }
        }
      })]

    } : {},
    devtool: isProd ? false : 'source-map'
  },

  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@/styles/_variables.scss";'
      }
    }
  },
}