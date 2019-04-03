const path = require('path');

module.exports = {
  option: {
    'css-format': {
      development: {
        beautify: true,
        minify: false
      },
      production: {
        beautify: true,
        minify: false
      }
    },

    'js-format': {
      development: {
        beautify: true,
        minify: false
      },
      production: {
        beautify: true,
        minify: false
      }
    },

    'file-preprocess': {
      foo: 'Foo',
      development: {
        bar: 'Bar (dev)'
      },
      production: {
        bar: 'Bar'
      }
    },

    server: {
      files: [path.resolve(__dirname, 'main.js')]
    }
  }
};
