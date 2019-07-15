import { ServerConnection } from "@jupyterlab/services";

import { URLExt } from "@jupyterlab/coreutils";

import { IFileBrowserFactory } from "@jupyterlab/filebrowser";
import { ReadonlyJSONObject } from "@phosphor/coreutils";

const LOGS_ENDPOINT = "/heroku/logs";
const APPS_ENDPOINT = "/heroku/apps";

function httpRequest(
  url: string,
  method: string,
  request?: Object
): Promise<Response> {
  let fullRequest = {
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

interface IHerokuAppsResponse {
  code: number;
  apps: IHerokuApps;
}

export class Heroku {
  constructor(fileBrowserFactory: IFileBrowserFactory) {
    this._fileBrowserFactory = fileBrowserFactory;
  }

  private getCurrentPath() {
    return this._fileBrowserFactory.defaultBrowser.model.path;
  }

  private async herokuAction<ReturnType>(
    endpoint: string
  ): Promise<ReturnType> {
    const path = this.getCurrentPath();
    const request = httpRequest(endpoint, "POST", { current_path: path });
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

  async apps(): Promise<IHerokuApps> {
    const response = await this.herokuAction<IHerokuAppsResponse>(
      APPS_ENDPOINT
    );
    return response.apps;
  }

  readonly _fileBrowserFactory: IFileBrowserFactory;
}
