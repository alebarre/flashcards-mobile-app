const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Configuração do proxy para evitar CORS
config.server = {
  ...config.server,
  experimentalImportSupport: false,
  minify: false,
  enableCors: false, // Desabilita as restrições de CORS no desenvolvimento
};

module.exports = config;
