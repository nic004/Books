var Path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var Webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var isProduction = process.env.NODE_ENV === 'production';
var cssOutputPath = isProduction ? '/styles/app.[hash].css' : '/styles/app.css';
var jsOutputPath = isProduction ? '/scripts/app.[hash].js' : '/scripts/app.js';
var ExtractSASS = new ExtractTextPlugin(cssOutputPath);
// var port = isProduction ? process.env.PORT || 8080 : process.env.PORT || 3000;
var port = isProduction ? process.env.PORT || 8080 : 3000;

// ------------------------------------------
// Base
// ------------------------------------------
var webpackConfig = {
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      'books': Path.resolve('./client/app/'),
      'highlight': Path.resolve('./node_modules/highlight.js'),
      'whatwg-fetch': Path.resolve('./node_modules/whatwg-fetch'),
      'scroll-to-element': Path.resolve('./node_modules/scroll-to-element'),
      'react-key-handler': Path.resolve('./node_modules/react-key-handler'),
      'react-addons-update': Path.resolve('./node_modules/react-addons-update')
    }
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
      },
    }),
    new HtmlWebpackPlugin({
      template: Path.join(__dirname, './client/index.html'),
    }),
  ],
  module: {
    loaders: [{
      test: /.jsx?$/,
      include: Path.join(__dirname, './client/app'),
      loader: 'babel',
    }],
  },
};

// ------------------------------------------
// Entry points
// ------------------------------------------
webpackConfig.entry = !isProduction
  ? ['webpack-dev-server/client?http://localhost:' + port,
     'webpack/hot/dev-server',
     Path.join(__dirname, './client/app/index')]
  : [Path.join(__dirname, './client/app/index')];

// ------------------------------------------
// Bundle output
// ------------------------------------------
webpackConfig.output = {
  path: Path.join(__dirname, './dist'),
  filename: jsOutputPath,
};

// ------------------------------------------
// Devtool
// ------------------------------------------
webpackConfig.devtool = isProduction ? 'source-map' : 'cheap-eval-source-map';

// ------------------------------------------
// Module
// ------------------------------------------
isProduction
  ? webpackConfig.module.loaders.push({
      test: /\.(css|scss)$/,
      loader: ExtractSASS.extract(['css', 'sass']),
    })
  : webpackConfig.module.loaders.push({
      test: /\.(css|scss)$/,
      loaders: ['style', 'css', 'sass'],
    });

// ------------------------------------------
// Plugins
// ------------------------------------------
isProduction
  ? webpackConfig.plugins.push(
      new Webpack.optimize.OccurenceOrderPlugin(),
      new Webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false,
        },
      }),
      ExtractSASS
    )
  : webpackConfig.plugins.push(
      new Webpack.HotModuleReplacementPlugin()
    );

// ------------------------------------------
// Development server
// ------------------------------------------
if (!isProduction) {
  webpackConfig.devServer = {
    contentBase: Path.join(__dirname, './'),
    hot: true,
    port: port,
    inline: true,
    progress: true,
    historyApiFallback: true,
  };
}

module.exports = webpackConfig;