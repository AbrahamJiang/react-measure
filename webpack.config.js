const path = require('path')
const webpack = require('webpack')
const config = {
  devtool: 'eval',

  devServer: {
    contentBase: path.resolve(__dirname, 'example'),
    disableHostCheck: true,
    historyApiFallback: true,
    hot: true,
    host: '0.0.0.0',
    port: 8080,
  },

  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './example/index.js',
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'example'),
    publicPath: '/',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
}

module.exports = config
