const path = require('path');
const BabiliPlugin = require('babili-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let plugins = [];

// Used to create the index.html inside dist folder with all
// resources imported css, js needed
// based on the main.html file
plugins.push(new HtmlWebpackPlugin({
  hash: true,
  minify: {
    html5: true,
    collapseWhitespace: true,
    removeComments: true
  },
  filename: 'index.html',
  template: __dirname + '/main.html'
}))

// Used to avoid FOUC (Flash of unstiled content)
plugins.push(new ExtractTextPlugin('styles.css'));

// Strategy for global dependencies
plugins.push(new Webpack.ProvidePlugin({
  '$': 'jquery/dist/jquery.js',
  'jQuery': 'jquery/dist/jquery.js'
}));

// Strategy to separate vendor bundle from the porject bundle, it
// needs the entry to receive a diferent object
plugins.push(new Webpack.optimize.CommonsChunkPlugin({
  name: 'vendor', // this name has to be the same as defined in the entry object
  filename: 'vendor.bundle.js'
}));

let SERVICE_URL = JSON.stringify('http://localhost:3000');

if(process.env.NODE_ENV == 'production') {

  SERVICE_URL = JSON.stringify('http://prod_env_url')
  plugins.push(new Webpack.optimize.ModuleConcatenationPlugin());
  plugins.push(new BabiliPlugin()); // Minification plugin for ES > 5
  plugins.push(new OptimizeCssAssetsPlugin({
    cssProcessor: require('cssnano'),
    cssProcessorOptions: {
      discardComments: {
        removeAll: true
      }
    },
    canPrint: true
  }))
}

plugins.push( new Webpack.DefinePlugin({ SERVICE_URL }));

module.exports = {
  // entry: './app-src/app.js',
  entry: {
    app: './app-src/app.js',
    vendor: ['jquery', 'bootstrap', 'reflect-metadata'] // Used with CommonsChunkPlugin
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    // publicPath: 'dist' /-- Just needed when index.html is outside dist folder
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      { 
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/font-woff' 
      },
      { 
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
      },
      { 
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file-loader' 
      },
      { 
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml' 
      }   
    ]
  },
  plugins
}