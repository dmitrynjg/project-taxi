const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlReplaceWebpackPlugin = require('html-replace-webpack-plugin');

module.exports = {
  entry: __dirname + "/src/app.js",
  output: {
    path: __dirname + '/build',
    filename: 'app.min.js',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]
    }
    ]
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
      pattern: '<script src="script.js"></script>',
      replacement: ''
    })
  ]
}; 
