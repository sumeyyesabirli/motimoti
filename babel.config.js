module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Bu satırı eklediğinden emin ol
      'react-native-reanimated/plugin',
    ],
  };
};
