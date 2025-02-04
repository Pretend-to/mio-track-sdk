// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development', // 或者 'development'
  entry: {
    'mio-track.cdn': {
      import: './src/index.ts',
      library: {
        name: 'Tracker',
        type: 'window',
        export: 'default',
      },
    },
    'mio-track.esm': {
      import: './src/index.ts',
      library: {
        type: 'module',
      },
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};