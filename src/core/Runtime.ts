import { Cleaner } from './Cleaner';
import { Config } from './Config';
import { Distributor } from './Distributor';
import { Emitter } from './Emitter';
import { Server } from './Server';
import { Watcher } from './Watcher';

/**
 * Runtime class
 */
export class Runtime extends Emitter {
  private config: Config;

  private watcher: Watcher;

  private server: Server;

  private cleaner: Cleaner;

  private distributor: Distributor;

  constructor() {
    super();

    this.config = new Config(this);
    this.watcher = new Watcher(this);
    this.server = new Server(this);
    this.cleaner = new Cleaner(this);
    this.distributor = new Distributor(this);

    this.emit('READY', { error: false });
  }

  public async openDirectory(dirPath: string) {
    if (this.config.isLoaded()) await this.close();

    this.emit('OPENING', { error: false });

    try {
      await this.config.loadDirectory(dirPath);
      this.emit('OPENED', { error: false });
    } catch (error) {
      this.emit('OPENED', { error });
    }
  }

  public async openConfigFile(filePath: string) {
    if (this.config.isLoaded()) await this.close();

    this.emit('OPENING', { error: false });

    try {
      await this.config.loadConfigFile(filePath);
      this.emit('OPENED', { error: false });
    } catch (error) {
      this.emit('OPENED', { error });
    }
  }

  public async close() {
    if (this.config.isLoaded()) {
      await this.stopWatcher();
      await this.stopServer();

      this.emit('CLOSING', { error: false });
      await this.config.unload();
      this.emit('CLOSED', { error: false });
    }
  }

  public async build() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.distributor.build(this.config);
    }
  }

  public async startWatcher() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.watcher.start(this.config);
    }
  }

  public async stopWatcher() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.watcher.stop();
    }
  }

  public async startServer() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.server.start(this.config);
    }
  }

  public async stopServer() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.server.stop();
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public async clean() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.execute(async () => {
        await this.cleaner.clean(this.config);
      });
    }
  }

  public async distribute() {
    if (!this.config.isLoaded()) {
      this.emit('MESSAGE', 'config not loaded');
    } else {
      await this.execute(async () => {
        await this.distributor.distribute(this.config);
      });
    }
  }

  private async execute(handler: () => Promise<void>) {
    const w: boolean = this.watcher.isRunning();
    const s: boolean = this.server.isRunning();

    if (w) await this.watcher.stop();
    if (s) await this.server.stop();

    await handler();

    if (w) await this.watcher.start(this.config);
    if (s) await this.server.start(this.config);
  }
}
