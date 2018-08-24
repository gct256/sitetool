import * as globby from 'globby';
import * as path from 'path';

import { rmrf } from '../utils';
import { buildFile } from './Builder';
import { Config } from './Config';
import { Emitter } from './Emitter';

export class Distributor {
  private emitter: Emitter;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
  }

  public async preBuild(config: Config) {
    this.emitter.emit('PRE_BUILDING', { error: false });
    await rmrf(config.directory.work, config.getRoot(), this.emitter);
    await this.build(config, false);
    this.emitter.emit('PRE_BUILT', { error: false });
  }

  public async distribute(config: Config) {
    this.emitter.emit('DISTRIBUTING', { error: false });
    const dirPath = config.directory.dist;
    try {
      await rmrf(dirPath, config.getRoot(), this.emitter);
      await this.build(config, true);
      this.emitter.emit('DISTRIBUTED', { dirPath, error: false });
    } catch (error) {
      this.emitter.emit('DISTRIBUTED', { dirPath, error });
    }
  }

  private async build(config: Config, distribute: boolean) {
    const filePaths = await globby.call(
      globby,
      path.join(config.directory.src, '**', '*')
    );

    await Promise.all(
      filePaths.map((filePath: string) =>
        buildFile(filePath, distribute, true, config, this.emitter)
      )
    );
  }
}
