import { IFileBrowserFactory } from "@jupyterlab/filebrowser";

import { Signal } from "@phosphor/signaling";

import { IHeroku } from "./tokens";

import { Client } from "./client";

export class Model {
  constructor(options: Model.IOptions) {
    const { runInTerminal, fileBrowserFactory } = options;
    this._client = new Client({});
    this._fileBrowserFactory = fileBrowserFactory;
    this._runInTerminal = runInTerminal;

    this._client.path = this._fileBrowserFactory.defaultBrowser.model.path;

    this._fileBrowserFactory.defaultBrowser.model.pathChanged.connect(
      (sender, path) => {
        this._client.path = path.newValue;
        this.pathChanged.emit(void 0);
      }
    );
  }

  apps: IHeroku.IApp[] = [];
  settings: IHeroku.ISettings = {};

  appsUpdated = new Signal<this, void>(this);
  pathChanged = new Signal<this, void>(this);

  get path(): string {
    return this._client.path;
  }

  async createApp() {
    const response = await this._client.create();

    if (response.code !== 0) {
      return Promise.reject(
        new Error(`Could not create app, error ${response.message}`)
      );
    }
    this.appsUpdated.emit(void 0);
  }

  async refreshApps(): Promise<void> {
    const response = await this._client.apps();
    this.apps = response.apps;
  }

  async refreshSettings(): Promise<boolean> {
    const response = await this._client.settings();
    if (response.settings) {
      this.settings = response.settings;
      return true;
    }
    return false;
  }

  async logs(app: string) {
    const path = this._client.path;
    const cmd = `cd ${path} && heroku logs -t -a ${app}`;
    await this._runInTerminal(cmd);
  }

  async deploy() {
    await this._client.deploy();
  }

  async destroy(app: string) {
    await this._client.destroy({ app });
    this.appsUpdated.emit(void 0);
  }

  set procfile(procfile: string) {
    this._client.updateSettings({ settings: { procfile } });
  }

  set runtime(runtime: string) {
    this._client.updateSettings({ settings: { runtime } });
  }

  set dependencies(dependencies: string) {
    this._client.updateSettings({ settings: { dependencies } });
  }

  private _client: IHeroku.IClient;
  private _fileBrowserFactory: IFileBrowserFactory;
  private _runInTerminal: (cmd: string) => Promise<void>;
}

export namespace Model {
  export interface IOptions {
    fileBrowserFactory: IFileBrowserFactory;
    runInTerminal: (cmd: string) => Promise<void>;
  }
}
