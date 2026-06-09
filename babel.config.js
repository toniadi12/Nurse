// Babel config untuk Expo + Reanimated.
//
// Reanimated plugin WAJIB diletakkan PALING TERAKHIR di daftar plugins —
// kalau tidak, worklet detection bisa kacau dan animasi gagal jalan di
// UI thread. Lihat docs reanimated v3 untuk detail.

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
