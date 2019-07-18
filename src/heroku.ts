import { ServerConnection } from "@jupyterlab/services";

import { URLExt, IChangedArgs } from "@jupyterlab/coreutils";

import { IFileBrowserFactory, FileBrowserModel } from "@jupyterlab/filebrowser";
import { ReadonlyJSONObject } from "@phosphor/coreutils";
import { ISignal } from "@phosphor/signaling";

const LOGS_ENDPOINT = "/heroku/logs";
const CREATE_ENDPOINT = "/heroku/create";
const APPS_ENDPOINT = "/heroku/apps";
const DEPLOY_ENDPOINT = "/heroku/deploy";
const GET_SETTINGS_ENDPOINT = "/heroku/settings";
const POST_SETTINGS_ENDPOINT = "/heroku/settings/update";

function httpRequest(
  url: string,
  method: string,
  request?: Object
): Promise<Response> {
  let fullRequest: RequestInit = {
    method: method,
    body: JSON.stringify(request)
  };

  let setting = ServerConnection.makeSettings();
  let fullUrl = URLExt.join(setting.baseUrl, url);
  return ServerConnection.makeRequest(fullUrl, fullRequest, setting);
}

export interface IHerokuApp {
  name: string;
  web_url: string;
  status?: string;
}

export type IHerokuApps = IHerokuApp[];

interface IHerokuAppCreateResponse {
  code: number;
  message?: string;
  app?: IHerokuApp;
}

interface IHerokuAppsResponse {
  code: number;
  apps: IHerokuApps;
}

interface IHerokuSettings {
  runtime?: string;
  dependencies?: string;
  procfile?: string;
}

interface IHerokuSettingsResponse {
  code: number;
  settings?: IHerokuSettings;
}

interface IHerokuResponse {
  code: number;
  message?: string;
}

export class Heroku {
  constructor(fileBrowserFactory: IFileBrowserFactory) {
    this._fileBrowserFactory = fileBrowserFactory;
  }

  private getCurrentPath() {
    return this._fileBrowserFactory.defaultBrowser.model.path;
  }

  private async herokuAction<ReturnType>(
    endpoint: string,
    method: string = "POST",
    data: Object = {}
  ): Promise<ReturnType> {
    const path = this.getCurrentPath();
    const request = httpRequest(endpoint, method, {
      current_path: path,
      ...data
    });
    const response = await request;
    if (!response.ok) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }

  async logs(): Promise<ReadonlyJSONObject> {
    return this.herokuAction(LOGS_ENDPOINT);
  }

  async create(): Promise<IHerokuAppCreateResponse> {
    return this.herokuAction<IHerokuAppCreateResponse>(CREATE_ENDPOINT);
  }

  async apps(): Promise<IHerokuApps> {
    const response = await this.herokuAction<IHerokuAppsResponse>(
      APPS_ENDPOINT
    );
    return response.apps;
  }

  async deploy(): Promise<IHerokuResponse> {
    const response = await this.herokuAction<IHerokuResponse>(DEPLOY_ENDPOINT);
    return response;
  }

  async updateSettings(settings: IHerokuSettings): Promise<void> {
    const response = await this.herokuAction<IHerokuResponse>(
      POST_SETTINGS_ENDPOINT,
      "POST",
      { ...settings }
    );
    if (response.message) {
      console.error(response.message);
    }
  }

  async settings(): Promise<IHerokuSettings> {
    const response = await this.herokuAction<IHerokuSettingsResponse>(
      GET_SETTINGS_ENDPOINT
    );
    return response.settings;
  }

  get pathChanged(): ISignal<FileBrowserModel, IChangedArgs<string>> {
    return this._fileBrowserFactory.defaultBrowser.model.pathChanged;
  }

  get currentPath(): string {
    return this._fileBrowserFactory.defaultBrowser.model.path;
  }

  readonly _fileBrowserFactory: IFileBrowserFactory;
}
