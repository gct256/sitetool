import { rmrf } from '../utils';
import { buildFile } from './Builder';
import { Config } from './Config';
import { Emitter } from './Emitter';

export class Distributor {
  private emitter: Emitter;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
  }

  public async build(config: Config) {
    this.emitter.emit('BUILDING', { error: false });
    await rmrf(config.directory.work, config.getRoot(), this.emitter);
    await this.distributeMain(config, false);
    this.emitter.emit('BUILT', { error: false });
  }

  public async distribute(config: Config) {
    this.emitter.emit('DISTRIBUTING', { error: false });
    const dirPath = config.directory.dist;
    try {
      await rmrf(dirPath, config.getRoot(), this.emitter);
      await this.distributeMain(config, true);
      this.emitter.emit('DISTRIBUTED', { dirPath, error: false });
    } catch (error) {
      this.emitter.emit('DISTRIBUTED', { dirPath, error });
    }
  }

  private async distributeMain(config: Config, distribute: boolean) {
    const filePaths = await config.getAllSrcFiles();

    await Promise.all(
      filePaths.map((filePath: string) =>
        buildFile(filePath, distribute, true, false, config, this.emitter)
      )
    );
  }
}
