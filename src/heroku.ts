import { ServerConnection } from "@jupyterlab/services";
import { URLExt } from "@jupyterlab/coreutils";

const LOGS_ENDPOINT = "/heroku/logs";

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

export class Heroku {
  constructor() {}

  async logs(): Promise<void> {
    const request = httpRequest(LOGS_ENDPOINT, "POST");
    const response = await request;
    if (!response.ok) {
      const data = await response.json();
      throw new ServerConnection.ResponseError(response, data.message);
    }
    return response.json();
  }
}
