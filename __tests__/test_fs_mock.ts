import * as fs from 'fs-extra';

jest.mock('fs-extra');

describe('fs-extra mock', () => {
  beforeEach(async () => {
    require('fs-extra').__setMockFiles({
      foo: null,
      bar: 'text'
    });
  });

  test('pathExists', async () => {
    expect(await fs.pathExists('foo')).toBe(true);
    expect(await fs.pathExists('bar')).toBe(true);
    expect(await fs.pathExists('baz')).toBe(false);
  });

  test('stat', async () => {
    expect.assertions(3);

    expect((await fs.stat('foo')).isDirectory()).toBe(true);
    expect((await fs.stat('bar')).isDirectory()).toBe(false);
    fs.stat('baz').catch((e) => expect(e).toBeInstanceOf(Error));
  });

  test('readFile', async () => {
    expect.assertions(4);

    try {
      await fs.readFile('foo');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }

    try {
      await fs.readFile('baz');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }

    expect(await fs.readFile('bar')).toEqual(Buffer.from('text'));
    expect(await fs.readFile('bar', 'utf8')).toEqual('text');
  });

  test('writeFile', async () => {
    expect.assertions(4);

    try {
      await fs.writeFile('lorem', 'foo');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }

    await fs.writeFile('lorem', 'bar');
    expect(await fs.readFile('bar', 'utf8')).toEqual('lorem');

    await fs.writeFile(Buffer.from('ipsum'), 'bar');
    expect(await fs.readFile('bar', 'utf8')).toEqual('ipsum');

    await fs.writeFile('lorem', 'baz');
    expect(await fs.readFile('baz', 'utf8')).toEqual('lorem');
  });

  test('mkdirp', async () => {
    expect.assertions(4);

    await fs.mkdirp('baz/qux/quux');
    expect((await fs.stat('baz')).isDirectory()).toBe(true);
    expect((await fs.stat('baz/qux')).isDirectory()).toBe(true);
    expect((await fs.stat('baz/qux/quux')).isDirectory()).toBe(true);

    try {
      await fs.mkdirp('bar/baz');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });
});
