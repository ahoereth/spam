/* eslint-disable global-require */
const path = require('path');

const webpack = require('webpack');
const WebpackHtml = require('html-webpack-plugin');
const WebpackExtractText = require('extract-text-webpack-plugin');
const WebpackCopy = require('copy-webpack-plugin');
const WebpackLivereload = require('webpack-livereload-plugin');


module.exports = (env = {}) => {
  const PRODUCTION = !!env.production;
  const LIVERELOAD_PORT = 35729;
  const remoteAPI = 'https://cogsci.uni-osnabrueck.de/~SPAM/api';
  const APIURL = env.remote ? remoteAPI : '/~SPAM/api';

  return {
    devtool: PRODUCTION ? 'source-map' : 'eval',
    context: path.resolve(__dirname, 'src'),
    entry: {
      app: './index.js',
    },
    output: {
      path: path.resolve(__dirname, 'app', 'static'),
      filename: PRODUCTION ? '[name].[chunkhash:6].js' : '[name].js',
      publicPath: '/static/',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            'babel-loader?cacheDirectory=tmp/cache',
            'eslint-loader',
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(woff2?|eot|ttf|png|gif)$/i,
          loader: 'url-loader',
          options: {
            limit: 4096,
            name: PRODUCTION ? '[name].[hash:6].[ext]' : '[name].[ext]',
          },
        },
        {
          test: /\.(css|less)$/,
          use: WebpackExtractText.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  sourceMap: true,
                  minimize: !PRODUCTION ? false : {
                    discardComments: { removeAll: true },
                    autoprefixer: { browser: ['last 4 versions'], add: true },
                  },
                },
              },
              'less-loader?sourceMap',
            ],
          }),
        },
        {
          test: /\.svg$/i,
          loader: 'svg-url-loader',
          options: {
            noquotes: true,
            limit: 4096,
            name: PRODUCTION ? '[name].[hash:6].[ext]' : '[name].[ext]',
          },
        },
        {
          test: /\.html$/i,
          loader: 'html-loader',
        },
      ],
    },
    plugins: [
      new WebpackExtractText({
        filename: PRODUCTION ? 'styles.[contenthash:6].css' : 'styles.css',
        disable: !PRODUCTION,
      }),
      new WebpackHtml({
        template: 'index.html',
        filename: '../index.html',
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          minifyCSS: true,
        },
      }),
      new WebpackCopy([
        { from: 'robots.txt', to: '..' },
        {
          from: '.htaccess',
          to: '..',
          transform: buf => (
            buf.toString().replace(PRODUCTION ? /#PROD#\s*/g : /#DEV#\s*/g, '')
          ),
        },
      ]),
      new WebpackLivereload({
        port: LIVERELOAD_PORT,
      }),
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(PRODUCTION),
        APIURL: JSON.stringify(APIURL),
        LIVERELOAD_PORT: JSON.stringify(LIVERELOAD_PORT),
      }),
    ],
  };
};
