const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Adicionar suporte para arquivos CSS
config.resolver.assetExts.push('css');

// Configurar aliases
config.resolver.alias = {
  ...config.resolver.alias,
  '@': path.resolve(__dirname, '.'),
  '@/components': path.resolve(__dirname, 'components'),
  '@/lib': path.resolve(__dirname, 'lib'),
  '@/hooks': path.resolve(__dirname, 'hooks'),
  '@/screens': path.resolve(__dirname, 'screens'),
  '@/services': path.resolve(__dirname, 'services'),
};

module.exports = config;
