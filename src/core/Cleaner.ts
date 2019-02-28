import { rmrf } from '../utils/index';
import { Config } from './Config';
import { Emitter } from './Emitter';

/**
 * Cleaner class
 */
export class Cleaner {
  private emitter: Emitter;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
  }

  public async clean(config: Config) {
    if (config.isLoaded()) {
      this.emitter.emit('CLEANING', { error: false });

      await rmrf(config.directory.work, config.getRoot(), this.emitter);
      await rmrf(config.directory.dist, config.getRoot(), this.emitter);

      this.emitter.emit('CLEANED', { error: false });
    }
  }
}
