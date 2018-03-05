// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { CheckerPlugin } = require('awesome-typescript-loader');
const { ProvidePlugin } = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/assets/",
    filename: "./bundle.js"
  },
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: ['.ts', '.js'],
  },

  devServer: {
    host: '0.0.0.0',
    open: true,
  },

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  // Add the loader for .ts files.
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
      },
    ],
  },
  plugins: [
    new CheckerPlugin(),
    new ProvidePlugin({
      THREE: 'three',
    })
  ],
};
