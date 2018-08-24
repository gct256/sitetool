import * as path from 'path';

import { Config } from '../src/core/Config';
import { Emitter } from '../src/core/Emitter';

jest.mock('fs-extra');

const logger = new Emitter();

describe('Config', () => {
  beforeEach(async () => {
    require('fs-extra').__setMockFiles({
      foo: null,
      bar: null,
      'bar/sitetool.config.js': `
module.exports = {
  directory: {
    src: '${path.resolve('bar/SRC')}',
    work: '${path.resolve('bar/WORK')}',
    dist: '${path.resolve('bar/DIST')}',
  },
};`,
      qux: null,
      'qux/sitetool.config.js': 'module.export = {'
    });
  });

  test('constructor', () => {
    expect(new Config(logger)).toBeInstanceOf(Config);
    expect(new Config(logger).isLoaded()).toBe(false);
  });

  test('loadDirectory without config file', async () => {
    const config = new Config(logger);
    await config.loadDirectory(path.resolve('foo'));
    expect(config.directory).toEqual({
      src: path.resolve('foo', 'src'),
      work: path.resolve('foo', 'work'),
      dist: path.resolve('foo', 'dist')
    });
    expect(config.getConfigFile()).toBe(null);
    expect(config.getRoot()).toBe(path.resolve('foo'));
    expect(config.isLoaded()).toBe(true);
  });

  test('loadDirectory with config file', async () => {
    const config = new Config(logger);
    await config.loadDirectory(path.resolve('bar'));
    expect(config.directory).toEqual({
      src: path.resolve('bar/SRC'),
      work: path.resolve('bar/WORK'),
      dist: path.resolve('bar/DIST')
    });
    expect(config.getConfigFile()).toBe(path.resolve('bar/sitetool.config.js'));
    expect(config.getRoot()).toBe(path.resolve('bar'));
    expect(config.isLoaded()).toBe(true);
  });

  test('loadConfigFile with config file', async () => {
    const config = new Config(logger);
    await config.loadConfigFile(path.resolve('bar/sitetool.config.js'));
    expect(config.directory).toEqual({
      src: path.resolve('bar/SRC'),
      work: path.resolve('bar/WORK'),
      dist: path.resolve('bar/DIST')
    });
    expect(config.getConfigFile()).toBe(path.resolve('bar/sitetool.config.js'));
    expect(config.getRoot()).toBe(path.resolve('bar'));
    expect(config.isLoaded()).toBe(true);
  });

  test('loadConfigFile without config file', async () => {
    expect.assertions(1);

    const config = new Config(logger);
    try {
      await config.loadConfigFile(path.resolve('baz/sitetool.config.js'));
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });

  test('loadConfigFile with invalid config file', async () => {
    const config = new Config(logger);
    await config.loadConfigFile(path.resolve('qux/sitetool.config.js'));
    expect(config.directory).toEqual({
      src: path.resolve('qux/src'),
      work: path.resolve('qux/work'),
      dist: path.resolve('qux/dist')
    });
    expect(config.getConfigFile()).toBe(path.resolve('qux/sitetool.config.js'));
    expect(config.getRoot()).toBe(path.resolve('qux'));
    expect(config.isLoaded()).toBe(true);
  });
});
