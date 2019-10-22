import { ServerConnection } from "@jupyterlab/services";

import { URLExt } from "@jupyterlab/coreutils";

import { ReadonlyJSONObject } from "@phosphor/coreutils";

import { IHeroku } from "./tokens";

const LOGS_ENDPOINT = "/heroku/logs";
const CREATE_ENDPOINT = "/heroku/create";
const DESTROY_ENDPOINT = "/heroku/destroy";
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

export class Client implements IHeroku.IClient {
  constructor(options: Client.IOptions) {}

  private async herokuAction<ReturnType>(
    endpoint: string,
    method: string = "POST",
    data: Object = {}
  ): Promise<ReturnType> {
    const path = this._path;
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

  async create(): Promise<IHeroku.ICreateResponse> {
    return this.herokuAction<IHeroku.ICreateResponse>(CREATE_ENDPOINT);
  }

  async destroy(
    request: IHeroku.IDestroyRequest
  ): Promise<IHeroku.IDestroyResponse> {
    const { app } = request;
    return this.herokuAction(DESTROY_ENDPOINT, "POST", { app });
  }

  async apps(): Promise<IHeroku.IAppsResponse> {
    const response = await this.herokuAction<IHeroku.IAppsResponse>(
      APPS_ENDPOINT
    );
    return response;
  }

  async deploy(): Promise<IHeroku.IDeployResponse> {
    const response = await this.herokuAction<IHeroku.IDeployResponse>(
      DEPLOY_ENDPOINT
    );
    return response;
  }

  async updateSettings(request: IHeroku.ISettingsRequest): Promise<void> {
    const { settings } = request;
    const response = await this.herokuAction<IHeroku.ISettingsResponse>(
      POST_SETTINGS_ENDPOINT,
      "POST",
      { ...settings }
    );
    if (response.message) {
      console.error(response.message);
    }
  }

  async settings(): Promise<IHeroku.ISettingsResponse> {
    const response = await this.herokuAction<IHeroku.ISettingsResponse>(
      GET_SETTINGS_ENDPOINT
    );
    return response;
  }

  get path() {
    return this._path;
  }

  set path(path: string) {
    this._path = path;
  }

  private _path: string | null = null;
}

export namespace Client {
  export interface IOptions {}
}
