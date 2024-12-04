const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { mergeConfigs } = require('./mergeConfigs');
const path = require('path');

const useLoader = [MiniCssExtractPlugin.loader];
const srcPath = path.resolve(__dirname, '../src');

module.exports = (env = {}) => {
  return mergeConfigs(
    {
      mode: 'production',
      // This will help in reducing the size of the initial bundle loaded by the browser,
      // and improve the performance of your application.
      optimization: {
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              output: {
                comments: false,
              },
            },
            extractComments: true,
          }),
        ],
        usedExports: true, // Add tree-shaking configuration to optimize your bundle size
        sideEffects: true,
        // splitChunks: {
        //   chunks: 'all', // <-- This tells webpack to create chunks for all types of modules.
        //   minSize: 30000, // <-- Minimum size of a chunk, in bytes.
        //   maxSize: 50000, // <-- Maximum size of a chunk, in bytes. Setting this to 0 means that there is no maximum size.
        //   maxAsyncRequests: 6, // <-- The maximum number of chunks that can be created asynchronously.
        //   maxInitialRequests: 4, // <-- The maximum number of chunks that can be created synchronously.
        //   automaticNameDelimiter: '_', // <-- A string that will be used as a delimiter when generating chunk names.
        //   cacheGroups: {
        //     licenses: {
        //       test: /LICENSE\.txt$/,
        //       name: 'licenses',
        //       chunks: 'all',
        //     },
        //     vendors: {
        //       test: /[\\/]node_modules[\\/]/,
        //       priority: -10,
        //       name: 'chunks',
        //     },
        //   },
        // },
      },
      devtool: 'source-map',
      resolve: {
        symlinks: true,
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'style/[name].[contenthash].css',
          chunkFilename: 'style/[id].[contenthash].css',
        }),
        new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
        new HtmlWebPackPlugin({
          title: 'Process Health App',
          template: `${srcPath}/index.html`,
          filename: 'index.html',
          inject: 'body',
          bundleUrl: '/react-bundle.js',
          excludeAssets: ['remoteEntry.js'],
        }),
        new CleanWebpackPlugin(),
      ],
      module: {
        rules: [
          {
            test: /\.(css|sass|scss)$/,
            use: useLoader,
          },
        ],
      },
    },
    common(env)
  );
};
