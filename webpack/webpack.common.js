const webpack = require('webpack');
const HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin').HtmlWebpackSkipAssetsPlugin;
const path = require('path');
// eslint-disable-next-line no-process-env
const isDevelopment = process.env.NODE_ENV === 'develop';
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const globalsService = require('../globals');
const deps = require('../package.json').dependencies;
const ExternalTemplateRemotesPlugin = require('external-remotes-plugin');
const srcPath = path.resolve(__dirname, '../src');

const styleLoaders = [
  {
    loader: 'css-loader',
    options: {
      sourceMap: false,
    },
  },
  {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
    },
  },
];

function getGlobals() {
  const globals = globalsService.getGlobals();
  const servicesUrls = {
    PH_CHAT_BASE_URL: globals.servicesUrls.chat,
  };
  const keys = {
    SEEBO_RECAPTCHA_SITE_KEY: globals.keys.recaptchaKey,
  };
  const mfUrls = {
    CHAT_MF: globals.mfUrls.chat_mf,
  };
  return {
    'window.servicesUrls': JSON.stringify(servicesUrls),
    'window.__GLOBALS': JSON.stringify(globals.publicConfig),
    'window.keys': JSON.stringify(keys),
    'window.mfURLs': JSON.stringify(mfUrls),
  };
}

function getRemotes() {
  if (isDevelopment) {
    return {
      // eslint-disable-next-line no-process-env
      chat_mf: `chat_mf@${process.env.CHAT_MF}/remoteEntry.js`,
    };
  } else {
    return {
      chat_mf: 'chat_mf@[window.platform.mfURLs.CHAT_MF]/remoteEntry.js',
    };
  }
}

function getPlugins() {
  const remotes = getRemotes();
  return [
    new webpack.DefinePlugin(isDevelopment && getGlobals()),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new ModuleFederationPlugin({
      name: 'chat_mf',
      filename: 'remoteEntry.js',
      exposes: {
        './AppComponent': `${srcPath}/app/AppComponent`,
      },
      remotes: remotes,
      shared: {
        ...deps,
        antd: {
          singleton: true,
          requiredVersion: deps.antd,
        },
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
        'styled-components': {
          singleton: true,
          requiredVersion: deps['styled-components'],
        },
      },
    }),
    new ExternalTemplateRemotesPlugin(),
    new HtmlWebpackSkipAssetsPlugin({
      excludeAssets: [/react-bundle.js/],
    }),
  ];
}

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties',
      ['import', { libraryName: 'antd', libraryDirectory: 'lib' }, 'antd'],
      ['import', { libraryName: 'antd-mobile', libraryDirectory: 'lib' }, 'antd-mobile'],
    ],
    cacheDirectory: true,
  },
};

module.exports = (env = {}) => {
  isDevelopment && globalsService.loadEnvVars(env.environment);
  return {
    stats: {
      all: true,
    },
    entry: {
      main: `${srcPath}/index.js`,
    },
    target: 'web',
    output: {
      path: path.resolve(__dirname, '../dist'),
      publicPath: 'auto',
      chunkFilename: '[contenthash].react-bundle.js',
      filename: 'react-bundle.js',
      assetModuleFilename: 'assets/[hash][ext][query]',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.scss', '.ts'],
      fallback: { process: require.resolve('process/browser'), path: require.resolve('path-browserify'), fs: false },
      alias: {
        SeeboGrid$: `${srcPath}/components/SeeboGrid/SeeboGridComponent.js`,
        api: `${srcPath}/api`,
        app: `${srcPath}/app`,
        assets: `${srcPath}/assets`,
        common: `${srcPath}/common`,
        components: `${srcPath}/components`,
        entities: `${srcPath}/entities`,
        features: `${srcPath}/features`,
        styles: `${srcPath}/styles`,
      },
    },
    devServer: {
      https: true,
      historyApiFallback: true,
      contentBase: path.resolve(__dirname, '../dist'),
      publicPath: '/',
      open: false,
      hot: true,
      port: 5100,
      headers: {
        'x-powered-by': '',
        server: '',
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          include: srcPath,
          use: isDevelopment ? [babelLoader, 'eslint-loader'] : [babelLoader],
        },
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false
          },
        },
        {
          test: /\.(css|sass|scss)$/,
          use: styleLoaders,
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'javascript/auto',
          use: {
            loader: 'url-loader',
          },
        },
      ],
    },
    plugins: getPlugins(),
  };
};
