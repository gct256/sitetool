const path = require('path');

module.exports = {
  option: {
    'file-preprocess': {
      foo: 'Foo'
    },
    server: {
      files: [path.resolve(__dirname, 'main.js')]
    }
  }
};
