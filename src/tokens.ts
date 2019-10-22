import { ReadonlyJSONObject } from "@phosphor/coreutils";
import { ISignal } from "@phosphor/signaling";

export namespace IHeroku {
  export interface IModel {
    path: string;

    procfile: string;
    runtime: string;
    dependencies: string;

    apps: IHeroku.IApp[];
    settings: IHeroku.ISettings;

    appsUpdated: ISignal<IHeroku.IModel, void>;
    pathChanged: ISignal<IHeroku.IModel, void>;

    refreshApps: () => Promise<void>;
    refreshSettings: () => Promise<boolean>;
    createApp: () => Promise<void>;
    logs: (app: string) => Promise<void>;
    deploy: () => Promise<void>;
    destroy: (app: string) => Promise<void>;
  }

  export interface IClient {
    logs(): Promise<ReadonlyJSONObject>;

    create(): Promise<ICreateResponse>;

    destroy(request: IDestroyRequest): Promise<IDestroyResponse>;

    apps(): Promise<IAppsResponse>;

    deploy(): Promise<IDeployResponse>;

    updateSettings(request: ISettingsRequest): Promise<void>;

    settings(): Promise<ISettingsResponse>;

    path: string;
  }

  export interface IApp {
    name: string;
    web_url: string;
    status?: string;
  }

  export interface ISettings {
    runtime?: string;
    dependencies?: string;
    procfile?: string;
  }

  // requests

  export interface IDestroyRequest {
    app: string;
  }

  export interface ISettingsRequest {
    settings: ISettings;
  }

  // responses

  export interface ICreateResponse {
    code: number;
    message?: string;
    app?: IApp;
  }

  export interface IDestroyResponse {}

  export interface IAppsResponse {
    code: number;
    apps: IApp[];
  }

  export interface IDeployResponse {
    code: number;
    message?: string;
  }

  export interface ISettingsResponse {
    code: number;
    message?: string;
    settings?: ISettings;
  }
}
