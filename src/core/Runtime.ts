import { Cleaner } from './Cleaner';
import { Config } from './Config';
import { Distributor } from './Distributor';
import { Emitter, EventType } from './Emitter';
import { Server } from './Server';
import { Watcher } from './Watcher';

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
  }

  public async openDirectory(dirPath: string) {
    if (this.config.isLoaded()) await this.close();

    this.emit('opening');
    try {
      await this.config.loadDirectory(dirPath);
      this.emit('opened');
    } catch (error) {
      this.emitForLog('ERROR', error);
    }
  }

  public async openConfigFile(filePath: string) {
    if (this.config.isLoaded()) await this.close();

    this.emit(EventType.OPENING);
    await this.config.loadConfigFile(filePath);
    this.emit(EventType.OPENED);
  }

  public async close() {
    if (this.config.isLoaded()) {
      await this.stopWatcher();
      await this.stopServer();

      this.emit(EventType.CLOSING);
      await this.config.unload();
      this.emit(EventType.CLOSED);
    }
  }

  public async startWatcher() {
    if (!this.config.isLoaded()) {
      this.emitForLog('WARN', 'config not loaded');
    } else {
      await this.watcher.start(this.config);
    }
  }

  public async stopWatcher() {
    if (!this.config.isLoaded()) {
      this.emitForLog('WARN', 'config not loaded');
    } else {
      await this.watcher.stop();
    }
  }

  public async startServer() {
    if (!this.config.isLoaded()) {
      this.emitForLog('WARN', 'config not loaded');
    } else {
      await this.server.start(this.config);
    }
  }

  public async stopServer() {
    if (!this.config.isLoaded()) {
      this.emitForLog('WARN', 'config not loaded');
    } else {
      await this.server.stop();
    }
  }

  public getConfig(): Config | null {
    return this.config;
  }

  public async clean() {
    if (!this.config.isLoaded()) {
      this.emitForLog('WARN', 'config not loaded');
    } else {
      this.execute(async () => {
        await this.cleaner.clean(this.config);
      });
    }
  }

  public async distribute() {
    if (!this.config.isLoaded()) {
      this.emitForLog('WARN', 'config not loaded');
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
