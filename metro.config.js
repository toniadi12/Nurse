// Metro bundler config. Sejak SDK 54, file ini wajib ada dan harus extend
// `expo/metro-config` — kalau tidak, expo-doctor akan complain dan beberapa
// fitur seperti resolver custom & asset processing tidak jalan dengan benar.

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
