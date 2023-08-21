module.exports = function(api) {
  const babelEnv = api.env();
  const plugins = ['react-native-reanimated/plugin'];
  api.cache(true);
  if (babelEnv !== 'development') {
    plugins.push(['transform-remove-console']);
  }
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
