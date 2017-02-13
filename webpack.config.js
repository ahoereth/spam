/* eslint-disable global-require */
const path = require('path');

const webpack = require('webpack');
const WebpackHtml = require('html-webpack-plugin');
const WebpackExtractText = require('extract-text-webpack-plugin');
const WebpackCopy = require('copy-webpack-plugin');
const WebpackLivereload = require('webpack-livereload-plugin');


module.exports = (env = {}) => {
  const remoteAPI = 'https://cogsci.uni-osnabrueck.de/~SPAM/api';
  const APIURL = env.remote ? remoteAPI : undefined;
  const PRODUCTION = !!env.production;
  const PREPRODUCTION = !!env.preproduction;
  const DEVELOPMENT = !PRODUCTION && !PREPRODUCTION;

  return {
    devtool: DEVELOPMENT ? 'inline-source-map' : 'source-map',
    context: path.resolve(__dirname, 'src'),
    entry: {
      app: './index.js',
    },
    output: {
      path: path.resolve(__dirname, 'app', 'static'),
      filename: DEVELOPMENT ? '[name].js' : '[name].[chunkhash:6].js',
      publicPath: '/static/',
    },
    resolve: {
      modules: ['node_modules', 'src'],
      alias: { '~': path.resolve(__dirname, 'src') },
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
          test: /\.(woff2?|eot|ttf|png|gif|svg)$/i,
          loader: 'url-loader',
          options: {
            limit: 4096,
            name: DEVELOPMENT ? '[name].[ext]' : '[name].[hash:6].[ext]',
          },
          exclude: /svg-icon/,
        },
        {
          test: /\.svg$/i,
          loader: 'svg-sprite-loader',
          include: /svg-icon/,
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
                  minimize: DEVELOPMENT ? false : {
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
          test: /\.html$/i,
          loader: 'html-loader',
        },
      ],
    },
    plugins: [
      new WebpackExtractText({
        filename: DEVELOPMENT ? 'styles.css' : 'styles.[contenthash:6].css',
        // disable: DEVELOPMENT, // Apparently breaks web fonts.
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
        { from: 'img/spam.png' },
        { from: 'img/spam.ico' },
        {
          from: '.htaccess',
          to: '..',
          transform: buf => (
            buf.toString().replace(PRODUCTION ? /#PROD#\s*/g : /#DEV#\s*/g, '')
          ),
        },
      ]),
      new WebpackLivereload({
        appendScriptTag: !PRODUCTION,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(DEVELOPMENT ? 'development' : 'production'),
          APIURL: JSON.stringify(APIURL),
        },
      }),
      DEVELOPMENT ? () => {} : new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          properties: true,
          sequences: true,
          dead_code: true,
          conditionals: true,
          comparisons: true,
          evaluate: true,
          booleans: true,
          unused: true,
          loops: true,
          hoist_funs: true,
          cascade: true,
          if_return: true,
          join_vars: true,
          drop_console: true,
          drop_debugger: true,
          unsafe: true,
          hoist_vars: true,
          negate_iife: true,
          side_effects: true,
        },
        sourceMap: true,
        mangle: {
          toplevel: true,
          sort: true,
          eval: true,
          properties: true,
        },
        output: {
          space_colon: false,
          comments: false,
        },
      }),
    ],
  };
};
