import * as globby from 'globby';
import * as path from 'path';

import { rmrf } from '../utils';
import { buildFile } from './Builder';
import { Config } from './Config';
import { Emitter, EventType } from './Emitter';

export class Distributor {
  private emitter: Emitter;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
  }

  public async distribute(config: Config) {
    this.emitter.emit(EventType.DISTRIBUTING);

    await rmrf(config.directory.dist, config.getRoot(), this.emitter);

    const filePaths = await globby.call(
      globby,
      path.join(config.directory.src, '**', '*')
    );

    await Promise.all(
      filePaths.map((filePath: string) =>
        buildFile(filePath, true, true, config, this.emitter)
      )
    );

    this.emitter.emit(EventType.DISTRIBUTED);
  }
}
