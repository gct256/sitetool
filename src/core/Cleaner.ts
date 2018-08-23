import { rmrf } from '../utils';
import { Config } from './Config';
import { Emitter, EventType } from './Emitter';

export class Cleaner {
  private emitter: Emitter;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
  }

  public async clean(config: Config) {
    if (config.isLoaded()) {
      this.emitter.emit(EventType.CLEANING);

      await rmrf(config.directory.work, config.getRoot(), this.emitter);
      await rmrf(config.directory.dist, config.getRoot(), this.emitter);

      this.emitter.emit(EventType.CLEANED);
    }
  }
}
