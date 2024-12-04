const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const { mergeConfigs } = require('./mergeConfigs');
const path = require('path');
const globalsService = require('../globals');
const useLoader = ['style-loader'];
const srcPath = path.resolve(__dirname, '../src');

module.exports = (env = {}) => {
  globalsService.loadEnvVars(env.environment);
  return mergeConfigs(
    {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { symlinks: false },
      plugins: [
        new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('development') } }),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebPackPlugin({
          title: 'Process Health App',
          template: `${srcPath}/index.html`,
          filename: 'index.html',
          inject: 'body',
          bundleUrl: '/react-bundle.js',
          excludeAssets: ['remoteEntry.js'],
        }),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
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
