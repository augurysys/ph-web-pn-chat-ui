const { CustomizeRule, mergeWithRules } = require('webpack-merge');
const { differenceWith, keyBy, merge } = require('lodash');

const DEFAULT_MERGE_RULES = {
  module: {
    rules: {
      test: CustomizeRule.Match,
      use: {
        loader: CustomizeRule.Match,
        options: CustomizeRule.Replace,
      },
    },
  },
};

module.exports = {
  mergeConfigs(webpackConfig1, webpackConfig2, mergeRules = DEFAULT_MERGE_RULES, replacePlugins = false) {
    const mergedConfig = mergeWithRules(mergeRules)(webpackConfig1, webpackConfig2);

    if (webpackConfig1.plugins && webpackConfig2.plugins) {
      const conf1ExceptConf2 = differenceWith(
        webpackConfig1.plugins,
        webpackConfig2.plugins,
        (item1, item2) => item1.constructor.name === item2.constructor.name
      );
      if (!replacePlugins) {
        const conf1ByName = keyBy(webpackConfig1.plugins, 'constructor.name');
        webpackConfig2.plugins = webpackConfig2.plugins.map(p =>
          conf1ByName[p.constructor.name] ? merge(conf1ByName[p.constructor.name], p) : p
        );
      }
      mergedConfig.plugins = [...conf1ExceptConf2, ...webpackConfig2.plugins];
    }

    return mergedConfig;
  },
};
