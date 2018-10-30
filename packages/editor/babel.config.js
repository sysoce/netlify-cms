const path = require('path');
const babelConfig = require('../../babel.config.js');

module.exports = {
  ...babelConfig,
  plugins: [
    ...babelConfig.plugins,
    'react-hot-loader/babel',
    [
      'module-resolver',
      {
        root: path.join(__dirname, 'src/components'),
        alias: {
          src: path.join(__dirname, 'src'),
        },
      },
    ],
  ],
};
