const path = require('path');

const fsExtra = jest.genMockFromModule('fs-extra');

const mockFiles = {};

fsExtra.__setMockFiles = (newMockFiles) => {
  for (const key of Object.keys(mockFiles)) {
    delete mockFiles[key];
  }

  for (const key of Object.keys(newMockFiles)) {
    mockFiles[path.resolve(key)] = newMockFiles[key];
  }
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

  if (encoding === undefined) return new Buffer(mockFiles[f]);
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
