// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'production', // 或者 'development'
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
      import: './src/module.ts',
      library: {
        type: 'module',
      },
    },
    'mio-track.cjs': {
      import: './src/module.ts',
      library: {
        type:'commonjs',
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