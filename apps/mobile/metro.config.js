const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Ensure environment variable is available
process.env.EXPO_ROUTER_APP_ROOT = process.env.EXPO_ROUTER_APP_ROOT || './app';

const config = getDefaultConfig(__dirname);

// Add the monorepo packages to Metro resolver
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Handle shared packages
config.resolver.disableHierarchicalLookup = false;

// Web-specific configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add React Native web aliases to fix module resolution
config.resolver.alias = {
  'react-native': 'react-native-web',
  'react-native/Libraries/Image/Image': 'react-native-web/dist/exports/Image',
  'react-native/Libraries/Image/ImageBackground': 'react-native-web/dist/exports/ImageBackground',
  'react-native/Libraries/Components/Touchable/TouchableOpacity': 'react-native-web/dist/exports/TouchableOpacity',
};

// Configure resolver for web platform
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add web-specific asset extensions
config.resolver.assetExts.push('svg');

module.exports = config;