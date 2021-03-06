const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: __dirname + "/src/app.js",
  output: {
    path: __dirname + '/build',
    filename: 'app.min.js',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', MiniCssExtractPlugin.loader, {
        loader: 'css-loader',
        options: { sourceMap: false }
      }, {
        loader: 'postcss-loader',
        options: { sourceMap: false, config: { path: 'postcss.config.js' } }
      }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + "/src/index.html",
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: 'app.min.css'
    }),
    new HtmlReplaceWebpackPlugin({
      pattern: '<link rel="stylesheet" href="style.css">',
      replacement: '<link rel="stylesheet" href="app.min.css">'
    }),
    new HtmlReplaceWebpackPlugin({
      pattern: '<script type="text/javascript" src="app.js"></script>',
      replacement: '\n \n'
    }),
    new CopyPlugin([
      { from: 'src/image', to: 'image' }
    ])
  ]
};