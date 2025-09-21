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

// Add web-specific asset extensions
config.resolver.assetExts.push('svg');

module.exports = config;