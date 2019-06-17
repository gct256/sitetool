const path = require('path');

const fsExtra = jest.genMockFromModule('fs-extra');

const mockFiles = {};

// eslint-disable-next-line no-underscore-dangle
fsExtra.__setMockFiles = (newMockFiles) => {
  Object.keys(mockFiles).forEach((key) => delete mockFiles[key]);

  Object.keys(newMockFiles).forEach((key) => {
    mockFiles[path.resolve(key)] = newMockFiles[key];
  });
};

fsExtra.pathExists = async (filePath) => path.resolve(filePath) in mockFiles;

fsExtra.stat = async (filePath) => {
  const f = path.resolve(filePath);
  if (!(await fsExtra.pathExists(f))) throw new Error('ENOENT');
  return {
    isDirectory() {
      return mockFiles[f] === null;
    }
  };
};

fsExtra.readFile = async (filePath, encoding) => {
  const f = path.resolve(filePath);
  if (!(await fsExtra.pathExists(f))) throw new Error('ENOENT');
  if ((await fsExtra.stat(f)).isDirectory()) throw new Error('EISDIR');

  if (encoding === undefined) return Buffer.from(mockFiles[f]);
  return mockFiles[f];
};

fsExtra.writeFile = async (content, filePath, encoding) => {
  const f = path.resolve(filePath);
  if (await fsExtra.pathExists(f)) {
    if ((await fsExtra.stat(f)).isDirectory()) {
      throw new Error('EISDIR');
    }
  }

  if (content instanceof Buffer) {
    mockFiles[f] = content.toString(encoding);
  } else {
    mockFiles[f] = content;
  }
};

fsExtra.mkdirp = async (filePath) => {
  const f = path.resolve(filePath);
  const parent = path.dirname(f);
  if (f.indexOf(parent) >= 0 && parent !== f) await fsExtra.mkdirp(parent);

  if (await fsExtra.pathExists(f)) {
    if (!(await fsExtra.stat(f)).isDirectory()) {
      throw new Error('EEXIST');
    }
  } else {
    mockFiles[f] = null;
  }
};

module.exports = fsExtra;
